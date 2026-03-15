from uuid import UUID

from sqlmodel import Session

from app.models.event import Event, EventStatus
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

    def get_events(self, offset: int, limit: int, title: str | None, current_user=None) -> tuple[list[Event], int]:
        show_all = current_user is not None and current_user.role.name in ('admin', 'organizer')

        if title:
            events = self.event_repo.get_by_title(title, offset, limit, show_all=show_all)
            total = self.event_repo.count_by_title(title, show_all=show_all)
        else:
            if show_all:
                events = self.event_repo.get_all(offset, limit)
                total = self.event_repo.count()
            else:
                events = self.event_repo.get_published(offset, limit)
                total = self.event_repo.count_published()

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

    def cancel_event(self, event_id: UUID, requester_id: UUID) -> Event:
        """Cancela un evento en lugar de eliminarlo."""
        event = self.get_event(event_id)

        if event.organizer_id != requester_id:
            raise PermissionError("No tienes permisos para cancelar este evento")

        if event.status == EventStatus.CANCELLED:
            raise ValueError("El evento ya está cancelado")

        event.status = EventStatus.CANCELLED
        return self.event_repo.update(event)

    def get_events_grouped(self, current_user=None) -> dict:
        """Retorna eventos agrupados por status."""
        show_drafts = current_user is not None and current_user.role.name in ('admin', 'organizer')

        result = {
            "published": self.event_repo.get_by_status(EventStatus.PUBLISHED),
            "published_total": self.event_repo.count_by_status(EventStatus.PUBLISHED),
            "cancelled": self.event_repo.get_by_status(EventStatus.CANCELLED),
            "cancelled_total": self.event_repo.count_by_status(EventStatus.CANCELLED),
            "completed": self.event_repo.get_by_status(EventStatus.COMPLETED),
            "completed_total": self.event_repo.count_by_status(EventStatus.COMPLETED),
            "draft": [],
            "draft_total": 0,
        }

        if show_drafts:
            result["draft"] = self.event_repo.get_by_status(EventStatus.DRAFT)
            result["draft_total"] = self.event_repo.count_by_status(EventStatus.DRAFT)

        return result