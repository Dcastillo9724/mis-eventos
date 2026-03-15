# Mis Eventos - Frontend

Aplicación web para la plataforma de gestión de eventos **Mis Eventos**, desarrollada con Angular 20 y PrimeNG.

## Tecnologías

- Angular 20
- PrimeNG 20
- TypeScript
- SCSS
- Nginx (producción)
- Docker

## Requisitos previos

- Node.js 22
- Angular CLI 20

## Configuración local

### 1. Navegar a la carpeta del frontend
```bash
cd mis-eventos/frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Levantar el servidor de desarrollo
```bash
ng serve
```

La app estará disponible en `http://localhost:4200`

## Estructura del proyecto
```
frontend/src/app/
├── core/
│   ├── guards/          ← Protección de rutas
│   ├── interceptors/    ← Token JWT y manejo de errores
│   ├── models/          ← Interfaces TypeScript
│   └── services/        ← Servicios HTTP
├── shared/
│   └── components/
│       ├── navbar/      ← Barra de navegación
│       └── footer/      ← Pie de página
└── features/
    ├── auth/            ← Login y registro
    ├── events/          ← Listado, detalle y formulario
    ├── profile/         ← Perfil y mis inscripciones
    └── users/           ← Gestión de usuarios (admin)
```

## Rutas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/events` | Listado de eventos | Público |
| `/events/:id` | Detalle del evento | Público |
| `/events/create` | Crear evento | Admin, Organizador |
| `/events/:id/edit` | Editar evento | Admin, Organizador |
| `/auth/login` | Iniciar sesión | Público |
| `/auth/register` | Registro | Público |
| `/profile` | Mi perfil e inscripciones | Autenticado |
| `/users` | Gestión de usuarios | Admin |

## Roles

| Rol | Permisos |
|-----|----------|
| admin | Acceso total |
| organizer | Crear y gestionar eventos y sesiones |
| attendee | Inscribirse a eventos y sesiones |

## Build de producción
```bash
ng build --configuration=production
```