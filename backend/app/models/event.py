import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.session import Session
    from app.models.attendee import EventRegistration
    from app.models.user import User


class EventStatus(str, Enum):
    """Estados posibles de un evento."""

    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Event(SQLModel, table=True):
    """Modelo de evento."""

    __tablename__ = "events"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    title: str = Field(max_length=255, nullable=False, index=True)
    description: str | None = Field(default=None)
    location: str | None = Field(default=None, max_length=255)
    start_date: datetime = Field(nullable=False)
    end_date: datetime = Field(nullable=False)
    capacity: int = Field(nullable=False, gt=0)
    registered_count: int = Field(default=0, nullable=False)
    status: EventStatus = Field(default=EventStatus.DRAFT, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    organizer_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)

    organizer: "User" = Relationship(back_populates="events")
    sessions: list["Session"] = Relationship(back_populates="event")
    event_registrations: list["EventRegistration"] = Relationship(back_populates="event")