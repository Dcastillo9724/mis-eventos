from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.debug,
)


def get_session() -> Generator[Session, None, None]:
    """Dependencia de sesión de base de datos para FastAPI."""
    with Session(engine) as session:
        yield session