# Análisis de Migración: Supabase → Railway + Brevo

## 📊 Resumen Ejecutivo

**Complejidad de la migración: ALTA** 🔴

La migración de Supabase a Railway (PostgreSQL) + Brevo requerirá **cambios significativos** en el código, especialmente en el sistema de autenticación y autorización.

---

## 🔍 Estado Actual del Proyecto

### Servicios de Supabase Utilizados

1. **Autenticación (Supabase Auth)**
   - Login con email/password
   - Registro de usuarios
   - Reset de contraseña
   - Verificación de email
   - Gestión de sesiones (JWT tokens)
   - Tabla `auth.users` (sistema de Supabase)

2. **Base de Datos PostgreSQL**
   - Tablas: `profiles`, `invoices`, `expenses`
   - Row Level Security (RLS) con políticas basadas en `auth.uid()`
   - Función RPC: `create_or_update_profile` que referencia `auth.users`

3. **Cliente Supabase**
   - `@supabase/supabase-js` y `@supabase/ssr`
   - Clientes para navegador y servidor
   - Middleware de autenticación

---

## ⚠️ Desafíos Principales

### 1. **Sistema de Autenticación (CRÍTICO)**

**Problema:**
- Actualmente todo el sistema depende de `auth.users` de Supabase
- `auth.uid()` se usa en RLS policies para seguridad
- Las sesiones se manejan automáticamente con Supabase

**Solución requerida:**
- Implementar autenticación desde cero con:
  - JWT tokens (generación, validación, refresh)
  - Hash de contraseñas (bcrypt/argon2)
  - Gestión de sesiones
  - Middleware de autenticación personalizado

**Archivos a modificar:**
- `lib/supabase/auth-context.tsx` - Reemplazar completamente
- `middleware.ts` - Reescribir lógica de autenticación
- `lib/supabase/client.ts` y `server.ts` - Ya no necesarios
- Todos los componentes de autenticación

### 2. **Base de Datos - Esquema**

**Problema:**
- `profiles.user_id` referencia `auth.users.id` (tabla del sistema)
- RLS policies usan `auth.uid()` que no existe en PostgreSQL normal
- Función `create_or_update_profile` valida contra `auth.users`

**Solución requerida:**
- Crear tabla `users` propia:
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- Actualizar `profiles.user_id` para referenciar `users.id`
- Eliminar todas las RLS policies (reemplazar con lógica en la aplicación)
- Modificar `create_or_update_profile` para usar `users` en lugar de `auth.users`

**Archivos a modificar:**
- `supabase/schema.sql` - Adaptar para PostgreSQL sin Supabase
- `lib/supabase/profiles.ts` - Actualizar referencias
- `lib/supabase/invoices.ts` - Actualizar referencias
- `lib/supabase/expenses.ts` - Actualizar referencias

### 3. **Seguridad - Row Level Security (RLS)**

**Problema:**
- Actualmente RLS asegura que los usuarios solo vean sus datos
- Todas las políticas dependen de `auth.uid()`

**Solución requerida:**
- Eliminar RLS completamente
- Implementar validación en el código de la aplicación:
  - Middleware que valida el usuario autenticado
  - Queries que siempre filtran por `user_id`
  - Validación en cada operación de base de datos

**Riesgo:** Mayor responsabilidad en el código para asegurar seguridad

### 4. **Integración con Brevo**

**Problema:**
- Supabase maneja automáticamente emails de:
  - Verificación de email
  - Reset de contraseña
  - Confirmaciones

**Solución requerida:**
- Integrar Brevo SDK (`@getbrevo/brevo`)
- Crear funciones para enviar:
  - Email de verificación al registrarse
  - Email de reset de contraseña
  - Templates HTML para emails
- Gestionar tokens de verificación/reset

**Archivos a crear:**
- `lib/email/brevo.ts` - Cliente de Brevo
- `lib/email/templates.ts` - Plantillas de email
- API routes para verificación/reset

---

## 📋 Plan de Migración Detallado

### Fase 1: Preparación (2-3 días)

1. **Configurar Railway**
   - Crear base de datos PostgreSQL
   - Obtener connection string
   - Configurar variables de entorno

2. **Configurar Brevo**
   - Crear cuenta/obtener API key
   - Configurar dominio sender
   - Crear templates de email

3. **Backup de datos**
   - Exportar datos actuales de Supabase
   - Preparar scripts de migración de datos

### Fase 2: Migración de Base de Datos (3-4 días)

1. **Crear nuevo esquema**
   - Tabla `users` para reemplazar `auth.users`
   - Adaptar `profiles`, `invoices`, `expenses`
   - Eliminar RLS, adaptar funciones

2. **Migrar datos existentes**
   - Script para migrar usuarios de `auth.users` → `users`
   - Migrar perfiles, facturas, gastos
   - Validar integridad de datos

3. **Testing**
   - Verificar foreign keys
   - Validar índices
   - Probar funciones

### Fase 3: Implementar Autenticación (5-7 días)

1. **Sistema de autenticación**
   - Crear `lib/auth/jwt.ts` para tokens
   - Crear `lib/auth/password.ts` para hash
   - Crear `lib/db/users.ts` para operaciones de usuarios

2. **API Routes de autenticación**
   - `/api/auth/register` - Registro
   - `/api/auth/login` - Login
   - `/api/auth/verify-email` - Verificación
   - `/api/auth/reset-password` - Reset
   - `/api/auth/refresh` - Refresh token

3. **Middleware**
   - Reescribir `middleware.ts` para validar JWT
   - Actualizar protección de rutas

4. **Context de autenticación**
   - Reemplazar `lib/supabase/auth-context.tsx`
   - Adaptar componentes que usan `useAuth()`

### Fase 4: Integración de Brevo (2-3 días)

