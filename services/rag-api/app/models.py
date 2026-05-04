from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class QueryRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)
    top_k: int | None = Field(default=None, ge=1, le=12)


class SourceCitation(BaseModel):
    source: str
    chunk_id: str
    text: str
    score: float | None = None


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceCitation]
    cached: bool = False


class IngestResponse(BaseModel):
    files: int
    chunks: int
    collection: str


class DocumentInfo(BaseModel):
    source: str
    chunks: int

