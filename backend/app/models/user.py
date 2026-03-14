import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.models.role import Role

if TYPE_CHECKING:
    from app.models.event import Event
    from app.models.attendee import EventRegistration, SessionRegistration


class User(SQLModel, table=True):
    """Modelo de usuario."""

    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, max_length=255, nullable=False, index=True)
    hashed_password: str = Field(nullable=False)
    full_name: str = Field(max_length=255, nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )
    role_id: uuid.UUID = Field(foreign_key="roles.id", nullable=False)

    role: Role = Relationship(back_populates="users")
    events: list["Event"] = Relationship(back_populates="organizer")
    event_registrations: list["EventRegistration"] = Relationship(back_populates="user")
    session_registrations: list["SessionRegistration"] = Relationship(back_populates="user")