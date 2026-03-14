import uuid
from datetime import datetime

from sqlmodel import SQLModel


class SessionCreate(SQLModel):
    """Schema de creación de sesión."""

    title: str
    description: str | None = None
    speaker_name: str | None = None
    start_time: datetime
    end_time: datetime
    capacity: int | None = None
    event_id: uuid.UUID


class SessionUpdate(SQLModel):
    """Schema de actualización de sesión."""

    title: str | None = None
    description: str | None = None
    speaker_name: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    capacity: int | None = None


class SessionRead(SQLModel):
    """Schema de lectura de sesión."""

    id: uuid.UUID
    title: str
    description: str | None
    speaker_name: str | None
    start_time: datetime
    end_time: datetime
    capacity: int | None
    registered_count: int
    event_id: uuid.UUID
    created_at: datetime