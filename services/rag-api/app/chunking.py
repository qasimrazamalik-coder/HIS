from dataclasses import dataclass


@dataclass
class TextChunk:
    id: str
    source: str
    text: str
    index: int


def split_text(source: str, text: str, chunk_size: int, overlap: int) -> list[TextChunk]:
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")

    chunks: list[TextChunk] = []
    start = 0
    index = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        window = text[start:end]
        if end < len(text):
            boundary = max(window.rfind("\n"), window.rfind(". "), window.rfind("? "), window.rfind("! "))
            if boundary > chunk_size * 0.55:
                end = start + boundary + 1
                window = text[start:end]

        normalized = window.strip()
        if normalized:
            chunks.append(TextChunk(id=f"{source}:{index}", source=source, text=normalized, index=index))
            index += 1
        if end >= len(text):
            break
        start = max(0, end - overlap)
    return chunks

