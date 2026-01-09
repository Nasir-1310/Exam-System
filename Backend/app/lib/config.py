from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
        
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    ALLOWED_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE"]
    ALLOWED_HEADERS: List[str] = ["*", "Authorization"]
    ALLOWED_CREDENTIALS: bool = True

    # Application
    SECRET_KEY: str = "asd2e3pirhw9frweprfuwepiufwe_secret_key_for_jwt"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ACCESS_TOKEN_EXPIRE_DAYS: int = 0
    ACCESS_TOKEN_EXPIRE_HOURS: int = 0
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()