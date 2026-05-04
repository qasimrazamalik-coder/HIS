from collections import Counter
import math

try:
    import chromadb
except ImportError:  # pragma: no cover - exercised on platforms without chroma-hnswlib wheels
    chromadb = None

from .chunking import TextChunk
from .config import Settings
from .embeddings import EmbeddingProvider
from .models import DocumentInfo, SourceCitation


class VectorStore:
    def __init__(self, settings: Settings, embeddings: EmbeddingProvider) -> None:
        self.settings = settings
        self.embeddings = embeddings
        self._memory_items: dict[str, tuple[list[float], str, dict[str, int | str]]] = {}
        if chromadb:
            self.client = chromadb.PersistentClient(path=str(settings.chroma_dir))
            self.collection = self.client.get_or_create_collection(name=settings.collection_name, metadata={"hnsw:space": "cosine"})
        else:
            self.client = None
            self.collection = None

    def upsert_chunks(self, chunks: list[TextChunk]) -> int:
        if not chunks:
            return 0
        vectors = self.embeddings.embed([chunk.text for chunk in chunks])
        if self.collection:
            self.collection.upsert(
                ids=[chunk.id for chunk in chunks],
                documents=[chunk.text for chunk in chunks],
                embeddings=vectors,
                metadatas=[{"source": chunk.source, "index": chunk.index} for chunk in chunks],
            )
        else:
            for chunk, vector in zip(chunks, vectors):
                self._memory_items[chunk.id] = (vector, chunk.text, {"source": chunk.source, "index": chunk.index})
        return len(chunks)

    def search(self, query: str, top_k: int) -> list[SourceCitation]:
        query_embedding = self.embeddings.embed([query])[0]
        if not self.collection:
            ranked = sorted(
                (
                    (chunk_id, document, metadata, _cosine_similarity(query_embedding, vector))
                    for chunk_id, (vector, document, metadata) in self._memory_items.items()
                ),
                key=lambda item: item[3],
                reverse=True,
            )[:top_k]
            return [
                SourceCitation(source=str(metadata.get("source", "unknown")), chunk_id=chunk_id, text=document, score=score)
                for chunk_id, document, metadata, score in ranked
            ]

        result = self.collection.query(query_embeddings=[query_embedding], n_results=top_k)
        documents = result.get("documents", [[]])[0]
        ids = result.get("ids", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]

        citations: list[SourceCitation] = []
        for chunk_id, document, metadata, distance in zip(ids, documents, metadatas, distances):
            citations.append(
                SourceCitation(
                    source=str(metadata.get("source", "unknown")),
                    chunk_id=str(chunk_id),
                    text=str(document),
                    score=1 - float(distance) if distance is not None else None,
                )
            )
        return citations

    def documents(self) -> list[DocumentInfo]:
        if not self.collection:
            counts = Counter(str(metadata.get("source", "unknown")) for _, _, metadata in self._memory_items.values())
            return [DocumentInfo(source=source, chunks=count) for source, count in sorted(counts.items())]

        result = self.collection.get(include=["metadatas"])
        counts = Counter(str(metadata.get("source", "unknown")) for metadata in result.get("metadatas", []))
        return [DocumentInfo(source=source, chunks=count) for source, count in sorted(counts.items())]


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(left * right for left, right in zip(a, b))
    norm_a = math.sqrt(sum(value * value for value in a)) or 1.0
    norm_b = math.sqrt(sum(value * value for value in b)) or 1.0
    return dot / (norm_a * norm_b)
