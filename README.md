# Mis Eventos

Plataforma web para la gestión de eventos, sesiones y asistentes. Desarrollada con FastAPI en el backend y Angular en el frontend.

## Tecnologías

| Backend | Frontend |
|---------|----------|
| Python 3.12 | Angular 20 |
| FastAPI | PrimeNG 20 |
| PostgreSQL | TypeScript |
| SQLModel | SCSS |
| Alembic | Nginx |
| Docker | Docker |

## Levantar el proyecto completo

### Requisitos previos

- Docker y Docker Compose

### Comando
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

Los roles iniciales se crean automáticamente al arrancar.

## Estructura del repositorio
```
mis-eventos/
├── backend/         ← API REST con FastAPI
├── frontend/        ← Aplicación Angular
└── docker-compose.yml
```

## Documentación

- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)