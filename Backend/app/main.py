from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.lib.config import settings
import logging
from fastapi.staticfiles import StaticFiles
import shutil
import os

# Configure logging
logging.getLogger('passlib').setLevel(logging.ERROR)

app = FastAPI(
    icon="🚀",
    title="Exam System API",
    description="API for Exam System",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redocs" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None
)

# Serve static files from /public
app.mount("/public", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../public")), name="public")

# Image upload endpoint
@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    public_dir = os.path.join(os.path.dirname(__file__), "../public")
    os.makedirs(public_dir, exist_ok=True)
    file_path = os.path.join(public_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    url = f"/public/{file.filename}"
    return {"url": url}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.ALLOWED_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

# Import routers AFTER app is created
from app.api import (
    test_router,
    auth_router,
    exam_router,
    course_router,
    user_router,
    result_router
)

# Include routers
app.include_router(test_router)
app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(course_router)
app.include_router(user_router)
app.include_router(result_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )