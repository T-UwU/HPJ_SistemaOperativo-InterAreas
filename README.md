# Sistema Operativo Palacio Julio

Guía de instalación, configuración y despliegue para el responsable técnico del
hotel.

Aplicación web interna que coordina las áreas operativas del Hotel Palacio Julio
(Recepción, Limpieza, Ventas, Mantenimiento y Compras) más un módulo de
administración de usuarios (TI). Está construida como una aplicación de página
única (SPA) con React y Vite, y usa Supabase como backend (base de datos, sesiones,
tiempo real, almacenamiento de fotos y funciones de servidor).

---

## Contenido

1. Cómo funciona (arquitectura)
2. Requisitos previos
3. Estructura del proyecto
4. Puesta en marcha rápida (modo demostración, sin backend)
5. Configuración completa con Supabase
   - 5.1 Crear el proyecto y obtener las llaves
   - 5.2 Crear la base de datos
   - 5.3 Habilitar el rol TI y la suspensión de usuarios
   - 5.4 Crear el almacenamiento de fotos (bucket "evidence")
   - 5.5 Configurar las variables de entorno
   - 5.6 Crear los usuarios iniciales
   - 5.7 Desplegar las funciones de servidor (Edge Functions)
6. Ejecutar en desarrollo
7. Compilar y desplegar a producción
8. Referencia de variables de entorno
9. Operación y mantenimiento
10. Seguridad
11. Solución de problemas
12. Referencia rápida de comandos

---

## 1. Cómo funciona (arquitectura)

El sistema tiene dos piezas:

- **Frontend (esta carpeta):** una aplicación estática (HTML, CSS y JavaScript)
  generada con Vite. No necesita un servidor propio: se puede servir desde
  cualquier alojamiento de archivos estáticos.
- **Backend (Supabase):** un servicio en la nube que provee la base de datos
  (PostgreSQL), el inicio de sesión (Auth), la sincronización en tiempo real
  (Realtime), el almacenamiento de fotografías (Storage) y dos funciones de
  servidor (Edge Functions) para la administración de usuarios.

La aplicación opera en dos modos, según existan o no las credenciales de Supabase:

- **Modo en línea (recomendado para producción):** con las variables de entorno
  configuradas. Inicio de sesión con correo y contraseña, datos reales en la base,
  sincronización en tiempo real entre dispositivos y almacenamiento de fotos.
- **Modo demostración (sin backend):** si no hay variables de entorno, la
  aplicación arranca con un selector de áreas, sin contraseña, y guarda los datos
  solo en el navegador. Sirve para mostrar la interfaz sin configurar nada.

---

## 2. Requisitos previos

| Herramienta | Versión recomendada | Para qué |
|---|---|---|
| Node.js | 20 LTS (mínimo 18) | Compilar y ejecutar la aplicación |
| npm | El que viene con Node | Instalar dependencias y correr scripts |
| Cuenta de Supabase | Plan gratuito es suficiente para empezar | Backend |
| Supabase CLI | Última | Desplegar las funciones de servidor (paso 5.7) |
| Git | Opcional | Clonar y versionar el proyecto |

Verifique la versión de Node con:

```bash
node --version
```

Si necesita instalar Node, descárguelo de [nodejs.org](https://nodejs.org) (elija
la versión "LTS").

---

## 3. Estructura del proyecto

