"""
The main chat endpoint that interacts with the LangChain RAG agent.
"""
from fastapi import APIRouter
from src.schemas.chat import ChatRequest, ChatResponse # MODIFIED
from src.llm.rag_pipeline import agent_with_chat_history # MODIFIED

router = APIRouter()
@router.post("/chat", response_model=ChatResponse)
async def handle_chat_message(request: ChatRequest):
    """
    Handles a user's chat message.
    Invokes the LangChain agent to get a summary and relevant data.
    The backend is NOT responsible for plotting; it only provides the raw data.
    """
    # Use the session_id from the request to maintain conversation history for each user
    config = {"configurable": {"session_id": request.session_id}}
    
    # Invoke the agent
    agent_result = agent_with_chat_history.invoke({"input": request.message}, config=config)
    
    agent_output = agent_result.get('output', {})

    summary = ""
    data_for_frontend = None
    
    # Check if the tool was called and returned our structured dictionary
    if isinstance(agent_output, dict):
        summary = agent_output.get("summary", "The tool executed but did not provide a summary.")
        data_for_frontend = agent_output.get("table_data")
    else:
        # The LLM responded directly without using a tool
        summary = str(agent_output)

    return ChatResponse(
        summary=summary,
        data=data_for_frontend
    )