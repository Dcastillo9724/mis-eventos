import math
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import CurrentUser, SessionDep, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.session import SessionCreate, SessionRead, SessionUpdate
from app.services.session import SessionService

router = APIRouter()


@router.get("/event/{event_id}", response_model=PaginatedResponse)
def list_sessions_by_event(
    event_id: UUID,
    session: SessionDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
):
    offset = (page - 1) * page_size
    service = SessionService(session)
    sessions, total = service.get_sessions_by_event(event_id, offset, page_size)
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 1,
        items=sessions,
    )


@router.get("/{session_id}", response_model=SessionRead)
def get_session(session_id: UUID, session: SessionDep):
    try:
        service = SessionService(session)
        return service.get_session(session_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def create_session(
    data: SessionCreate,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin", "organizer"))],
):
    try:
        service = SessionService(session)
        return service.create_session(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{session_id}", response_model=SessionRead)
def update_session(
    session_id: UUID,
    data: SessionUpdate,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin", "organizer"))],
):
    try:
        service = SessionService(session)
        return service.update_session(session_id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: UUID,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin", "organizer"))],
):
    try:
        service = SessionService(session)
        service.delete_session(session_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))