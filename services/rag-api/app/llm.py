from abc import ABC, abstractmethod

from openai import OpenAI

from .config import Settings
from .models import SourceCitation


class LLMProvider(ABC):
    @abstractmethod
    def answer(self, question: str, sources: list[SourceCitation]) -> str:
        raise NotImplementedError


class LocalLLMProvider(LLMProvider):
    def answer(self, question: str, sources: list[SourceCitation]) -> str:
        if not sources:
            return "I could not find relevant information in the knowledge base."
        bullets = "\n".join(f"- {source.text[:420].strip()}" for source in sources[:3])
        return (
            "Based on the retrieved knowledge base context, here is the best supported answer.\n\n"
            f"Question: {question}\n\n"
            f"Relevant evidence:\n{bullets}\n\n"
            "Use the cited sources below to verify details before taking action."
        )


class OpenAILLMProvider(LLMProvider):
    def __init__(self, settings: Settings) -> None:
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    def answer(self, question: str, sources: list[SourceCitation]) -> str:
        context = "\n\n".join(f"[{idx + 1}] {source.source} / {source.chunk_id}\n{source.text}" for idx, source in enumerate(sources))
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a concise support agent. Answer only from provided context. Cite sources by bracket number.",
                },
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
            ],
            temperature=0.2,
        )
        return response.choices[0].message.content or ""


def create_llm_provider(settings: Settings) -> LLMProvider:
    if settings.llm_provider == "openai" and settings.openai_api_key:
        return OpenAILLMProvider(settings)
    return LocalLLMProvider()

