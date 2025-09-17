#!/usr/bin/env python3
"""
Startup script for the FloatChat AI service with optimized timeout settings
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        timeout_keep_alive=300,  # 5 minutes keep-alive
        timeout_graceful_shutdown=60,  # 1 minute graceful shutdown
        access_log=True,
        log_level="info"
    )