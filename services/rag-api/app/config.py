from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Support Agent"
    data_dir: Path = Path("data")
    documents_dir: Path = Path("data/documents")
    chroma_dir: Path = Path("data/chroma")
    collection_name: str = "support_knowledge"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 120
    admin_email: str = "admin@example.com"
    admin_password: str = "admin12345"
    user_email: str = "user@example.com"
    user_password: str = "user12345"
    embedding_provider: str = "local"
    llm_provider: str = "local"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    chunk_size: int = 900
    chunk_overlap: int = 160
    retrieval_k: int = 5
    cache_ttl_seconds: int = 300
    cors_origins: str = "http://localhost:5174,http://127.0.0.1:5174"

    class Config:
        env_prefix = "RAG_"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.documents_dir.mkdir(parents=True, exist_ok=True)
    settings.chroma_dir.mkdir(parents=True, exist_ok=True)
    return settings

