from datetime import datetime, timezone, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña coincide con su hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """Genera un JWT de acceso."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {
        "sub": subject,
        "exp": expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> str | None:
    """Decodifica un JWT y retorna el subject. Retorna None si es inválido."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        subject: str | None = payload.get("sub")
        return subject
    except JWTError:
        return None