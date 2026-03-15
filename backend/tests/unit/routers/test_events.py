from datetime import datetime, timezone

from fastapi import status


def test_list_events_public(client, roles):
    response = client.get("/api/events/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data


def test_list_events_with_title_filter(client, roles, admin_user, admin_token):
    client.post(
        "/api/events/",
        json={
            "title": "Evento Python",
            "description": "Taller de Python",
            "location": "Bogotá",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": 50,
            "status": "published",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    response = client.get(
        "/api/events/?title=Python",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["items"]) >= 1

    
def test_create_event_as_admin(client, roles, admin_token):
    response = client.post(
        "/api/events/",
        json={
            "title": "Evento Test",
            "description": "Descripción",
            "location": "Medellín",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": 100,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Evento Test"
    assert data["capacity"] == 100
    assert data["status"] == "draft"


def test_create_event_as_attendee(client, roles, attendee_token):
    response = client.post(
        "/api/events/",
        json={
            "title": "Evento No Permitido",
            "description": "Descripción",
            "location": "Cali",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": 50,
        },
        headers={"Authorization": f"Bearer {attendee_token}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_create_event_unauthenticated(client, roles):
    response = client.post(
        "/api/events/",
        json={
            "title": "Evento No Permitido",
            "description": "Descripción",
            "location": "Cali",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": 50,
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_event(client, roles, admin_token):
    create_response = client.post(
        "/api/events/",
        json={
            "title": "Evento Detalle",
            "description": "Descripción",
            "location": "Bogotá",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": 100,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    event_id = create_response.json()["id"]
    response = client.get(f"/api/events/{event_id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == event_id


def test_get_event_not_found(client, roles):
    response = client.get("/api/events/00000000-0000-0000-0000-000000000000")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_event(client, roles, admin_token):
    create_response = client.post(
        "/api/events/",
        json={
            "title": "Evento Original",
            "description": "Descripción",
            "location": "Bogotá",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": 100,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    event_id = create_response.json()["id"]
    response = client.patch(
        f"/api/events/{event_id}",
        json={"title": "Evento Actualizado"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Evento Actualizado"


def test_delete_event(client, roles, admin_token):
    create_response = client.post(
        "/api/events/",
        json={
            "title": "Evento a Eliminar",
            "description": "Descripción",
            "location": "Bogotá",
            "start_date": "2026-05-01T09:00:00",
            "end_date": "2026-05-01T18:00:00",
            "capacity": 100,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    event_id = create_response.json()["id"]
    response = client.delete(
        f"/api/events/{event_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_create_event_invalid_dates(client, roles, admin_token):
    response = client.post(
        "/api/events/",
        json={
            "title": "Evento Fechas Inválidas",
            "description": "Descripción",
            "location": "Bogotá",
            "start_date": "2026-05-01T18:00:00",
            "end_date": "2026-05-01T09:00:00",
            "capacity": 100,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST