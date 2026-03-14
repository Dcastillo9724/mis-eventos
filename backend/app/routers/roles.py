from fastapi import APIRouter
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.models.role import Role
from app.schemas.user import RoleRead

router = APIRouter()


@router.get("/", response_model=list[RoleRead])
def list_roles(session: SessionDep, current_user: CurrentUser):
    roles = session.exec(select(Role)).all()
    return roles