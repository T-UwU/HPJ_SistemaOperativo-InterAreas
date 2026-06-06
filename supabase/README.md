# Setup de Supabase — paso a paso

Esta guía deja el backend listo desde cero. Calcula 15–20 minutos la primera vez.

> **¿Qué usa Supabase realmente?**
> - ✅ **Auth** — login con email/password, sesiones reales
> - ✅ **Actividad cross-area** — la tabla `activity` con Realtime (campanita)
> - ⏳ **Datos operativos** (tickets, eventos, requisiciones…) — las tablas existen
>   y el seed las llena, pero la app aún los lee del store local (Zustand).
>   En modo online los cambios no persisten entre sesiones ni se sincronizan entre
>   dispositivos todavía. Eso es el siguiente paso de integración.
>
> En la práctica: Auth + Realtime funcionan en modo online. Todo lo demás funciona
> igual que en modo demo.

---

## Si ya tienes el proyecto en Supabase y solo quieres aplicar las migraciones nuevas

Corre solo los 4 archivos nuevos en el SQL Editor (en este orden):

```
supabase/add-events.sql
supabase/add-comments.sql
supabase/add-purchasing.sql
supabase/migrate-roles.sql
```

Si ya tienes usuarios creados y quieres agregar el de Compras, crea uno más:
- Email: `compras@palaciojulio.test` · Password: `demo1234`
- Metadata: `{ "name": "Roberto Fuentes", "role_id": "purchasing", "shift": "mat." }`

---

---

## 1 · Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) y crea cuenta si no tienes.
2. **New project** → elige un nombre (ej. `hpj-dev`), región (Mexico
   `aws-east-2` está bien), genera una contraseña fuerte para la BD
   (guárdala, la vas a necesitar si quieres conectarte directo a Postgres).
3. Espera 2 minutos a que provisione.

## 2 · Correr el schema

1. En el dashboard, ve a **SQL Editor** (icono de base de datos a la izquierda).
2. Click en **New query**.
3. Pega el contenido completo de `supabase/schema.sql` y dale **Run**
   (esquina inferior derecha).
4. Repite en orden con cada archivo:
   - `supabase/seed.sql` — datos iniciales (rooms, tickets, tasks…)
   - `supabase/add-events.sql` — tabla `events` (Ordenes de Evento)
   - `supabase/add-comments.sql` — tabla `comments` (comentarios contextuales)
   - `supabase/add-purchasing.sql` — tabla `requisitions` (rol Compras)
   - `supabase/migrate-roles.sql` — actualiza constraint de roles a los 5 activos

Si todo salió bien, en **Table Editor** verás las tablas `rooms`, `tickets`,
`tasks`, etc. con sus datos seed.

## 3 · Obtener las credenciales para el frontend

1. Ve a **Settings · API** (icono de engrane).
2. Copia:
   - **Project URL** → va en `VITE_SUPABASE_URL`
   - **anon · public** key → va en `VITE_SUPABASE_ANON_KEY`
   - **service_role · secret** key → la necesitarás SOLO para crear users
     desde el script (paso 5). NUNCA pongas esta key en el frontend.
3. En la raíz del proyecto, copia `.env.example` a `.env` y rellena las
   primeras dos:

   ```bash
   cp .env.example .env
   ```

## 4 · Crear los 5 usuarios demo

Necesitamos un usuario en `auth.users` por cada rol (recepción, limpieza, etc.).
Hay dos formas:

### Opción A · Script automático (recomendado)

1. Crea un archivo `.env.local` en la raíz del proyecto (este NO va al
   frontend, solo lo usa el script local) con:

   ```bash
   SUPABASE_URL=https://tuproyecto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ← la service_role key del paso 3
   ```

2. Corre:

   ```bash
   npm install
   npm run seed:users
   ```

   Output esperado:
   ```
   Hotel Palacio Julio · Creando 5 usuarios demo

     recepcion@palaciojulio.test            → ✓ reception
     limpieza@palaciojulio.test             → ✓ housekeeping
     ventas@palaciojulio.test               → ✓ sales
     mantenimiento@palaciojulio.test        → ✓ maintenance
     compras@palaciojulio.test              → ✓ purchasing

   Listo. 5 creados · 0 ya existían.
   ```

### Opción B · A mano desde el dashboard

Si no quieres usar la service_role key, en **Authentication · Users**
puedes crear uno por uno. Por cada usuario:

1. Click **Add user → Create new user**
2. Email: `recepcion@palaciojulio.test`
3. Password: `demo1234` · marca **Auto Confirm User**
4. En **Raw user meta data** pega:
   ```json
   { "name": "Lucía Ramírez", "role_id": "reception", "shift": "mat." }
   ```
5. **Create user**. El trigger crea su profile automáticamente.

Repite con los demás 4 usuarios (revisa `supabase/seed-users.js` para
los nombres y role_ids). Los 5 roles activos son:
`reception`, `housekeeping`, `sales`, `maintenance`, `purchasing`.

## 5 · Probar

```bash
npm run dev
```

Abre `http://localhost:5173`. Deberías ver el formulario de email/password
en vez del selector de roles. Login con:

- **recepcion@palaciojulio.test** / `demo1234`

Te lleva al home de Recepción. Toca la pestaña Yo · Cerrar sesión, vuelves
al login. Prueba con otro correo (ej. `limpieza@palaciojulio.test`) y entras
a Limpieza con el mismo password.

Si quieres seguir probando en modo demo local (sin tocar Supabase): en el
login, abajo, hay un link discreto **"Modo demo · sin servidor →"**.

## 6 · Verificar que todo está bien

En **Table Editor · profiles** deberías ver 5 rows (una por usuario)
con su role_id correcto. Si solo ves auth.users sin profile, el trigger
falló — vuelve a correr `schema.sql` y crea los users de nuevo.

---

## Troubleshooting

**Error "No se encontró perfil para este usuario"**
El trigger `on_auth_user_created` no se disparó. Esto pasa si creaste el
user antes de correr el schema. Solución: borra el user desde Auth · Users
y vuelve a crearlo.

**El formulario muestra "Invalid login credentials"**
- Verifica que el correo sea exactamente igual al que creaste
- Verifica que marcaste "Auto Confirm User" (o desde el script ya viene
  confirmado)
- En modo desarrollo, en **Authentication · Settings**, asegúrate que
  "Enable email confirmations" está deshabilitado, o no podrás entrar
  hasta verificar el correo.

**Hice cambios (ticket, evento, reserva) en modo online y al recargar desaparecieron**
Esperado por ahora. Los datos operativos (tickets, eventos, etc.) viven en
Zustand/localStorage. Las tablas en Supabase existen pero los hooks del store
aún no leen de ellas. La actividad cross-area sí persiste en Supabase.

**`npm run seed:users` truena con "fetch is not defined"**
Necesitas Node 18+. Verifica con `node --version`.

**Quiero resetear todo**
En SQL Editor: `truncate table auth.users cascade;` borra todos los users
(y por cascada sus profiles). Luego `truncate table rooms, tickets, ...`
para limpiar datos operativos. O simplemente vuelve a correr `seed.sql`.
