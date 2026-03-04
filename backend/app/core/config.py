from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tulasi AI Base API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # DB (Supabase)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # AI models
    HF_TOKEN: str = ""
    
    # Cloudflare R2
    CLOUDFLARE_R2_ACCESS_KEY_ID: str = ""
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: str = ""
    CLOUDFLARE_R2_ENDPOINT_URL: str = ""
    CLOUDFLARE_R2_BUCKET_NAME: str = "tulasiai-storage"

    # Security
    JWT_SECRET: str = "supersecretkey_change_in_prod"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache()
def get_settings() -> Settings:
    return Settings()
