"""
Aggregates all API routers for version 1.
"""
from fastapi import APIRouter
from src.api.v1.endpoints import chat, health # MODIFIED

router = APIRouter()
router.include_router(health.router, tags=["Health"])
router.include_router(chat.router, tags=["Chat"])