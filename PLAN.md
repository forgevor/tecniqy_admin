# Plan de desarrollo — Tecniqy Admin

Hoja de ruta para llevar el admin de "diseño con mock data" a un panel
funcional integrado con el backend Spring Boot.

---

## Estado actual

Funcionando con **mock data en todas las páginas**. La estructura visual
está armada:

- Layout `default.vue` con sidebar + top bar
- Layout `auth.vue` para login
- Composable `useAuth.ts` simulado (no llama al backend)
- Middleware `auth.global.ts` que solo verifica cookie
- Pages: `/`, `/login`, `/users`, `/subscriptions`, `/metrics`

Faltan páginas del sidebar: `/activity`, `/support`.

---

## Backend disponible

URL base local: `http://localhost:8080`
URL base prod: TBD (semana del deploy)

Documentación de endpoints actuales: **Swagger UI en
`http://localhost:8080/swagger-ui.html`**.

Roles definidos en BD: `TECHNICIAN` (default), `ADMIN`. Solo el `ADMIN`
puede usar este panel. Los técnicos del mobile NO deben poder loguearse
acá (validación de rol en el middleware).

### Credenciales del admin (dev)

El backend tiene un `AdminSeeder` que crea un admin user al arrancar si
las env vars están definidas:

```bash
ADMIN_SEED_EMAIL=admin@tecniqy.com
ADMIN_SEED_PASSWORD=ChangeMe123!
ADMIN_SEED_FULL_NAME=Admin
```

Si no están definidas, el seeder no hace nada — hay que crear el admin
manualmente vía SQL:

```sql
INSERT INTO technicians (email, password_hash, full_name, role)
VALUES ('admin@tecniqy.com', '<bcrypt-hash>', 'Admin', 'ADMIN');
```

---

## Fases del plan

### Fase 1 — Auth real + role guard ⚡ (la más crítica)

Sin esto, todo el panel es estético. Bloqueante para todo lo demás.

**Tareas:**
1. Eliminar el mock de `useAuth.login()`.
2. Llamar a `POST /api/v1/auth/login` con `{ email, password }`.
3. Guardar `accessToken` + `refreshToken` (cookie httpOnly idealmente,
   o localStorage para MVP).
4. Guardar el `technician` (incluye `role`) en `useState`.
5. **Validar role**: si `technician.role !== 'ADMIN'`, mostrar error
   "No autorizado" y limpiar sesión.
6. Implementar `useApi()` composable: wrapper de `$fetch` que agrega
   `Authorization: Bearer <token>` y maneja 401 (refresh o redirect a
   login).
7. Refresh token: cuando un endpoint retorna 401, llamar a
   `POST /api/v1/auth/refresh` con `{ refreshToken }`, guardar el
   nuevo access, reintentar el request original. Si refresh falla →
   logout.
8. Logout: `POST /api/v1/auth/logout` con `{ refreshToken }` + limpiar
   cookies/storage.
9. Middleware: además de verificar token presente, decode JWT (o
   chequear cached user) y validar role=ADMIN.

**Referencia DTOs** (lo que retorna `/auth/login`):

```typescript
type AuthResponse = {
  accessToken: string
  refreshToken: string
  technician: {
    id: string  // UUID
    email: string
    fullName: string
    phone: string | null
    city: string | null
    serviceType: string | null
    plan: 'TRIAL' | 'MONTHLY' | 'ANNUAL'
    status: 'TRIAL' | 'ACTIVE' | 'OVERDUE' | 'CANCELED'
    role: 'TECHNICIAN' | 'ADMIN'  // ← validar que sea ADMIN
    trialEndsAt: string | null  // ISO datetime
    createdAt: string  // ISO datetime
  }
}
```

---

### Fase 2 — Página /users con data real

Reemplaza la `mockUsers` de `pages/users.vue` con datos del backend.

**Tareas:**
1. Llamar a `GET /api/v1/admin/users?page=0&size=20&q=&status=&plan=`
   con `Authorization`.
2. Mapear respuesta (paginated) a la tabla.
3. Wirear chips de filtros: tap en "Activos" → recarga con `status=ACTIVE`.
4. Wirear search bar (si la sumás): debounce 400ms y refetch con `q=`.
5. Paginación: scroll infinito o paginador clásico.
6. Click en row → abrir modal o página `/users/{id}` con detalle:
   - Datos del técnico
   - Conteo de trabajos (total / activos / archivados)
   - Última actividad
   - Plan + status
   - Acciones admin: cambiar plan, suspender, restaurar, eliminar
7. Botón "..." (icon más): menú con acciones rápidas (suspender,
   eliminar, ver detalle).

**Backend pendiente** (yo lo creo, ver sección "Endpoints a priorizar"):
- `GET /api/v1/admin/users` con paginación + filtros
- `GET /api/v1/admin/users/{id}` detalle + estadísticas
- `PATCH /api/v1/admin/users/{id}` para acciones admin

---

### Fase 3 — Dashboard `/` con métricas reales

Reemplaza los `3,247 / 2,891 / $864K` hardcoded por valores del backend.

**Tareas:**
1. Llamar a `GET /api/v1/admin/metrics/overview` al cargar la página.
2. Mapear a las 4 metric cards: Total técnicos, Suscripciones activas,
   MRR, Cuentas vencidas.
