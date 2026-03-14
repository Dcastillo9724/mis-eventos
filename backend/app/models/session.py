import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.event import Event
    from app.models.attendee import SessionRegistration


class Session(SQLModel, table=True):
    """Modelo de sesión de un evento."""

    __tablename__ = "sessions"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    title: str = Field(max_length=255, nullable=False)
    description: str | None = Field(default=None)
    speaker_name: str | None = Field(default=None, max_length=255)
    start_time: datetime = Field(nullable=False)
    end_time: datetime = Field(nullable=False)
    capacity: int | None = Field(default=None, gt=0)
    registered_count: int = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    event_id: uuid.UUID = Field(foreign_key="events.id", nullable=False)

    event: "Event" = Relationship(back_populates="sessions")
    session_registrations: list["SessionRegistration"] = Relationship(back_populates="session")