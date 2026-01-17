from fastapi import APIRouter, Header, HTTPException, status

router = APIRouter(
    prefix="/api/test",
    tags=["Test"]
)

@router.get("/auth-header")
async def test_auth_header(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    return {"authorization_header": authorization}