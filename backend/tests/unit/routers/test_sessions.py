from fastapi import status


def create_test_event(client, admin_token):
    response = client.post(
        "/api/events/",
        json={
            "title": "Evento con Sesiones",
            "description": "Descripción",
            "location": "Bogotá",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": 100,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    return response.json()["id"]


def test_create_session(client, roles, admin_token):
    event_id = create_test_event(client, admin_token)
    response = client.post(
        "/api/sessions/",
        json={
            "title": "Sesión Python",
            "description": "Introducción a Python",
            "speaker_name": "Diego Castillo",
            "start_time": "2026-05-01T10:00:00",
            "end_time": "2026-05-01T11:00:00",
            "capacity": 30,
            "event_id": event_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Sesión Python"
    assert data["speaker_name"] == "Diego Castillo"
    assert data["event_id"] == event_id


def test_create_session_unauthenticated(client, roles, admin_token):
    event_id = create_test_event(client, admin_token)
    response = client.post(
        "/api/sessions/",
        json={
            "title": "Sesión No Permitida",
            "description": "Descripción",
            "speaker_name": "Speaker",
            "start_time": "2026-05-01T10:00:00",
            "end_time": "2026-05-01T11:00:00",
            "capacity": 30,
            "event_id": event_id,
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_session_as_attendee(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token)
    response = client.post(
        "/api/sessions/",
        json={
            "title": "Sesión No Permitida",
            "description": "Descripción",
            "speaker_name": "Speaker",
            "start_time": "2026-05-01T10:00:00",
            "end_time": "2026-05-01T11:00:00",
            "capacity": 30,
            "event_id": event_id,
        },
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_sessions_by_event(client, roles, admin_token):
    event_id = create_test_event(client, admin_token)
    client.post(
        "/api/sessions/",
        json={
            "title": "Sesión 1",
            "start_time": "2026-05-01T10:00:00",
            "end_time": "2026-05-01T11:00:00",
            "event_id": event_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    response = client.get(f"/api/sessions/event/{event_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 1


def test_get_session(client, roles, admin_token):
    event_id = create_test_event(client, admin_token)
    create_response = client.post(
        "/api/sessions/",
        json={
            "title": "Sesión Detalle",
            "start_time": "2026-05-01T10:00:00",
            "end_time": "2026-05-01T11:00:00",
            "event_id": event_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    session_id = create_response.json()["id"]
    response = client.get(f"/api/sessions/{session_id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == session_id


def test_get_session_not_found(client, roles):
    response = client.get("/api/sessions/00000000-0000-0000-0000-000000000000")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_session(client, roles, admin_token):
    event_id = create_test_event(client, admin_token)
    create_response = client.post(
        "/api/sessions/",
        json={
            "title": "Sesión Original",
            "start_time": "2026-05-01T10:00:00",
            "end_time": "2026-05-01T11:00:00",
            "event_id": event_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    session_id = create_response.json()["id"]
    response = client.patch(
        f"/api/sessions/{session_id}",
        json={"title": "Sesión Actualizada"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Sesión Actualizada"


def test_delete_session(client, roles, admin_token):
    event_id = create_test_event(client, admin_token)
    create_response = client.post(
        "/api/sessions/",
        json={
            "title": "Sesión a Eliminar",
            "start_time": "2026-05-01T10:00:00",
            "end_time": "2026-05-01T11:00:00",
            "event_id": event_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    session_id = create_response.json()["id"]
    response = client.delete(
        f"/api/sessions/{session_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_create_session_invalid_times(client, roles, admin_token):
    event_id = create_test_event(client, admin_token)
    response = client.post(
        "/api/sessions/",
        json={
            "title": "Sesión Horas Inválidas",
            "start_time": "2026-05-01T11:00:00",
            "end_time": "2026-05-01T10:00:00",
            "event_id": event_id,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST