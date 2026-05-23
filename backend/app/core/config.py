from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str = "gsk_dev_placeholder"
    hf_token: str = "hf_dev_placeholder"
    secret_key: str = "dev-secret-key-change-me"
    database_url: str = "sqlite+aiosqlite:///./calmara.db"
    access_token_expire_days: int = 7
    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings() -> Settings:
    return Settings()
