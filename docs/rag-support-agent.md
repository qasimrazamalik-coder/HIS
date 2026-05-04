# AI Support Agent With RAG

This app is a job-ready retrieval augmented generation support agent. It ingests PDF, DOCX, TXT, and Markdown files, chunks and embeds them, stores vectors in ChromaDB, retrieves relevant context, and answers questions with source citations.

## Features

- FastAPI backend with JWT authentication and admin/user roles
- Document ingestion for `.pdf`, `.docx`, `.txt`, and `.md`
- Text cleaning, chunking, overlap, and metadata preservation
- ChromaDB persistent vector storage
- Local deterministic embeddings for development and optional OpenAI embeddings for production
- Local extractive answer provider for offline development and optional OpenAI chat generation
- TTL cache for repeated questions
- React frontend with login, Q&A, source highlights, and document upload
- Docker Compose deployment
- Unit tests for the API and web shell

## Quick Start

```bash
docker compose -f docker-compose.rag.yml up --build
```

Open:

- Frontend: `http://localhost:5174`
- API: `http://localhost:8100/health`

Default local credentials:

- Admin: `admin@example.com` / `admin12345`
- User: `user@example.com` / `user12345`

## Local Development

Backend:

```bash
cd services/rag-api
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:PYTHONPATH="."
uvicorn app.main:app --reload --port 8100
```

Frontend:

```bash
npm install
npm run dev -w apps/rag-web
```

## OpenAI Mode

By default the app runs without external API calls. To use OpenAI for embeddings and generation:

```bash
$env:RAG_OPENAI_API_KEY="..."
$env:RAG_EMBEDDING_PROVIDER="openai"
$env:RAG_LLM_PROVIDER="openai"
$env:RAG_OPENAI_MODEL="gpt-4o-mini"
$env:RAG_OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
```

## API

Authentication:

- `POST /auth/login`
- `GET /auth/me`

Documents:

- `POST /documents/upload` admin only
- `POST /documents/ingest` admin only
- `GET /documents`

RAG:

- `POST /query`

Example query:

```json
{
  "question": "What does the refund policy say?",
  "top_k": 5
}
```

Response:

```json
{
  "answer": "...",
  "sources": [
    {
      "source": "policy.txt",
      "chunk_id": "policy.txt:0",
      "text": "Refunds are available...",
      "score": 0.82
    }
  ],
  "cached": false
}
```

## Production Notes

- Replace default credentials and `RAG_JWT_SECRET`.
- Use managed persistent storage for Chroma or swap the vector store adapter for Pinecone.
- Use OpenAI, Azure OpenAI, or a hosted Llama3 endpoint for production generation.
- Put the API behind TLS and enforce upload size limits at the ingress layer.
- Add malware scanning for uploaded files before indexing.
- Keep citation text in responses so users can verify generated answers.

## Tests

```bash
npm run build -w apps/rag-web
npm run test -w apps/rag-web
$env:PYTHONPATH="services/rag-api"; pytest services/rag-api/tests
```