```
Site_HPJ/
├── package.json              Dependencias y scripts (dev, build, preview, seed:users)
├── vite.config.js            Configuración del servidor de desarrollo y empaquetado
├── index.html                Punto de entrada de la aplicación
├── .env.example              Plantilla de variables de entorno del frontend
├── docs/
│   └── MANUAL-DE-USO.md      Manual de uso para el personal
├── supabase/                 Todo lo relacionado con el backend
│   ├── schema.sql            Tablas base, seguridad (RLS), tiempo real y disparador de alta
│   ├── add-messages.sql      Tabla del chat entre áreas
│   ├── add-activity.sql      Tabla de actividad (notificaciones)
│   ├── add-events.sql        Tabla de eventos
│   ├── add-comments.sql      Tabla de comentarios contextuales
│   ├── add-purchasing.sql    Tabla de requisiciones (Compras)
│   ├── migrate-roles.sql     Migración del catálogo de roles (bases antiguas)
│   ├── reset.sql             Herramienta para borrar datos y reconstruir (destructivo)
│   ├── seed.sql              Datos de ejemplo (opcional)
│   ├── seed-users.js         Script para crear los usuarios de ejemplo
│   └── functions/            Funciones de servidor (Edge Functions)
│       ├── create-user/      Alta de usuarios (usada por TI)
│       └── manage-user/      Cambio de contraseña y suspensión (usada por TI)
└── src/                      Código del frontend
    ├── main.jsx              Arranque de React
    ├── App.jsx               Ruteo y carga inicial de sesión
    ├── lib/supabase.js       Cliente de Supabase y detección de modo
    ├── store/                Estado de la aplicación (sesión, datos, chat, actividad, evidencia)
    ├── ui/                   Componentes compartidos (barra, logo, calendario, etc.)
    ├── pages/Login.jsx       Pantalla de acceso
    └── roles/                Una carpeta por área: reception, housekeeping, sales,
                              maintenance, purchasing, ti
```

---

## 4. Puesta en marcha rápida (modo demostración, sin backend)

Para ver la aplicación funcionando en unos minutos, sin configurar Supabase:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` en el navegador. Aparecerá un selector de áreas;
elija una para entrar. Los datos se guardan solo en ese navegador.

Este modo es útil para una demostración o para revisar la interfaz. Para uso real
del hotel, continúe con la configuración de Supabase.

---

## 5. Configuración completa con Supabase

### 5.1 Crear el proyecto y obtener las llaves

1. Entre a [supabase.com](https://supabase.com) y cree una cuenta.
2. Seleccione **New project**. Asigne un nombre (por ejemplo, `palacio-julio`),
   elija una región cercana (México o el este de EE. UU.) y defina una contraseña
   para la base de datos (guárdela en un lugar seguro).
3. Espere a que el proyecto termine de aprovisionarse (uno o dos minutos).
4. Vaya a **Settings** y luego **API**. Anote estos tres valores:
   - **Project URL** (por ejemplo, `https://abcd1234.supabase.co`).
   - **anon public** (llave pública, va en el frontend).
   - **service_role** (llave secreta de administración; NUNCA debe ir en el
     frontend ni publicarse).

### 5.2 Crear la base de datos

En el panel de Supabase, abra **SQL Editor**, seleccione **New query**, y ejecute
los siguientes archivos **en este orden**. Para cada uno: copie el contenido del
archivo, péguelo en el editor y presione **Run**.

1. `supabase/schema.sql`
2. `supabase/add-messages.sql`
3. `supabase/add-activity.sql`
4. `supabase/add-events.sql`
5. `supabase/add-comments.sql`
6. `supabase/add-purchasing.sql`

> El archivo `supabase/seed.sql` (datos de ejemplo) es **opcional**. Úselo solo si
> desea poblar la base con información de prueba. Para un arranque limpio en
> producción, omítalo.

### 5.3 Habilitar el rol TI y la suspensión de usuarios

El esquema base no incluye todavía el rol de TI ni la función de suspender
usuarios. Ejecute el siguiente bloque en el **SQL Editor** una sola vez para
dejarlos listos:

