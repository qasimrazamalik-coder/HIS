import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from .config import Settings, get_settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _hash_password(password: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), b"rag-support-agent", 120_000).hex()


def _users(settings: Settings) -> dict[str, dict[str, str]]:
    return {
        settings.admin_email: {"password_hash": _hash_password(settings.admin_password), "role": "admin"},
        settings.user_email: {"password_hash": _hash_password(settings.user_password), "role": "user"},
    }


def authenticate(email: str, password: str, settings: Settings) -> dict[str, str] | None:
    user = _users(settings).get(email)
    if not user:
        return None
    if not hmac.compare_digest(user["password_hash"], _hash_password(password)):
        return None
    return {"email": email, "role": user["role"]}


def create_access_token(user: dict[str, str], settings: Settings) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    payload = {"sub": user["email"], "role": user["role"], "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def current_user(token: Annotated[str, Depends(oauth2_scheme)], settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, str]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc

    email = str(payload.get("sub", ""))
    role = str(payload.get("role", ""))
    if not email or role not in {"admin", "user"}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    return {"email": email, "role": role}


def require_admin(user: Annotated[dict[str, str], Depends(current_user)]) -> dict[str, str]:
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user
