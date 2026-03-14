from fastapi import status


def test_register_success(client, roles):
    response = client.post("/api/auth/register", json={
        "email": "nuevo@test.com",
        "password": "password123",
        "full_name": "Nuevo Usuario",
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "nuevo@test.com"
    assert data["full_name"] == "Nuevo Usuario"
    assert data["role"]["name"] == "attendee"
    assert "hashed_password" not in data


def test_register_duplicate_email(client, roles, attendee_user):
    response = client.post("/api/auth/register", json={
        "email": "attendee@test.com",
        "password": "password123",
        "full_name": "Otro Usuario",
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.json()["detail"].lower()


def test_login_success(client, roles, attendee_user):
    response = client.post("/api/auth/login", data={
        "username": "attendee@test.com",
        "password": "password123",
    })
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, roles, attendee_user):
    response = client.post("/api/auth/login", data={
        "username": "attendee@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client, roles):
    response = client.post("/api/auth/login", data={
        "username": "noexiste@test.com",
        "password": "password123",
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_me_authenticated(client, roles, attendee_user, attendee_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "attendee@test.com"


def test_me_unauthenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED