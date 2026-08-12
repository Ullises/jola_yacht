# Pepetoys Backend API

API REST para la reserva de motos acuaticas y yates desarrollada con FastAPI y MySQL.

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose
- Red Docker `jolayacht-net` (debe existir previamente)

### Configuración
1. Clona el repositorio
2. Crea un archivo `.env` con las variables de base de datos:
```
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
```

### Ejecutar el proyecto
```bash
docker-compose up --build
```

## 🔍 Verificación

### Pruebas básicas
- **Estado general**: http://localhost:5010/health
- **Ejemplo API**: http://localhost:5010/items/get-items

### Resultado esperado
```json
{
  "status": "success",
  "data": [...],
  "count": 5
}
```

## 🛠️ Comandos Docker

### Acceder al contenedor
```bash
docker exec -it jolayacht-backend /bin/bash
```

### Descargar backups
```bash
docker cp jolayacht-backend:/app/backupsDB ./backups_local
```

## 📁 Estructura del Proyecto
```
src/
├── API/api.py          # Endpoints FastAPI
├── Utils/jolayacht_exec.py  # Lógica de negocio
├── Queries/jolayacht_queries.py  # Consultas SQL
└── config/config.py    # Configuración DB
```

## 🔧 Stack Tecnológico
- **FastAPI** - Framework web
- **MySQL** - Base de datos
- **Docker** - Containerización
- **SQLAlchemy** - ORM