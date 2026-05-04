from pathlib import Path

from fastapi.testclient import TestClient

from app.config import get_settings
from app.dependencies import get_rag_service
from app.main import app


def override_settings(tmp_path: Path):
    settings = get_settings()
    settings.data_dir = tmp_path
    settings.documents_dir = tmp_path / "documents"
    settings.chroma_dir = tmp_path / "chroma"
    settings.collection_name = "test_support"
    settings.documents_dir.mkdir(parents=True, exist_ok=True)
    settings.chroma_dir.mkdir(parents=True, exist_ok=True)
    return settings


def test_login_query_and_ingest(tmp_path):
    get_settings.cache_clear()
    get_rag_service.cache_clear()
    settings = override_settings(tmp_path)
    (settings.documents_dir / "policy.txt").write_text("Refunds are available within 30 days with a receipt.", encoding="utf-8")

    client = TestClient(app)
    login = client.post("/auth/login", json={"email": settings.admin_email, "password": settings.admin_password})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    ingest = client.post("/documents/ingest", headers=headers)
    assert ingest.status_code == 200
    assert ingest.json()["chunks"] >= 1

    answer = client.post("/query", headers=headers, json={"question": "When are refunds available?"})
    assert answer.status_code == 200
    body = answer.json()
    assert body["sources"]
    assert body["sources"][0]["source"] == "policy.txt"