```sql
-- Columna para suspender accesos (la usa el módulo de TI)
alter table public.profiles
  add column if not exists suspended boolean not null default false;

-- Catálogo de roles definitivo (incluye Compras y TI)
alter table public.profiles
  drop constraint if exists profiles_role_id_check;
alter table public.profiles
  add constraint profiles_role_id_check
  check (role_id in (
    'reception', 'housekeeping', 'maintenance', 'sales', 'purchasing', 'ti'
  ));

-- Disparador de alta de usuarios con soporte para TI
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role_id, shift)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name',    split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role_id', 'reception'),
    coalesce(new.raw_user_meta_data->>'shift',   'mat.')
  )
  on conflict (id) do update
    set name    = excluded.name,
        role_id = excluded.role_id,
        shift   = excluded.shift;
  return new;
end; $$;

-- Función auxiliar: indica si el usuario actual pertenece a TI
create or replace function public.is_ti()
returns boolean language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role_id = 'ti'
  );
$$;

-- Regla de seguridad: TI puede modificar cualquier perfil
drop policy if exists "ti update any profile" on public.profiles;
create policy "ti update any profile"
  on public.profiles for update
  using  (public.is_ti())
  with check (public.is_ti());
```

> Si está actualizando una base creada hace tiempo (con roles antiguos como
> "kitchen" o "concierge"), ejecute primero `supabase/migrate-roles.sql` y luego el
> bloque anterior.

### 5.4 Crear el almacenamiento de fotos (bucket "evidence")

Limpieza y Mantenimiento adjuntan fotografías. Estas se guardan en un contenedor
de Storage llamado **evidence**.

1. En el panel de Supabase, abra **Storage** y seleccione **New bucket**.
2. Nombre del bucket: `evidence` (exactamente así, en minúsculas).
3. Marque el bucket como **Public** (las fotos se muestran mediante una URL
   pública).
4. Cree el bucket.
5. Vuelva al **SQL Editor** y ejecute las siguientes reglas para permitir que el
   personal autenticado suba fotografías:

```sql
create policy "evidence authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'evidence');

create policy "evidence authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'evidence');

create policy "evidence public read"
  on storage.objects for select
  using (bucket_id = 'evidence');
```

### 5.5 Configurar las variables de entorno

En la raíz del proyecto cree dos archivos.

**Archivo `.env`** (lo usa el frontend; puede copiar la plantilla `.env.example`):

```bash
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...          # la llave anon public
```

**Archivo `.env.local`** (lo usa solo el script de creación de usuarios; nunca se
publica ni se incluye en el frontend):

```bash
SUPABASE_URL=https://abcd1234.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # la llave service_role (secreta)
```

> Importante: la llave **service_role** otorga control total de la base. Solo debe
> existir en `.env.local` (uso local del responsable técnico) y en la
> configuración de las funciones de servidor. Jamás debe colocarse en `.env` ni
> publicarse.

### 5.6 Crear los usuarios iniciales

Cada persona necesita una cuenta. Hay tres formas:

**Opción A: script automático (recomendada para el arranque).** Con `.env.local`
ya configurado, ejecute:

```bash
npm install
npm run seed:users
```

Esto crea las cuentas de ejemplo (una por área, incluida TI) con la contraseña
`demo1234`. Cámbielas en producción.

**Opción B: desde el panel de Supabase.** En **Authentication** y luego **Users**,
seleccione **Add user**, capture correo y contraseña, marque **Auto Confirm User**
y en **Raw user meta data** indique el rol, por ejemplo:

```json
{ "name": "Nombre Apellido", "role_id": "reception", "shift": "mat." }
```

Los roles válidos son: `reception`, `housekeeping`, `sales`, `maintenance`,
`purchasing`, `ti`.

**Opción C: desde la aplicación (una vez que exista al menos un usuario de TI).**
La persona de TI puede dar de alta al resto del personal desde el propio sistema
(requiere las funciones de servidor del paso 5.7).

> Cree al menos **un usuario con rol `ti`**. Desde esa cuenta se administran las
> demás, se restablecen contraseñas y se suspenden accesos.

### 5.7 Desplegar las funciones de servidor (Edge Functions)

