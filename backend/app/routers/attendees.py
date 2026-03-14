from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from app.core.dependencies import CurrentUser, SessionDep
from app.schemas.attendee import (
    EventRegistrationCreate,
    EventRegistrationRead,
    SessionRegistrationCreate,
    SessionRegistrationRead,
)
from app.services.attendee import AttendeeService

router = APIRouter()


@router.post("/events", response_model=EventRegistrationRead, status_code=status.HTTP_201_CREATED)
def register_to_event(data: EventRegistrationCreate, session: SessionDep, current_user: CurrentUser):
    try:
        service = AttendeeService(session)
        return service.register_to_event(data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/events/{event_id}", response_model=EventRegistrationRead)
def cancel_event_registration(event_id: UUID, session: SessionDep, current_user: CurrentUser):
    try:
        service = AttendeeService(session)
        return service.cancel_event_registration(event_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/events/me", response_model=list[EventRegistrationRead])
def my_event_registrations(
    session: SessionDep,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
):
    offset = (page - 1) * page_size
    service = AttendeeService(session)
    return service.get_user_event_registrations(current_user.id, offset, page_size)


@router.post("/sessions", response_model=SessionRegistrationRead, status_code=status.HTTP_201_CREATED)
def register_to_session(data: SessionRegistrationCreate, session: SessionDep, current_user: CurrentUser):
    try:
        service = AttendeeService(session)
        return service.register_to_session(data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/sessions/{session_id}", response_model=SessionRegistrationRead)
def cancel_session_registration(session_id: UUID, session: SessionDep, current_user: CurrentUser):
    try:
        service = AttendeeService(session)
        return service.cancel_session_registration(session_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/sessions/me", response_model=list[SessionRegistrationRead])
def my_session_registrations(
    session: SessionDep,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
):
    offset = (page - 1) * page_size
    service = AttendeeService(session)
    return service.get_user_session_registrations(current_user.id, offset, page_size)