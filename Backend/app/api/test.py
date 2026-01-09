from fastapi import APIRouter

router = APIRouter(tags=["Test"])

@router.get("/")
async def read_test():
    return {
        "status": True,
        "data": {
            "message": "This is a test endpoint"
        }
    }


@router.get("/health")
async def read_health():
    return {
        "status": True,
        "data": {
            "message": "This is a health check endpoint"
        }
    }