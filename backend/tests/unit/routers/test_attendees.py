from fastapi import status


def create_test_event(client, admin_token, capacity=100):
    response = client.post(
        "/api/events/",
        json={
            "title": "Evento Asistentes",
            "description": "Descripción",
            "location": "Bogotá",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": capacity,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    return response.json()["id"]


def create_test_session(client, admin_token, event_id, capacity=None):
    body = {
        "title": "Sesión Test",
        "start_time": "2026-05-01T10:00:00",
        "end_time": "2026-05-01T11:00:00",
        "event_id": event_id,
    }
    if capacity:
        body["capacity"] = capacity
    response = client.post(
        "/api/sessions/",
        json=body,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    return response.json()["id"]


def test_register_to_event(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token)
    response = client.post(
        "/api/attendees/events",
        json={"event_id": event_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["event_id"] == event_id
    assert data["status"] == "active"


def test_register_to_event_unauthenticated(client, roles, admin_token):
    event_id = create_test_event(client, admin_token)
    response = client.post(
        "/api/attendees/events",
        json={"event_id": event_id},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_register_to_event_duplicate(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token)
    client.post(
        "/api/attendees/events",
        json={"event_id": event_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    response = client.post(
        "/api/attendees/events",
        json={"event_id": event_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_register_to_event_no_capacity(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token, capacity=1)
    client.post(
        "/api/attendees/events",
        json={"event_id": event_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    response = client.post(
        "/api/attendees/events",
        json={"event_id": event_id},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_cancel_event_registration(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token)
    client.post(
        "/api/attendees/events",
        json={"event_id": event_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    response = client.delete(
        f"/api/attendees/events/{event_id}",
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "cancelled"


def test_my_event_registrations(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token)
    client.post(
        "/api/attendees/events",
        json={"event_id": event_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    response = client.get(
        "/api/attendees/events/me",
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) >= 1


def test_register_to_session(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token)
    session_id = create_test_session(client, admin_token, event_id)
    response = client.post(
        "/api/attendees/sessions",
        json={"session_id": session_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["session_id"] == session_id
    assert data["status"] == "active"


def test_cancel_session_registration(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token)
    session_id = create_test_session(client, admin_token, event_id)
    client.post(
        "/api/attendees/sessions",
        json={"session_id": session_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    response = client.delete(
        f"/api/attendees/sessions/{session_id}",
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "cancelled"


def test_my_session_registrations(client, roles, admin_token, attendee_token):
    event_id = create_test_event(client, admin_token)
    session_id = create_test_session(client, admin_token, event_id)
    client.post(
        "/api/attendees/sessions",
        json={"session_id": session_id},
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    response = client.get(
        "/api/attendees/sessions/me",
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) >= 1