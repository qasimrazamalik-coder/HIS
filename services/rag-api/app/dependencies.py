from functools import lru_cache

from .config import get_settings
from .embeddings import create_embedding_provider
from .llm import create_llm_provider
from .rag import RAGService
from .vector_store import VectorStore


@lru_cache
def get_rag_service() -> RAGService:
    settings = get_settings()
    embeddings = create_embedding_provider(settings)
    vector_store = VectorStore(settings, embeddings)
    llm = create_llm_provider(settings)
    return RAGService(settings, vector_store, llm)

