"""
Tests for the /api/v1/chat endpoint.

These tests use mocking to isolate the API endpoint logic from the
LangChain agent and external services (LLM, databases). This ensures
that the tests are fast, deterministic, and do not incur API costs.
"""
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

# Create a TestClient instance to make requests to our FastAPI app
client = TestClient(app)

def test_chat_endpoint_with_tool_call():
    """
    Tests the chat endpoint for a scenario where the agent successfully calls a tool
    and returns structured data.
    """
    # 1. Define the mock response we want our agent to return.
    # This simulates the tool finding data and generating a summary.
    mock_agent_response = {
        'output': {
            'summary': 'I found data for BGC floats near Chennai.',
            'table_data': [
                {'latitude': 13.08, 'longitude': 80.27, 'chla': 0.5},
                {'latitude': 13.09, 'longitude': 80.28, 'chla': 0.6}
            ]
        }
    }
    
    # 2. Use 'patch' to replace the actual agent's 'invoke' method.
    # The string 'app.api.v1.endpoints.chat.agent_with_chat_history.invoke' is the
    # path to the function we want to mock.
    with patch('app.api.v1.endpoints.chat.agent_with_chat_history.invoke', return_value=mock_agent_response) as mock_invoke:
        # 3. Make a request to our API endpoint.
        request_body = {
            "message": "Show me BGC floats near Chennai",
            "session_id": "test-session-1"
        }
        response = client.post("/api/v1/chat", json=request_body)

        # 4. Assert that our mock function was called correctly.
        mock_invoke.assert_called_once_with(
            {'input': 'Show me BGC floats near Chennai'},
            config={'configurable': {'session_id': 'test-session-1'}}
        )

        # 5. Assert that the API response is correct.
        assert response.status_code == 200
        response_json = response.json()
        assert response_json['summary'] == 'I found data for BGC floats near Chennai.'
        assert len(response_json['data']) == 2
        assert response_json['data'][0]['chla'] == 0.5


def test_chat_endpoint_with_direct_answer():
    """
    Tests the chat endpoint for a scenario where the agent responds directly
    without calling a tool (e.g., a conversational greeting).
    """
    # 1. Define the mock response for a direct answer.
    # The 'output' is a simple string, not a dictionary.
    mock_agent_response = {
        'output': 'Hello! As of September 16, 2025, I am ready to assist you. How can I help you with ARGO data today?'
    }

    # 2. Patch the agent's invoke method.
    with patch('app.api.v1.endpoints.chat.agent_with_chat_history.invoke', return_value=mock_agent_response) as mock_invoke:
        # 3. Make the request to the API.
        request_body = {
            "message": "Hello",
            "session_id": "test-session-2"
        }
        response = client.post("/api/v1/chat", json=request_body)

        # 4. Assert that our mock was called.
        mock_invoke.assert_called_once()

        # 5. Assert that the API response is correctly formatted.
        assert response.status_code == 200
        response_json = response.json()
        assert response_json['summary'] == 'Hello! As of September 16, 2025, I am ready to assist you. How can I help you with ARGO data today?'
        assert response_json['data'] is None


def test_chat_endpoint_when_tool_finds_no_data():
    """
    Tests the chat endpoint for a scenario where the tool is called
    but finds no data in the database.
    """
    # 1. Define the mock response for a "no data found" scenario.
    mock_agent_response = {
        'output': {
            'summary': "I searched for the data, but couldn't find any matching profiles.",
            'table_data': None
        }
    }
    
    # 2. Patch the agent's invoke method.
    with patch('app.api.v1.endpoints.chat.agent_with_chat_history.invoke', return_value=mock_agent_response) as mock_invoke:
        # 3. Make the request.
        request_body = {
            "message": "Find floats in the Sahara Desert",
            "session_id": "test-session-3"
        }
        response = client.post("/api/v1/chat", json=request_body)

        # 4. Assert the mock was called.
        mock_invoke.assert_called_once()
        
        # 5. Assert the response is correct.
        assert response.status_code == 200
        response_json = response.json()
        assert response_json['summary'] == "I searched for the data, but couldn't find any matching profiles."
        assert response_json['data'] is None