
### ✅ **1. Acceder a Adminer en el navegador**

Abre tu navegador y ve a:

```
http://localhost:8081
```

Esto abre la interfaz de **Adminer**.

---

### ✅ **2. Rellenar los campos de conexión**

En la página de Adminer, verás un formulario con los siguientes campos:

- **Sistema**: Selecciona **PostgreSQL** (es la opción por defecto).
- **Servidor**: Escribe `db-jolayacht`  
  > 💡 **Importante**: Como Adminer y PostgreSQL están en la misma red de Docker (por estar en el mismo `docker-compose.yml`), puedes usar el **nombre del servicio** (`db-jolayacht`) como host.  
  > Si accedes desde fuera de Docker (por ejemplo, desde tu máquina local), también podrías usar `localhost`, **pero solo si el puerto 5432 está expuesto y accesible**, lo cual sí lo está en tu caso (`ports: - "5432:5432"`).  
  > **Sin embargo**, dentro del contenedor de Adminer, `localhost` apuntaría a sí mismo (no a PostgreSQL), por lo que **lo correcto es usar `db-jolayacht`**.

- **Usuario**: `admin`  
  (el que definiste en `.env` con `DB_USER=admin`)

- **Contraseña**: `supersecret12321`  
  (la que definiste en `.env` con `DB_PASSWORD=supersecret12321`)

- **Base de datos**: `jolayacht`  
  (opcional, pero puedes ponerla para conectarte directamente a esa BD)

> ⚠️ **No uses `root` a menos que quieras**. Tienes un usuario `admin` creado, así que es mejor usar ese por seguridad.

---

### ✅ **Resumen de los campos:**

| Campo        | Valor               |
|--------------|---------------------|
| Sistema      | PostgreSQL               |
| Servidor     | `db-jolayacht`      |
| Usuario      | `admin`             |
| Contraseña   | `supersecret12321`     |
| Base de datos| `jolayacht` (opcional) |

Haz clic en **"Iniciar sesión"** y ¡deberías entrar!

---

### 🔍 ¿Por qué `db-jolayacht` y no `localhost`?

- Docker Compose crea una red interna donde cada servicio puede comunicarse usando el **nombre del servicio** como hostname.
- El contenedor de Adminer está en esa red, así que puede resolver `db-jolayacht` al contenedor de PostgreSQL.
- Si usas `localhost` desde Adminer, intentaría conectarse a **su propio contenedor** (que no tiene PostgreSQL), y fallaría.

---

### ✅ Extra: ¿Quieres acceder con `root`?

También puedes usar:

- Usuario: `root`
- Contraseña: `supersecret12321` (valor de `POSTGRES_PASSWORD`)

Pero se recomienda usar el usuario no-root (`admin`) para operaciones normales.

---

¡Listo! Con eso deberías poder gestionar tu base de datos desde Adminer sin problemas.