from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Tulasi AI"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production-super-secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days to match NextAuth

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ai_platform.db")

    @property
    def normalized_database_url(self) -> str:
        """SQLAlchemy requires postgresql:// instead of postgres://.
        Supabase also requires sslmode=require for external connections."""
        url = self.DATABASE_URL
        # Fix relative SQLite path to absolute project root path
        if url.startswith("sqlite:///./"):
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            db_name = url.replace("sqlite:///./", "")
            # Ensure windows paths use forward slashes for sqlite url
            abs_db_path = os.path.join(project_root, db_name).replace("\\", "/")
            url = f"sqlite:///{abs_db_path}"
            
        # Fix Heroku/Supabase shorthand URL scheme
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        # Add SSL for any non-SQLite PostgreSQL connection
        if url.startswith("postgresql://") and "sslmode" not in url:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}sslmode=require"
        return url

    # AI Keys — support both GOOGLE_API_KEY and GEMINI_API_KEY (alias)
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemma-2-9b-it:free")
    LANGFLOW_API_URL: str = os.getenv("LANGFLOW_API_URL", "")  # Optional: set to enable Langflow pipeline

    # Supabase (optional)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # Admin
    ADMIN_EMAILS_RAW: str = os.getenv("ADMIN_EMAILS", "abishekramamoorthy22@gmail.com,abishek2207@gmail.com")

    @property
    def admin_emails(self) -> list[str]:
        return [email.strip().lower() for email in self.ADMIN_EMAILS_RAW.split(",") if email.strip()]

    @property
    def effective_gemini_key(self) -> str:
        """Returns whichever Gemini API key is set (GOOGLE_API_KEY takes priority)."""
        return self.GOOGLE_API_KEY or self.GEMINI_API_KEY

    model_config = SettingsConfigDict(env_file=[".env", "../.env"], extra="allow")

settings = Settings()
