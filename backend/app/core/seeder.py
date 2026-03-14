import logging

from sqlmodel import Session, select

from app.models.role import Role

logger = logging.getLogger(__name__)

ROLES = [
    {"name": "admin", "description": "Administrador del sistema"},
    {"name": "organizer", "description": "Organizador de eventos"},
    {"name": "attendee", "description": "Asistente a eventos"},
]


def seed_roles(session: Session) -> None:
    """Inserta los roles iniciales si no existen."""
    for role_data in ROLES:
        existing = session.exec(
            select(Role).where(Role.name == role_data["name"])
        ).first()
        if not existing:
            session.add(Role(**role_data))
            logger.info("Rol creado: %s", role_data["name"])

    session.commit()


def run_seeds(session: Session) -> None:
    """Ejecuta todos los seeders."""
    logger.info("Ejecutando seeders...")
    seed_roles(session)
    logger.info("Seeders completados.")