from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.user_service import get_user_by_mobile
from app.utils.hashing import verify_password
from app.utils.jwt import create_access_token, get_current_user
from app.schemas.user import UserResponse
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
	user = get_user_by_mobile(db, payload.mobile)
	print("User fetched from DB:", user)
	print("Verifying password for user:", payload.mobile, payload.password)
	if not user or not verify_password(payload.password, user.hashed_password):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
	token = create_access_token(user_id=user.id, role="admin" if user.is_admin else "user")
	return TokenResponse(access_token=token)



@router.post("/login/docs")
def login_docs(db: Session = Depends(get_db), username: str = Form(), password: str = Form()):
	print("Login payload received:", username, password)
	user = get_user_by_mobile(db, username)
	print("User fetched from DB:", user)
	try:
		if not user or not verify_password(password, user.hashed_password):
			raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
		
		token = create_access_token(user_id=user.id, role="admin" if user.is_admin else "user")
		return {
			"access_token": token, 
			"token_type": "bearer"
		}
	except Exception as e:
		print("Error during login:", str(e))
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/session", response_model=UserResponse)
def session(current_user = Depends(get_current_user)):
	return current_user


@router.get("/profile", response_model=UserResponse)
def profile(current_user = Depends(get_current_user)):
	return current_user