3. El chart "Registros nuevos · últimos 14 días" → llamar a
   `GET /api/v1/admin/metrics/registrations?days=14`. Sumar librería
   de charts (recomendado: **Chart.js** o **ECharts** vía wrapper Vue).
4. La distribución por plan → ya viene en el overview.

**Backend pendiente:**
- `GET /api/v1/admin/metrics/overview`
- `GET /api/v1/admin/metrics/registrations?days=N`

---

### Fase 4 — Página /metrics

Página dedicada con métricas avanzadas. **Stripe está postpuesto**, así
que MRR/ARR/LTV/CAC pueden quedar como mock por ahora (poner badge
"Próximamente · datos reales con integración Stripe").

**Tareas:**
1. Las métricas técnicas (técnicos por país, distribución de servicio)
   → datos reales del backend.
2. Las métricas financieras (MRR, ARR, churn) → dejar mock por ahora
   con disclaimer "Estimado · datos completos con Stripe".

**Backend pendiente:**
- `GET /api/v1/admin/metrics/distribution?by=country|service|plan`

---

### Fase 5 — Página /subscriptions

Similar a Fase 4: lo que dependa de Stripe queda mock. Lo que sea de
trial expirations y plan changes ya está en BD.

**Tareas:**
1. "Renovaciones próximas 7 días" → mock hasta Stripe (no tenemos
   billing dates reales aún).
2. "Cuentas en riesgo" → podemos derivar de `status=OVERDUE` del
   backend (eso sí existe ya).

---

### Fase 6 — Páginas faltantes del sidebar

#### `/activity`
Audit log de acciones admin. Para MVP: tabla simple con últimas 50
acciones. Schema sugerido:

```
audit_log
  id          UUID
  actor_id    FK technicians (admin que ejecutó)
  action      VARCHAR (ej. "USER_SUSPENDED", "PLAN_CHANGED")
  target_type VARCHAR (ej. "TECHNICIAN", "JOB")
  target_id   UUID
  metadata    JSONB (detalles libres)
  created_at  TIMESTAMPTZ
```

**Backend pendiente:**
- Migration `V7__init_audit_log.sql`
- `AuditLogService` que ofrezca método `log(action, target, metadata)`
  usado por `JobService`, `ClientService`, futuro admin actions, etc.
- `GET /api/v1/admin/audit?page=&size=&actorId=&action=`

#### `/support`
Para MVP: vista simple con link a email de soporte + lista de
conversaciones (si se integra Crisp/Intercom). Por ahora, page con
texto "Próximamente — integraremos chat de soporte aquí".

---

## Endpoints a priorizar (yo los creo en orden)

Orden por bloqueo de Gemini:

| # | Endpoint | Para qué | Estado |
|---|---|---|---|
| 1 | Role guard en Spring Security | Sin esto cualquier técnico podría usar endpoints admin | 🔧 |
| 2 | `GET /api/v1/admin/users` | Página /users (la más visible) | 🔧 |
| 3 | `GET /api/v1/admin/metrics/overview` | Dashboard `/` | 🔧 |
| 4 | `GET /api/v1/admin/users/{id}` | Detalle de usuario | 🔧 |
| 5 | `PATCH /api/v1/admin/users/{id}` | Acciones admin (suspend, etc.) | 🔧 |
| 6 | `GET /api/v1/admin/metrics/registrations` | Chart del dashboard | 🔧 |
| 7 | `GET /api/v1/admin/metrics/distribution` | /metrics | 🔧 |
| 8 | `audit_log` table + endpoint | /activity | 🔧 |

🔧 = a crear.

---

## Convenciones de diseño (mantener)

- CSS variables ya definidas en `assets/css/main.css`: `--primary`,
  `--surface`, `--text`, `--text-muted`, `--border`, `--status-done`,
  `--status-pending`, etc. **NO hardcodear colores en componentes.**
- Componentes shared en `components/`: `TqIcon`, `TqLogo`, `BaseIcon`.
  Agregar nuevos si hace falta (ej. `TqMetricCard`, `TqDataTable` para
  no repetir el patrón en cada página).
- Tipografía mono para números (avatares, IDs, fechas tipo
  "26 may 2026"): usar `class="tnum mono"`.
- Cards: `class="card"` (white bg + border + radius).
- Toda string visible al usuario en español neutral (sin voseo).

---

## Stack técnico

- Nuxt 4 + Vue 3 (Composition API + `<script setup>`)
- Zod para validación de forms
- Posibles libs a sumar:
  - `@vueuse/core` (debounce, useFetch wrappers)
  - `chart.js` + `vue-chartjs` para charts (recomendado)
  - O `echarts` + `vue-echarts` si querés algo más serio

---

## Cosas que NO hacer

- ❌ Llamar directo al backend sin pasar por `useApi()` (perderías el
  retry de 401)
- ❌ Hardcodear `localhost:8080` en código de página → usar
  `useRuntimeConfig().public.apiBase`
- ❌ Mostrar datos sensibles de técnicos sin masking (ej. passwords,
  tokens — nunca deberían llegar al frontend igual)
- ❌ Tomar decisiones de UX sin validar primero — preguntar al humano

---

## Cuando estés bloqueado

Mensaje al humano con:
1. Qué intentaste
2. Qué endpoint estás esperando
3. Qué decisión necesitás que confirme
