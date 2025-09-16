"""
Main application file.
Initializes the FastAPI application, sets up CORS middleware, and includes API routers.
"""
"""
Main application file.
"""
# In src/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.v1 import router as api_v1_router # This line must start with 'src.'

app = FastAPI(title="FloatChat Backend API", version="1.0.0")
# ... (rest of the file)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(api_v1_router.router, prefix="/api/v1")
@app.get("/", tags=["Root"])
async def read_root(): return {"message": "Welcome to the FloatChat API. Visit /docs for documentation."}