import hashlib

from .cache import TTLCache
from .chunking import split_text
from .config import Settings
from .document_loader import load_folder
from .llm import LLMProvider
from .models import QueryResponse
from .vector_store import VectorStore


class RAGService:
    def __init__(self, settings: Settings, vector_store: VectorStore, llm: LLMProvider) -> None:
        self.settings = settings
        self.vector_store = vector_store
        self.llm = llm
        self.cache: TTLCache[QueryResponse] = TTLCache(ttl_seconds=settings.cache_ttl_seconds)

    def ingest_folder(self) -> tuple[int, int]:
        documents = load_folder(self.settings.documents_dir)
        chunks = []
        for document in documents:
            chunks.extend(split_text(document.source, document.text, self.settings.chunk_size, self.settings.chunk_overlap))
        inserted = self.vector_store.upsert_chunks(chunks)
        self.cache.clear()
        return len(documents), inserted

    def answer(self, question: str, top_k: int | None = None) -> QueryResponse:
        cache_key = hashlib.sha256(f"{question}:{top_k or self.settings.retrieval_k}".encode("utf-8")).hexdigest()
        cached = self.cache.get(cache_key)
        if cached:
            return cached.model_copy(update={"cached": True})

        sources = self.vector_store.search(question, top_k or self.settings.retrieval_k)
        answer = self.llm.answer(question, sources)
        response = QueryResponse(answer=answer, sources=sources, cached=False)
        self.cache.set(cache_key, response)
        return response

