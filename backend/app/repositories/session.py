from uuid import UUID

from sqlmodel import Session, select

from app.models.session import Session as EventSession
from app.repositories.base import BaseRepository


class SessionRepository(BaseRepository[EventSession]):

    def __init__(self, session: Session):
        super().__init__(EventSession, session)

    def get_by_event(self, event_id: UUID, offset: int = 0, limit: int = 10) -> list[EventSession]:
        return self.session.exec(
            select(EventSession)
            .where(EventSession.event_id == event_id)
            .offset(offset)
            .limit(limit)
        ).all()