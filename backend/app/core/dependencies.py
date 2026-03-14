import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def get_current_user(token: TokenDep, session: SessionDep) -> User:
    """Retorna el usuario autenticado a partir del JWT."""
    user_id = decode_access_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.exec(select(User).where(User.id == user_uuid)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )

    return user


def require_role(*roles: str):
    """Dependencia de control de acceso por rol."""
    def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
        session: SessionDep,
    ) -> User:
        user_with_role = session.exec(
            select(User).where(User.id == current_user.id)
        ).first()

        if user_with_role.role.name not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción",
            )
        return user_with_role

    return role_checker


CurrentUser = Annotated[User, Depends(get_current_user)]