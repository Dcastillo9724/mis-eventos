from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.dependencies import CurrentUser, SessionDep
from app.models.role import Role
from app.schemas.user import TokenResponse, UserCreate, UserRead
from app.services.auth import AuthService
from sqlmodel import select

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, session: SessionDep):
    default_role = session.exec(select(Role).where(Role.name == "attendee")).first()
    if not default_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Rol por defecto no encontrado",
        )
    try:
        service = AuthService(session)
        return service.register(data, default_role.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: SessionDep = None):
    try:
        service = AuthService(session)
        return service.login(form_data.username, form_data.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser):
    return current_user