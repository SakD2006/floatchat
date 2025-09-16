"""
Pydantic schemas for the /chat endpoint, defining the API contract.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    message: str
    session_id: str = Field(default="default_session", description="A unique identifier for the conversation session to maintain history.")

class ChatResponse(BaseModel):
    summary: str
    data: Optional[List[Dict[str, Any]]] = Field(default=None, description="Array of data objects for the frontend to plot, or null if no data.")