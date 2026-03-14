from sqlmodel import Session, select

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):

    def __init__(self, session: Session):
        super().__init__(User, session)

    def get_by_email(self, email: str) -> User | None:
        return self.session.exec(
            select(User).where(User.email == email)
        ).first()

    def get_active_users(self, offset: int = 0, limit: int = 10) -> list[User]:
        return self.session.exec(
            select(User).where(User.is_active == True).offset(offset).limit(limit)
        ).all()