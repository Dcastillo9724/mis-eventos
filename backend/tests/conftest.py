import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.dependencies import get_session
from app.main import app

DATABASE_URL = "sqlite://"


@pytest.fixture(name="engine")
def engine_fixture():
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="session")
def session_fixture(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session):
    def get_session_override():
        yield session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="roles")
def roles_fixture(session):
    from app.models.role import Role
    roles = [
        Role(name="admin", description="Administrador del sistema"),
        Role(name="organizer", description="Organizador de eventos"),
        Role(name="attendee", description="Asistente a eventos"),
    ]
    for role in roles:
        session.add(role)
    session.commit()
    for role in roles:
        session.refresh(role)
    return {r.name: r for r in roles}


@pytest.fixture(name="admin_user")
def admin_user_fixture(session, roles):
    from app.core.security import hash_password
    from app.models.user import User
    user = User(
        email="admin@test.com",
        hashed_password=hash_password("password123"),
        full_name="Admin Test",
        role_id=roles["admin"].id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="attendee_user")
def attendee_user_fixture(session, roles):
    from app.core.security import hash_password
    from app.models.user import User
    user = User(
        email="attendee@test.com",
        hashed_password=hash_password("password123"),
        full_name="Attendee Test",
        role_id=roles["attendee"].id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="admin_token")
def admin_token_fixture(admin_user):
    from app.core.security import create_access_token
    return create_access_token(subject=str(admin_user.id))


@pytest.fixture(name="attendee_token")
def attendee_token_fixture(attendee_user):
    from app.core.security import create_access_token
    return create_access_token(subject=str(attendee_user.id))