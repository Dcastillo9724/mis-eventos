from uuid import UUID

from sqlmodel import Session

from app.models.session import Session as EventSession
from app.repositories.event import EventRepository
from app.repositories.session import SessionRepository
from app.schemas.session import SessionCreate, SessionUpdate


class SessionService:

    def __init__(self, session: Session):
        self.session_repo = SessionRepository(session)
        self.event_repo = EventRepository(session)

    def create_session(self, data: SessionCreate) -> EventSession:
        event = self.event_repo.get_by_id(data.event_id)
        if not event:
            raise ValueError("Evento no encontrado")

        if data.end_time <= data.start_time:
            raise ValueError("La hora de fin debe ser posterior a la hora de inicio")

        event_session = EventSession(**data.model_dump())
        return self.session_repo.create(event_session)

    def get_session(self, session_id: UUID) -> EventSession:
        event_session = self.session_repo.get_by_id(session_id)
        if not event_session:
            raise ValueError("Sesión no encontrada")
        return event_session

    def get_sessions_by_event(self, event_id: UUID, offset: int, limit: int) -> tuple[list[EventSession], int]:
        sessions = self.session_repo.get_by_event(event_id, offset, limit)
        total = len(sessions)
        return sessions, total

    def update_session(self, session_id: UUID, data: SessionUpdate) -> EventSession:
        event_session = self.get_session(session_id)

        if data.end_time and data.start_time and data.end_time <= data.start_time:
            raise ValueError("La hora de fin debe ser posterior a la hora de inicio")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(event_session, field, value)

        return self.session_repo.update(event_session)

    def delete_session(self, session_id: UUID) -> None:
        event_session = self.get_session(session_id)
        self.session_repo.delete(event_session)