1. **Cliente Brevo**
   - Instalar SDK: `pnpm add @getbrevo/brevo`
   - Crear `lib/email/brevo.ts`
   - Configurar templates

2. **Endpoints de email**
   - Envío de verificación
   - Envío de reset de contraseña

### Fase 5: Actualizar Código Existente (4-5 días)

1. **Eliminar dependencias de Supabase**
   - Eliminar `@supabase/supabase-js` y `@supabase/ssr`
   - Reemplazar clientes de Supabase
   - Crear cliente PostgreSQL directo (`pg` o `@vercel/postgres`)

2. **Actualizar funciones de datos**
   - `lib/supabase/profiles.ts` → `lib/db/profiles.ts`
   - `lib/supabase/invoices.ts` → `lib/db/invoices.ts`
   - `lib/supabase/expenses.ts` → `lib/db/expenses.ts`
   - Eliminar referencias a `auth.uid()`, usar ID de usuario de sesión

3. **Actualizar stores**
   - Adaptar sincronización con nueva BD
   - Actualizar referencias de usuarios

### Fase 6: Testing y Ajustes (3-4 días)

1. **Testing completo**
   - Flujo de registro/login
   - Operaciones CRUD
   - Verificación de seguridad
   - Testing de emails

2. **Ajustes y optimizaciones**
   - Performance de queries
   - Manejo de errores
   - Logging

---

## 📦 Nuevas Dependencias Necesarias

```json
{
  "dependencies": {
    "@getbrevo/brevo": "^1.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/pg": "^8.10.9"
  }
}
```

O si prefieres usar `@vercel/postgres`:
```json
{
  "dependencies": {
    "@vercel/postgres": "^0.5.1"
  }
}
```

---

## ⏱️ Estimación de Tiempo Total

**Total: 19-26 días hábiles** (aproximadamente 4-5 semanas)

### Por Componente:
- Preparación: 2-3 días
- Base de datos: 3-4 días
- Autenticación: 5-7 días
- Brevo: 2-3 días
- Refactorización: 4-5 días
- Testing: 3-4 días

---

## 💰 Consideraciones de Costo

### Railway
- PostgreSQL: ~$5-20/mes (depende del tamaño)
- App hosting: Ya lo tienes cubierto

### Brevo
- Plan Free: 300 emails/día
- Plan Lite: $25/mes (10,000 emails/mes)
- Probablemente suficiente con plan Free o Lite

### Ahorro
- Ya no pagarías por Supabase (si es que pagabas)
- Mejor control sobre costos
- No hay límites de pausa automática

---

## ✅ Ventajas de la Migración

1. **Sin pausas automáticas** - Railway no pausa proyectos inactivos
2. **Control total** - Sobre la base de datos y autenticación
3. **Costo predecible** - Railway tiene pricing claro
4. **Integración con tu infraestructura** - Todo en Railway
5. **Mejor para producción** - Más estable para clientes

---

## ❌ Desventajas/Desafíos

1. **Tiempo de desarrollo** - 4-5 semanas de trabajo
2. **Mayor complejidad** - Más código que mantener
3. **Seguridad** - Debes asegurar bien el sistema de auth
4. **Testing exhaustivo** - Necesario para seguridad crítica
5. **Pérdida de características de Supabase** - RLS automático, auth listo, etc.

---

## 🎯 Recomendación

### Opción 1: Migrar (Recomendado si...)
- Tienes el tiempo disponible (4-5 semanas)
- La estabilidad es crítica (no puedes permitir pausas)
- Quieres control total
- Planeas escalar la aplicación

### Opción 2: Mantener Supabase (Recomendado si...)
- Necesitas entregar rápido
- No puedes dedicar 4-5 semanas
- Consideras actualizar a plan de pago de Supabase (~$25/mes)
- Prefieres menos mantenimiento

---

## 📝 Siguiente Paso

Si decides migrar, te recomiendo:

1. **Crear una rama de migración** (`feature/migrate-to-railway`)
2. **Comenzar con la Fase 1** (setup de Railway y Brevo)
3. **Hacer migración en paralelo** - Mantener Supabase funcionando mientras migras
4. **Testing exhaustivo** antes de cambiar producción
5. **Deployment gradual** - Posiblemente un periodo de transición con ambos sistemas

---

## 🔧 Archivos que Necesitarán Cambios Mayores

```
lib/supabase/
├── auth-context.tsx          → REESCRIBIR COMPLETAMENTE
├── client.ts                 → ELIMINAR
├── server.ts                 → ELIMINAR
├── profiles.ts               → MIGRAR a lib/db/profiles.ts
├── invoices.ts               → MIGRAR a lib/db/invoices.ts
└── expenses.ts               → MIGRAR a lib/db/expenses.ts

middleware.ts                 → REESCRIBIR (validación JWT)

app/auth/components/
├── login-form.tsx            → ACTUALIZAR (nuevas APIs)
└── register-form.tsx         → ACTUALIZAR (nuevas APIs)

app/api/auth/                 → CREAR (nuevas rutas)
├── register/route.ts
├── login/route.ts
├── verify-email/route.ts
└── reset-password/route.ts

lib/
├── auth/                     → CREAR
│   ├── jwt.ts
│   ├── password.ts
│   └── middleware.ts
├── db/                       → CREAR
│   ├── client.ts (PostgreSQL)
│   ├── users.ts
│   ├── profiles.ts
│   ├── invoices.ts
│   └── expenses.ts
└── email/                    → CREAR
    ├── brevo.ts
    └── templates.ts

supabase/schema.sql           → ADAPTAR (sin auth.users, sin RLS)
```

---

**¿Necesitas ayuda para comenzar con alguna fase específica?** Puedo ayudarte a crear los scripts de migración o implementar el sistema de autenticación.


