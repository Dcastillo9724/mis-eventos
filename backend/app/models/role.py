import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class Role(SQLModel, table=True):
    """Modelo de rol de usuario."""

    __tablename__ = "roles"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, max_length=50, nullable=False)
    description: str | None = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    users: list["User"] = Relationship(back_populates="role")