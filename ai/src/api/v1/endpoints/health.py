"""
Health check endpoint to verify that the API is running.
"""
from fastapi import APIRouter
from src.schemas.common import Message
router = APIRouter()

@router.get("/health", response_model=Message)
def get_health():
    """
    Simple health check endpoint.
    """
    return Message(message="OK")