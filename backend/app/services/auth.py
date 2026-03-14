from sqlmodel import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import TokenResponse, UserCreate


class AuthService:

    def __init__(self, session: Session):
        self.user_repo = UserRepository(session)

    def register(self, data: UserCreate, role_id) -> User:
        existing = self.user_repo.get_by_email(data.email)
        if existing:
            raise ValueError("El email ya está registrado")

        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            role_id=role_id,
        )
        return self.user_repo.create(user)

    def login(self, email: str, password: str) -> TokenResponse:
        user = self.user_repo.get_by_email(email)

        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Credenciales inválidas")

        if not user.is_active:
            raise ValueError("Usuario inactivo")

        token = create_access_token(subject=str(user.id))
        return TokenResponse(access_token=token)