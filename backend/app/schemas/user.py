import uuid
from datetime import datetime

from sqlmodel import SQLModel


class RoleRead(SQLModel):
    """Schema de lectura de rol."""

    id: uuid.UUID
    name: str
    description: str | None


class UserCreate(SQLModel):
    """Schema de creación de usuario."""

    email: str
    password: str
    full_name: str


class UserRead(SQLModel):
    """Schema de lectura de usuario."""

    id: uuid.UUID
    email: str
    full_name: str
    is_active: bool
    role: RoleRead
    created_at: datetime


class UserUpdate(SQLModel):
    """Schema de actualización de usuario."""

    full_name: str | None = None
    is_active: bool | None = None
    role_id: uuid.UUID | None = None


class TokenResponse(SQLModel):
    """Schema de respuesta de autenticación."""

    access_token: str
    token_type: str = "bearer"


class UserCreateByAdmin(SQLModel):
    """Schema de creación de usuario por admin."""

    email: str
    password: str
    full_name: str
    role_id: uuid.UUID