Las acciones de TI (crear usuarios, cambiar contraseñas y suspender accesos) se
realizan mediante dos funciones de servidor. Para publicarlas se usa la Supabase
CLI:

1. Instale la CLI (o use `npx supabase` en cada comando):

   ```bash
   npm install -g supabase
   ```

2. Inicie sesión y enlace el proyecto (el identificador de proyecto aparece en
   **Settings** y luego **General**, como "Reference ID"):

   ```bash
   supabase login
   supabase link --project-ref SU_REFERENCE_ID
   ```

3. Despliegue ambas funciones:

   ```bash
   supabase functions deploy create-user
   supabase functions deploy manage-user
   ```

> Supabase provee automáticamente a las funciones las variables `SUPABASE_URL`,
> `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`, de modo que no es necesario
> configurarlas a mano. Si no se despliegan estas funciones, el módulo de TI no
> podrá crear usuarios, cambiar contraseñas ni suspender accesos, aunque el resto
> del sistema funcionará con normalidad.

---

## 6. Ejecutar en desarrollo

```bash
npm install      # solo la primera vez
npm run dev
```

La aplicación queda en `http://localhost:5173`.

Para probar desde un teléfono en la misma red local (Wi-Fi), el servidor ya se
expone a la red: Vite imprime una dirección del tipo `http://192.168.x.x:5173`
que puede abrirse desde el celular.

---

## 7. Compilar y desplegar a producción

### 7.1 Generar la versión de producción

```bash
npm run build
```

Esto crea la carpeta `dist/` con los archivos estáticos finales. Para revisarla
localmente antes de publicar:

```bash
npm run preview
```

### 7.2 Publicar

La carpeta `dist/` puede alojarse en cualquier servicio de archivos estáticos.
Opciones comunes:

- **Vercel, Netlify o Cloudflare Pages:** conecte el repositorio o suba la carpeta.
  Configure el comando de compilación como `npm run build` y la carpeta de salida
  como `dist`.
- **Servidor propio:** copie el contenido de `dist/` a la carpeta pública del
  servidor web (Nginx, Apache, etc.).

En cualquiera de los casos debe hacer dos cosas:

1. **Definir las variables de entorno** `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` en la configuración del servicio de alojamiento, para
   que la versión de producción se conecte a Supabase. (Estas variables se aplican
   al momento de compilar.)
2. **Configurar la redirección de rutas (SPA fallback).** Como es una aplicación
   de página única, todas las rutas deben servir `index.html`. Ejemplos:
   - Netlify: cree un archivo `_redirects` con la línea `/*  /index.html  200`.
   - Vercel: normalmente lo detecta solo; si no, agregue una regla de reescritura
     de `/(.*)` hacia `/index.html`.
   - Nginx: use `try_files $uri /index.html;`.

### 7.3 Uso desde dispositivos del personal

El sistema está pensado para teléfono. El personal abre la dirección publicada en
el navegador del celular y, si lo desea, puede usar la opción "Agregar a la
pantalla de inicio" para tenerlo como un acceso directo.

---

## 8. Referencia de variables de entorno

| Variable | Archivo | Quién la usa | Descripción |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `.env` | Frontend | URL del proyecto de Supabase |
| `VITE_SUPABASE_ANON_KEY` | `.env` | Frontend | Llave pública (anon) |
| `SUPABASE_URL` | `.env.local` | Script de usuarios | URL del proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | Script de usuarios | Llave secreta de administración |

