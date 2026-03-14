import uuid
from datetime import datetime

from sqlmodel import SQLModel

from app.models.event import EventStatus


class EventCreate(SQLModel):
    """Schema de creación de evento."""

    title: str
    description: str | None = None
    location: str | None = None
    start_date: datetime
    end_date: datetime
    capacity: int


class EventUpdate(SQLModel):
    """Schema de actualización de evento."""

    title: str | None = None
    description: str | None = None
    location: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    capacity: int | None = None
    status: EventStatus | None = None


class EventRead(SQLModel):
    """Schema de lectura de evento."""

    id: uuid.UUID
    title: str
    description: str | None
    location: str | None
    start_date: datetime
    end_date: datetime
    capacity: int
    registered_count: int
    status: EventStatus
    organizer_id: uuid.UUID
    created_at: datetime


class EventReadWithSessions(EventRead):
    """Schema de lectura de evento con sus sesiones."""

    sessions: list["SessionRead"] = []


from app.schemas.session import SessionRead  

EventReadWithSessions.model_rebuild()