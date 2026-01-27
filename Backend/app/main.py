# Backend/app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import os
from pathlib import Path

load_dotenv()

from app.api import upload
from app.lib.config import settings
import logging
from fastapi.staticfiles import StaticFiles
import shutil
import os

logging.getLogger('passlib').setLevel(logging.ERROR)

app = FastAPI(
    icon="🚀",
    title="Exam System API",
    description="API for Exam System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.ALLOWED_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

from app.api import (
    test_router,
    auth_router,
    exam_router,
    course_router,
    user_router,
    result_router
)


@app.get("/")
async def root():
    return {"message": "Welcome to the Exam System API!"}

# Include routers
app.include_router(test_router)
app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(course_router)
app.include_router(user_router)
app.include_router(upload.router)  # ✅ No prefix needed - already in router

# ✅ Mount static files AFTER including routers
BACKEND_ROOT = Path(__file__).resolve().parent.parent
uploads_path = BACKEND_ROOT / "uploads"
uploads_path.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )