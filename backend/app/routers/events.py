import math
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import CurrentUser, SessionDep, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.event import EventCreate, EventRead, EventReadWithSessions, EventUpdate
from app.services.event import EventService

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
def list_events(
    session: SessionDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    title: str | None = Query(default=None),
):
    offset = (page - 1) * page_size
    service = EventService(session)
    events, total = service.get_events(offset, page_size, title)
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size),
        items=events,
    )


@router.get("/{event_id}", response_model=EventReadWithSessions)
def get_event(event_id: UUID, session: SessionDep):
    try:
        service = EventService(session)
        return service.get_event(event_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreate,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin", "organizer"))],
):
    try:
        service = EventService(session)
        return service.create_event(data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{event_id}", response_model=EventRead)
def update_event(
    event_id: UUID,
    data: EventUpdate,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin", "organizer"))],
):
    try:
        service = EventService(session)
        return service.update_event(event_id, data, current_user.id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: UUID,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin", "organizer"))],
):
    try:
        service = EventService(session)
        service.delete_event(event_id, current_user.id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))