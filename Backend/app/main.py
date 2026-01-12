from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.lib.config import settings
from dotenv import load_dotenv
load_dotenv()

from app.api import (
    test_router,
    auth_router,
    exam_router,
    course_router,
)

import logging
logging.getLogger('passlib').setLevel(logging.ERROR)


app = FastAPI(
    title="BCS Exam System API",
    description="API for BCS Exam System Application",
    version="1.0.0",
    icon="🚀",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.ALLOWED_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

app.include_router(test_router)
app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(course_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )