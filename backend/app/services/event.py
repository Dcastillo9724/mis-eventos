from uuid import UUID

from sqlmodel import Session

from app.models.event import Event
from app.repositories.event import EventRepository
from app.schemas.event import EventCreate, EventUpdate


class EventService:

    def __init__(self, session: Session):
        self.event_repo = EventRepository(session)

    def create_event(self, data: EventCreate, organizer_id: UUID) -> Event:
        if data.end_date <= data.start_date:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio")

        event = Event(
            **data.model_dump(),
            organizer_id=organizer_id,
        )
        return self.event_repo.create(event)

    def get_event(self, event_id: UUID) -> Event:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise ValueError("Evento no encontrado")
        return event

    def get_events(self, offset: int, limit: int, title: str | None) -> tuple[list[Event], int]:
        if title:
            events = self.event_repo.get_by_title(title, offset, limit)
        else:
            events = self.event_repo.get_published(offset, limit)
        total = self.event_repo.count()
        return events, total

    def update_event(self, event_id: UUID, data: EventUpdate, requester_id: UUID) -> Event:
        event = self.get_event(event_id)

        if event.organizer_id != requester_id:
            raise PermissionError("No tienes permisos para editar este evento")

        if data.end_date and data.start_date and data.end_date <= data.start_date:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(event, field, value)

        return self.event_repo.update(event)

    def delete_event(self, event_id: UUID, requester_id: UUID) -> None:
        event = self.get_event(event_id)

        if event.organizer_id != requester_id:
            raise PermissionError("No tienes permisos para eliminar este evento")

        self.event_repo.delete(event)