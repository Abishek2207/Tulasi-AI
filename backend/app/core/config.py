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

    # AI Keys — support both GOOGLE_API_KEY and GEMINI_API_KEY (alias)
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")

    # Supabase (optional)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # Admin
    ADMIN_EMAIL: str = "admin@tulasi.ai"

    @property
    def effective_gemini_key(self) -> str:
        """Returns whichever Gemini API key is set (GOOGLE_API_KEY takes priority)."""
        return self.GOOGLE_API_KEY or self.GEMINI_API_KEY

    class Config:
        env_file = ".env"

settings = Settings()