Si no se definen `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, la aplicación
arranca en modo demostración (sin backend).

---

## 9. Operación y mantenimiento

**Alta, cambio de contraseña y suspensión de personal.** Se realizan desde la
cuenta de TI dentro de la aplicación (véase el Manual de Uso, apartado 9). Requiere
las funciones de servidor desplegadas (paso 5.7).

**Restablecer una contraseña olvidada.** TI edita al usuario y le asigna una
contraseña temporal nueva; la persona la cambia después.

**Cambiar las contraseñas de ejemplo.** Si usó el script de creación, todas las
cuentas comparten la contraseña `demo1234`. Cámbielas desde TI o desde el panel de
Supabase antes de poner el sistema en operación real.

**Borrar los datos de prueba y empezar limpio.** El archivo `supabase/reset.sql`
vacía las tablas operativas y reconstruye las reglas. Es una operación
**destructiva**: úsela solo cuando quiera eliminar todos los datos. Lea los
comentarios del archivo antes de ejecutarlo.

**Respaldos.** Supabase realiza respaldos automáticos según el plan contratado.
Para un respaldo manual puede exportar la base desde **Database** y luego
**Backups**, o conectarse por Postgres con la contraseña definida al crear el
proyecto.

---

## 10. Seguridad

- La llave **service_role** nunca debe colocarse en `.env` ni publicarse. Solo va
  en `.env.local` y en las funciones de servidor de Supabase.
- El acceso a los datos está protegido por reglas de seguridad a nivel de fila
  (RLS): solo usuarios autenticados pueden leer y escribir, y solo TI puede
  modificar perfiles ajenos.
- Cada cuenta es personal. Conviene establecer contraseñas robustas y cambiar las
  de ejemplo antes de operar.
- Evite registrar datos personales de huéspedes en descripciones, comentarios o
  fotografías, salvo lo estrictamente necesario para la operación.
- Los archivos `.env` y `.env.local` no deben subirse al control de versiones.
  Verifique que estén listados en `.gitignore`.

---

## 11. Solución de problemas

**Al arrancar `npm run dev`, a veces Supabase no carga y hay que reiniciar.**
Ya está corregido en `vite.config.js`, que pre-empaqueta Supabase al iniciar.
Si reaparece, detenga el servidor, borre la caché con
`Remove-Item -Recurse -Force node_modules\.vite` (en PowerShell) y vuelva a
ejecutar `npm run dev`.

**La aplicación muestra el selector de áreas en vez del inicio de sesión.**
Significa que no detecta las variables de entorno. Verifique que `.env` exista en
la raíz con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, y reinicie
`npm run dev`.

**"No se encontró perfil para este usuario" al iniciar sesión.**
El disparador de alta no se ejecutó (suele pasar si el usuario se creó antes de
correr el esquema). Elimine al usuario en **Authentication** y luego **Users**, y
créelo de nuevo.

**"Invalid login credentials".**
Revise que el correo y la contraseña sean correctos y que el usuario esté
confirmado. En **Authentication** y luego **Providers/Settings**, durante la puesta
en marcha conviene tener desactivada la confirmación por correo.

**El módulo de TI responde con un error al crear usuarios o suspender accesos.**
Asegúrese de haber desplegado las funciones `create-user` y `manage-user`
(paso 5.7) y de que la cuenta tenga rol `ti`. La función de suspender requiere,
además, la columna `suspended` y la función `is_ti()` del paso 5.3.

**Las fotografías no se suben o no se ven.**
Verifique que el bucket `evidence` exista, esté marcado como público y tenga las
reglas de Storage del paso 5.4.

**No llegan las notificaciones en tiempo real.**
Confirme que el esquema y los archivos `add-*.sql` se ejecutaron completos: incluyen
la habilitación de Realtime para cada tabla.

---

## 12. Referencia rápida de comandos

```bash
npm install            # Instalar dependencias (primera vez)
npm run dev            # Servidor de desarrollo (http://localhost:5173)
npm run build          # Compilar a producción (genera dist/)
npm run preview        # Previsualizar la versión compilada
npm run seed:users     # Crear los usuarios de ejemplo (requiere .env.local)

# Funciones de servidor (requiere Supabase CLI y proyecto enlazado)
supabase functions deploy create-user
supabase functions deploy manage-user
```

---

*Hotel Palacio Julio, Centro Histórico, Puebla, México.*
</content>
