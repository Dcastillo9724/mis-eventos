from typing import Generic, TypeVar
from uuid import UUID

from sqlmodel import Session, SQLModel, select

ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    """Repositorio base con operaciones CRUD genéricas."""

    def __init__(self, model: type[ModelType], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id: UUID) -> ModelType | None:
        return self.session.get(self.model, id)

    def get_all(self, offset: int = 0, limit: int = 10) -> list[ModelType]:
        return self.session.exec(
            select(self.model).offset(offset).limit(limit)
        ).all()

    def count(self) -> int:
        return len(self.session.exec(select(self.model)).all())

    def create(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def update(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        self.session.delete(obj)
        self.session.commit()