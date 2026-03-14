import uuid
from datetime import datetime

from sqlmodel import SQLModel

from app.models.attendee import RegistrationStatus


class EventRegistrationCreate(SQLModel):
    """Schema de registro a un evento."""

    event_id: uuid.UUID


class EventRegistrationRead(SQLModel):
    """Schema de lectura de registro a un evento."""

    id: uuid.UUID
    user_id: uuid.UUID
    event_id: uuid.UUID
    status: RegistrationStatus
    registered_at: datetime


class SessionRegistrationCreate(SQLModel):
    """Schema de registro a una sesión."""

    session_id: uuid.UUID


class SessionRegistrationRead(SQLModel):
    """Schema de lectura de registro a una sesión."""

    id: uuid.UUID
    user_id: uuid.UUID
    session_id: uuid.UUID
    status: RegistrationStatus
    registered_at: datetime


class RegistrationCancelRead(SQLModel):
    """Schema de respuesta al cancelar un registro."""

    id: uuid.UUID
    status: RegistrationStatus
    detail: str