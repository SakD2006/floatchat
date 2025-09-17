import re
from operator import itemgetter

from src.core.config import settings
from src.database.utils import execute_sql_to_df

# LangChain Imports
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_community.utilities import SQLDatabase
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings # Using the recommended package
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

# --- 1. Initialize Components ---

# Initialize the LLM to use Groq
llm = ChatGroq(
    temperature=0,
    groq_api_key=settings.GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile" # NOTE: Ensure this is an active model in your Groq console
)

# Initialize the Embedding Model to use a local, open-source model
print("Initializing local embedding model. This may take a moment on first run...")
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': False}
)
print("Local embedding model loaded successfully.")

# Initialize Vector Store, Retriever, and DB Connection
vectorstore = Chroma(persist_directory="./data/chroma_db", embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
db = SQLDatabase.from_uri(settings.DATABASE_URL)

def get_schema(_):
    # Only include the relevant tables for the LLM to prevent confusion
    return db.get_table_info(table_names=["floats", "profiles", "measurements"])

# --- 2. Define the RAG Tool with Updated Schema Logic ---

def extract_sql_from_response(response: str) -> str:
    """
    Extracts the SQL query from a markdown code block or a direct response.
    """
    match = re.search(r"```sql\s*(.*?)\s*```", response, re.DOTALL)
    if match:
        return match.group(1).strip()
    if response.strip().upper().startswith("SELECT"):
        return response.strip()
    return response

class ArgoDataInput(BaseModel):
    question: str = Field(description="A detailed question about ARGO oceanographic data, including locations, dates, and specific parameters like salinity or chlorophyll if known.")

@tool(args_schema=ArgoDataInput)
def argo_ocean_data_retriever(question: str) -> dict:
    """
    Use this tool to answer questions about ARGO oceanographic data from a PostgreSQL/PostGIS database.
    This tool is ideal for querying physical and BioGeoChemical (BGC) data by joining the floats, profiles, and measurements tables.
    """
    SQL_PROMPT_TEMPLATE = """You are an expert PostGIS and PostgreSQL query writer. Given a user question, create a syntactically correct query to run.

**Database Schema:**
You will be querying three main tables: `floats`, `profiles`, and `measurements`.
- The `floats` table has float metadata like `platform_id` and `float_type`.
- The `profiles` table has profile-specific data like `profile_date` and the geographic `location`. It links to `floats` via `platform_id`.
- The `measurements` table has the scientific data like `pressure`, `temperature`, `salinity`, `doxy`, `chla`, etc. It links to `profiles` via `profile_id`.

**Querying Instructions:**
1.  **JOINs (VERY IMPORTANT):**
    - To get float metadata and profile data, you MUST JOIN `floats` (aliased as `f`) and `profiles` (aliased as `p`) on `f.platform_id = p.platform_id`.
    - To get scientific measurements, you MUST JOIN `profiles` (aliased as `p`) and `measurements` (aliased as `m`) on `p.profile_id = m.profile_id`.
    - For queries involving all three, you MUST perform a three-way JOIN: `FROM floats f JOIN profiles p ON f.platform_id = p.platform_id JOIN measurements m ON p.profile_id = m.profile_id`.
2.  **Column Locations:**
    - `float_type` is in the `floats` table (`f.float_type`).
    - `location` (for spatial queries) is in the `profiles` table (`p.location`).
    - `temperature`, `salinity`, `pressure`, `doxy`, `chla`, `nitrate` are in the `measurements` table (`m.temperature`, `m.salinity`, etc.).
3.  **Spatial Queries:** To find profiles near a location, use the PostGIS function `ST_DWithin` on the `profiles.location` column.
    - Syntax: `ST_DWithin(p.location, ST_GeographyFromText('SRID=4326;POINT(longitude latitude)'), distance_in_meters)`
    - Example for "within 100km of Chennai (80.27 E, 13.08 N)":
      `WHERE ST_DWithin(p.location, ST_GeographyFromText('SRID=4326;POINT(80.27 13.08)'), 100000)`

**Parameter Units and Details:**
- `pressure`: Decibar (db), equivalent to depth.
- `temperature`: degrees Celsius (°C).
- `salinity`: Practical Salinity Unit (psu).
- `doxy`: Dissolved Oxygen, in micromole/kg.
- `chla`: Chlorophyll-a, in mg/m³.
- `nitrate`: Nitrate, in micromole/kg.

Always limit your results to 100 rows unless the user specifies otherwise.

**Context from relevant data profiles:**
{context}

**Question:** {question}
**SQLQuery:**
**IMPORTANT: You must only output the SQL query itself, starting with SELECT. Do not include any other text, explanation, or markdown formatting.**
"""
    sql_prompt = ChatPromptTemplate.from_template(SQL_PROMPT_TEMPLATE)

    sql_generation_chain = (
        RunnablePassthrough.assign(
            schema=get_schema,
            context=itemgetter("question") | retriever,
        )
        | sql_prompt
        | llm.bind(stop=["\nSQLResult:"])
        | StrOutputParser()
    )

    llm_output = sql_generation_chain.invoke({"question": question})
    print(f"LLM Output:\n{llm_output}")

    generated_sql = extract_sql_from_response(llm_output)
    print(f"Extracted SQL: {generated_sql}")
    
    result_df = execute_sql_to_df(generated_sql)
    if result_df.empty:
        return {"summary": "I couldn't find any data matching your query.", "table_data": None}

    RESPONSE_PROMPT_TEMPLATE = """Based on the user's question, the SQL query, and the result, formulate a natural language response.
Summarize the key findings. If units are relevant, include them (e.g., Temperature in °C, Salinity in psu, Chlorophyll in mg/m³).
Question: {question}
SQL Query: {query}
SQL Result: {result}
Response:
"""
    response_prompt = ChatPromptTemplate.from_template(RESPONSE_PROMPT_TEMPLATE)
    final_response_chain = response_prompt | llm | StrOutputParser()

    final_summary = final_response_chain.invoke({
        "question": question,
        "query": generated_sql,
        "result": result_df.to_string(index=False),
    })

    return {
        "summary": final_summary,
        "table_data": result_df.to_dict(orient='records'),
    }

# --- 3. Create the Agent and Add Chat History ---

tools = [argo_ocean_data_retriever]

agent_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant for oceanographic data analysis. Use the provided tools to answer user questions."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_openai_tools_agent(llm, tools, agent_prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

message_history_store = {}

def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in message_history_store:
        message_history_store[session_id] = ChatMessageHistory()
    return message_history_store[session_id]

agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)