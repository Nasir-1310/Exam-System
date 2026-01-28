# Backend/app/lib/config.py
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
        
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://alokbortikaedu.com:3000,http://alokbortikaedu.com"
    ALLOWED_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE"]
    ALLOWED_HEADERS: List[str] = ["*", "Authorization"]
    ALLOWED_CREDENTIALS: bool = True
    
    # Application
    SECRET_KEY: str = "asd2e3pirhw9frweprfuwepiufwe_secret_key_for_jwt"
    ALGORITHM: str = "HS256"
    TOKEN_EXPIRE_MINUTES: int = 60
    TOKEN_EXPIRE_DAYS: int = 0
    TOKEN_EXPIRE_HOURS: int = 0
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # ========================================================================
    # ADDED FOR: PC Image Upload Feature
    # File Upload Configuration (Local Storage in Backend/uploads/questions)
    # ========================================================================
    UPLOAD_DIR: str = "uploads/questions"  # ✅ CHANGED: Relative to Backend root
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB in bytes
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    # ========================================================================
    
    # ========================================================================
    # 🔄 FUTURE AWS S3 CONFIGURATION (Uncomment when migrating to AWS)
    # Add these to your .env file when ready to use AWS S3
    # ========================================================================
    # AWS_ACCESS_KEY_ID: Optional[str] = None
    # AWS_SECRET_ACCESS_KEY: Optional[str] = None
    # AWS_REGION: str = "ap-south-1"  # Mumbai region (closest to Bangladesh)
    # AWS_S3_BUCKET_NAME: Optional[str] = None
    # S3_USE_SSL: bool = True
    # S3_PUBLIC_URL_EXPIRY: int = 3600  # URL expiry in seconds (1 hour)
    # ========================================================================
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

# ============================================================================
# 🔄 AWS S3 MIGRATION GUIDE
# ============================================================================
# 
# When you're ready to migrate to AWS S3:
# 
# 1. ADD TO .env FILE:
#    AWS_ACCESS_KEY_ID=AKIA...
#    AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI...
#    AWS_REGION=ap-south-1
#    AWS_S3_BUCKET_NAME=exam-system-uploads
# 
# 2. INSTALL BOTO3:
#    pip install boto3
# 
# 3. UNCOMMENT AWS settings above
# 
# 4. UPDATE Backend/app/api/upload.py to use S3 functions
# 
# 5. CREATE S3 BUCKET:
#    - Go to AWS Console > S3
#    - Create bucket with public read access
#    - Set CORS policy for your frontend domains
# 
# ============================================================================