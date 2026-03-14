from uuid import UUID

from sqlmodel import Session

from app.models.attendee import EventRegistration, SessionRegistration
from app.repositories.attendee import EventRegistrationRepository, SessionRegistrationRepository
from app.repositories.event import EventRepository
from app.repositories.session import SessionRepository
from app.schemas.attendee import EventRegistrationCreate, SessionRegistrationCreate


class AttendeeService:

    def __init__(self, session: Session):
        self.event_reg_repo = EventRegistrationRepository(session)
        self.session_reg_repo = SessionRegistrationRepository(session)
        self.event_repo = EventRepository(session)
        self.session_repo = SessionRepository(session)

    def register_to_event(self, data: EventRegistrationCreate, user_id: UUID) -> EventRegistration:
        event = self.event_repo.get_by_id(data.event_id)
        if not event:
            raise ValueError("Evento no encontrado")

        if event.registered_count >= event.capacity:
            raise ValueError("El evento no tiene capacidad disponible")

        existing = self.event_reg_repo.get_by_user_and_event(user_id, data.event_id)
        if existing:
            raise ValueError("Ya estás registrado en este evento")

        event.registered_count += 1
        self.event_repo.update(event)

        registration = EventRegistration(user_id=user_id, event_id=data.event_id)
        return self.event_reg_repo.create(registration)

    def cancel_event_registration(self, event_id: UUID, user_id: UUID) -> EventRegistration:
        registration = self.event_reg_repo.get_by_user_and_event(user_id, event_id)
        if not registration:
            raise ValueError("No estás registrado en este evento")

        event = self.event_repo.get_by_id(event_id)
        event.registered_count -= 1
        self.event_repo.update(event)

        registration.status = "cancelled"
        return self.event_reg_repo.update(registration)

    def get_user_event_registrations(self, user_id: UUID, offset: int, limit: int) -> list[EventRegistration]:
        return self.event_reg_repo.get_by_user(user_id, offset, limit)

    def register_to_session(self, data: SessionRegistrationCreate, user_id: UUID) -> SessionRegistration:
        event_session = self.session_repo.get_by_id(data.session_id)
        if not event_session:
            raise ValueError("Sesión no encontrada")

        if event_session.capacity and event_session.registered_count >= event_session.capacity:
            raise ValueError("La sesión no tiene capacidad disponible")

        existing = self.session_reg_repo.get_by_user_and_session(user_id, data.session_id)
        if existing:
            raise ValueError("Ya estás registrado en esta sesión")

        event_session.registered_count += 1
        self.session_repo.update(event_session)

        registration = SessionRegistration(user_id=user_id, session_id=data.session_id)
        return self.session_reg_repo.create(registration)

    def cancel_session_registration(self, session_id: UUID, user_id: UUID) -> SessionRegistration:
        registration = self.session_reg_repo.get_by_user_and_session(user_id, session_id)
        if not registration:
            raise ValueError("No estás registrado en esta sesión")

        event_session = self.session_repo.get_by_id(session_id)
        event_session.registered_count -= 1
        self.session_repo.update(event_session)

        registration.status = "cancelled"
        return self.session_reg_repo.update(registration)

    def get_user_session_registrations(self, user_id: UUID, offset: int, limit: int) -> list[SessionRegistration]:
        return self.session_reg_repo.get_by_user(user_id, offset, limit)