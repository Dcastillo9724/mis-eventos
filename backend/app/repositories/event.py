from sqlmodel import Session, select

from app.models.event import Event, EventStatus
from app.repositories.base import BaseRepository


class EventRepository(BaseRepository[Event]):

    def __init__(self, session: Session):
        super().__init__(Event, session)

    def get_by_title(self, title: str, offset: int = 0, limit: int = 10, show_all: bool = False) -> list[Event]:
        query = select(Event).where(Event.title.ilike(f"%{title}%"))
        if not show_all:
            query = query.where(Event.status.in_([EventStatus.PUBLISHED, EventStatus.CANCELLED, EventStatus.COMPLETED]))
        return self.session.exec(query.offset(offset).limit(limit)).all()

    def get_published(self, offset: int = 0, limit: int = 10) -> list[Event]:
        return self.session.exec(
            select(Event)
            .where(Event.status.in_([
                EventStatus.PUBLISHED,
                EventStatus.CANCELLED,
                EventStatus.COMPLETED,
            ]))
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

    def count_published(self) -> int:
        return len(self.session.exec(
            select(Event).where(Event.status.in_([
                EventStatus.PUBLISHED,
                EventStatus.CANCELLED,
                EventStatus.COMPLETED
            ]))
        ).all())

    def count_by_title(self, title: str, show_all: bool = False) -> int:
        query = select(Event).where(Event.title.ilike(f"%{title}%"))
        if not show_all:
            query = query.where(Event.status.in_([
                EventStatus.PUBLISHED,
                EventStatus.CANCELLED,
                EventStatus.COMPLETED
            ]))
        return len(self.session.exec(query).all())
    
    def get_by_status(self, status: EventStatus, offset: int = 0, limit: int = 10) -> list[Event]:
        return self.session.exec(
            select(Event)
            .where(Event.status == status)
            .offset(offset)
            .limit(limit)
        ).all()

    def count_by_status(self, status: EventStatus) -> int:
        return len(self.session.exec(
            select(Event).where(Event.status == status)
        ).all())