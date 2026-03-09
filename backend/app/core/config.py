from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Tulasi AI"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production-super-secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./tulasi_ai.db"

    # AI Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")

    # Admin
    ADMIN_EMAIL: str = "admin@tulasi.ai"

    class Config:
        env_file = ".env"

settings = Settings()
