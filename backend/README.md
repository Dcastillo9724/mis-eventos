# Mis Eventos - Backend

API REST para la plataforma de gestión de eventos **Mis Eventos**, desarrollada con FastAPI, SQLModel y PostgreSQL.

## Tecnologías

- Python 3.12
- FastAPI
- SQLModel + SQLAlchemy
- PostgreSQL
- Alembic
- Poetry
- Docker

## Requisitos previos

- Python 3.12
- Poetry
- PostgreSQL (local) o Docker

## Configuración local

### 1. Navegar a la carpeta del backend
```bash
cd mis-eventos/backend
```

### 2. Instalar dependencias
```bash
poetry install
```

### 3. Configurar variables de entorno
```bash
copy .env.example .env
```

Edita el `.env` con tus credenciales:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/mis_eventos
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=true
```

### 4. Crear la base de datos

Crea una base de datos llamada `mis_eventos` en PostgreSQL.

### 5. Ejecutar migraciones
```bash
poetry run alembic upgrade head
```

### 6. Levantar el servidor
```bash
poetry run uvicorn app.main:app --reload
```

La API estará disponible en `http://localhost:8000`. Los roles iniciales se crean automáticamente al arrancar.

## Documentación API

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Estructura del proyecto
```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   ├── dependencies.py
│   │   └── seeder.py
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── routers/
│   └── middleware/
├── tests/
├── alembic/
├── Dockerfile
├── pyproject.toml
└── .env.example
```

## Tests
```bash
poetry run pytest
```

Con reporte de cobertura:
```bash
poetry run pytest --cov=app --cov-report=html
```

Cobertura actual: **94%**

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| admin | Acceso total, gestión de usuarios |
| organizer | Puede crear y gestionar eventos y sesiones |
| attendee | Puede registrarse a eventos y sesiones |