# Mis Eventos

Plataforma web para la gestión de eventos, sesiones y asistentes. Desarrollada con FastAPI en el backend y Angular en el frontend.

## Tecnologías

| Backend | Frontend |
|---------|----------|
| Python 3.12 | Angular |
| FastAPI | PrimeNG |
| PostgreSQL | TypeScript |
| SQLModel | |
| Docker | |

## Requisitos previos

- Docker y Docker Compose

## Levantar el proyecto completo
```bash
git clone https://github.com/Dcastillo9724/mis-eventos.git
cd mis-eventos
docker-compose up --build
```

Servicios disponibles:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

## Estructura del repositorio
```
mis-eventos/
├── backend/    ← API REST con FastAPI
├── frontend/   ← Aplicación Angular
└── docker-compose.yml
```

## Documentación

- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)