"""
Main application file.
Initializes the FastAPI application, sets up CORS middleware, and includes API routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.v1 import router as api_v1_router

app = FastAPI(
    title="FloatChat AI Backend API", 
    version="1.0.0",
    description="AI-powered oceanographic data analysis service"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# Include API routes
app.include_router(api_v1_router.router, prefix="/api/v1")

@app.get("/", tags=["Root"])
async def read_root(): 
    return {
        "message": "Welcome to the FloatChat AI API. Visit /docs for documentation.",
        "version": "1.0.0",
        "status": "online"
    }