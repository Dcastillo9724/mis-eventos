from uuid import UUID

from sqlmodel import Session, select

from app.models.attendee import EventRegistration, RegistrationStatus, SessionRegistration
from app.repositories.base import BaseRepository


class EventRegistrationRepository(BaseRepository[EventRegistration]):

    def __init__(self, session: Session):
        super().__init__(EventRegistration, session)

    def get_by_user_and_event(self, user_id: UUID, event_id: UUID) -> EventRegistration | None:
        return self.session.exec(
            select(EventRegistration)
            .where(EventRegistration.user_id == user_id)
            .where(EventRegistration.event_id == event_id)
            .where(EventRegistration.status == RegistrationStatus.ACTIVE)
        ).first()

    def get_by_user(self, user_id: UUID, offset: int = 0, limit: int = 10) -> list[EventRegistration]:
        return self.session.exec(
            select(EventRegistration)
            .where(EventRegistration.user_id == user_id)
            .where(EventRegistration.status == RegistrationStatus.ACTIVE)
            .offset(offset)
            .limit(limit)
        ).all()


class SessionRegistrationRepository(BaseRepository[SessionRegistration]):

    def __init__(self, session: Session):
        super().__init__(SessionRegistration, session)

    def get_by_user_and_session(self, user_id: UUID, session_id: UUID) -> SessionRegistration | None:
        return self.session.exec(
            select(SessionRegistration)
            .where(SessionRegistration.user_id == user_id)
            .where(SessionRegistration.session_id == session_id)
            .where(SessionRegistration.status == RegistrationStatus.ACTIVE)
        ).first()

    def get_by_user(self, user_id: UUID, offset: int = 0, limit: int = 10) -> list[SessionRegistration]:
        return self.session.exec(
            select(SessionRegistration)
            .where(SessionRegistration.user_id == user_id)
            .where(SessionRegistration.status == RegistrationStatus.ACTIVE)
            .offset(offset)
            .limit(limit)
        ).all()