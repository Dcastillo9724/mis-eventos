from fastapi import status


def test_list_users_as_admin(client, roles, admin_token):
    response = client.get(
        "/api/users/",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_list_users_as_attendee(client, roles, attendee_token):
    response = client.get(
        "/api/users/",
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_users_unauthenticated(client, roles):
    response = client.get("/api/users/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_user_as_admin(client, roles, admin_user, admin_token):
    response = client.get(
        f"/api/users/{admin_user.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["email"] == "admin@test.com"


def test_get_user_not_found(client, roles, admin_token):
    response = client.get(
        "/api/users/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_user_as_admin(client, roles, admin_token):
    organizer_role_id = str(roles["organizer"].id)
    response = client.post(
        "/api/users/",
        json={
            "email": "nuevo_organizer@test.com",
            "password": "password123",
            "full_name": "Nuevo Organizador",
            "role_id": organizer_role_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "nuevo_organizer@test.com"
    assert data["role"]["name"] == "organizer"


def test_create_user_as_attendee(client, roles, attendee_token):
    response = client.post(
        "/api/users/",
        json={
            "email": "otro@test.com",
            "password": "password123",
            "full_name": "Otro Usuario",
            "role_id": str(roles["attendee"].id),
        },
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_update_user_role(client, roles, attendee_user, admin_token):
    response = client.patch(
        f"/api/users/{attendee_user.id}",
        json={"role_id": str(roles["organizer"].id)},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["role"]["name"] == "organizer"


def test_update_user_as_attendee(client, roles, attendee_user, attendee_token):
    response = client.patch(
        f"/api/users/{attendee_user.id}",
        json={"full_name": "Nombre Cambiado"},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_delete_user_as_admin(client, roles, admin_token):
    create_response = client.post(
        "/api/users/",
        json={
            "email": "para_eliminar@test.com",
            "password": "password123",
            "full_name": "Para Eliminar",
            "role_id": str(roles["attendee"].id),
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    user_id = create_response.json()["id"]
    response = client.delete(
        f"/api/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_delete_user_as_attendee(client, roles, attendee_user, attendee_token):
    response = client.delete(
        f"/api/users/{attendee_user.id}",
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN