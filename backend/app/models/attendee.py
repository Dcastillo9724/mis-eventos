import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.event import Event
    from app.models.session import Session


class RegistrationStatus(str, Enum):
    """Estados posibles de un registro."""

    ACTIVE = "active"
    CANCELLED = "cancelled"


class EventRegistration(SQLModel, table=True):
    """Modelo de registro de usuario a un evento."""

    __tablename__ = "event_registrations"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    status: RegistrationStatus = Field(
        default=RegistrationStatus.ACTIVE,
        nullable=False,
    )
    registered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    event_id: uuid.UUID = Field(foreign_key="events.id", nullable=False)

    user: "User" = Relationship(back_populates="event_registrations")
    event: "Event" = Relationship(back_populates="event_registrations")


class SessionRegistration(SQLModel, table=True):
    """Modelo de registro de usuario a una sesión."""

    __tablename__ = "session_registrations"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    status: RegistrationStatus = Field(
        default=RegistrationStatus.ACTIVE,
        nullable=False,
    )
    registered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    session_id: uuid.UUID = Field(foreign_key="sessions.id", nullable=False)

    user: "User" = Relationship(back_populates="session_registrations")
    session: "Session" = Relationship(back_populates="session_registrations")