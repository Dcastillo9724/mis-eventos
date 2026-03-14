from sqlmodel import Session, select

from app.models.event import Event, EventStatus
from app.repositories.base import BaseRepository


class EventRepository(BaseRepository[Event]):

    def __init__(self, session: Session):
        super().__init__(Event, session)

    def get_by_title(self, title: str, offset: int = 0, limit: int = 10) -> list[Event]:
        return self.session.exec(
            select(Event)
            .where(Event.title.ilike(f"%{title}%"))
            .offset(offset)
            .limit(limit)
        ).all()

    def get_published(self, offset: int = 0, limit: int = 10) -> list[Event]:
        return self.session.exec(
            select(Event)
            .where(Event.status == EventStatus.PUBLISHED)
            .offset(offset)
            .limit(limit)
        ).all()

    def get_by_organizer(self, organizer_id, offset: int = 0, limit: int = 10) -> list[Event]:
        return self.session.exec(
            select(Event)
            .where(Event.organizer_id == organizer_id)
            .offset(offset)
            .limit(limit)
        ).all()