"""
Common Pydantic schemas used across multiple endpoints.
"""
from pydantic import BaseModel

class Message(BaseModel):
    message: str