from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .auth import authenticate, create_access_token, current_user, require_admin
from .config import Settings, get_settings
from .dependencies import get_rag_service
from .document_loader import SUPPORTED_EXTENSIONS
from .models import IngestResponse, LoginRequest, QueryRequest, QueryResponse, TokenResponse
from .rag import RAGService

app = FastAPI(title="AI Support Agent RAG API", version="1.0.0")

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, settings: Annotated[Settings, Depends(get_settings)]) -> TokenResponse:
    user = authenticate(payload.email, payload.password, settings)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(user, settings), role=user["role"])


@app.get("/auth/me")
def me(user: Annotated[dict[str, str], Depends(current_user)]) -> dict[str, str]:
    return user


@app.post("/query", response_model=QueryResponse)
def query(payload: QueryRequest, _: Annotated[dict[str, str], Depends(current_user)], rag: Annotated[RAGService, Depends(get_rag_service)]) -> QueryResponse:
    return rag.answer(payload.question, payload.top_k)


@app.post("/documents/ingest", response_model=IngestResponse)
def ingest(_: Annotated[dict[str, str], Depends(require_admin)], settings: Annotated[Settings, Depends(get_settings)], rag: Annotated[RAGService, Depends(get_rag_service)]) -> IngestResponse:
    files, chunks = rag.ingest_folder()
    return IngestResponse(files=files, chunks=chunks, collection=settings.collection_name)


@app.post("/documents/upload", response_model=IngestResponse)
async def upload_documents(
    _: Annotated[dict[str, str], Depends(require_admin)],
    settings: Annotated[Settings, Depends(get_settings)],
    rag: Annotated[RAGService, Depends(get_rag_service)],
    files: list[UploadFile] = File(...),
) -> IngestResponse:
    saved = 0
    for file in files:
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in SUPPORTED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")
        target = settings.documents_dir / Path(file.filename or "document").name
        target.write_bytes(await file.read())
        saved += 1
    _, chunks = rag.ingest_folder()
    return IngestResponse(files=saved, chunks=chunks, collection=settings.collection_name)


@app.get("/documents")
def list_documents(_: Annotated[dict[str, str], Depends(current_user)], rag: Annotated[RAGService, Depends(get_rag_service)]):
    return {"documents": rag.vector_store.documents()}

