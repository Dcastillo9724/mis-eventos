from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from typing import Annotated
from fastapi import Depends

from app.core.dependencies import  SessionDep, require_role
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserCreateByAdmin, UserRead, UserUpdate

from app.services.auth import AuthService

router = APIRouter()


@router.get("/", response_model=list[UserRead])
def list_users(
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin"))],
):
    repo = UserRepository(session)
    return repo.get_all()


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: UUID,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin"))],
):
    repo = UserRepository(session)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin"))],
):
    repo = UserRepository(session)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    return repo.update(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin"))],
):
    repo = UserRepository(session)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    repo.delete(user)

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreateByAdmin,
    session: SessionDep,
    current_user: Annotated[User, Depends(require_role("admin"))],
):
    try:
        service = AuthService(session)
        return service.register(
            UserCreate(
                email=data.email,
                password=data.password,
                full_name=data.full_name,
            ),
            data.role_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))