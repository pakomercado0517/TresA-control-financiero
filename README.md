# 💰 TresA Control Financiero

> Sistema de gestión financiera para el control de facturas CFDI (México) con generación de reportes en PDF. Desarrollado por **TresA Design**.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-FF6B6B?style=flat-square)](https://zustand-demo.pmnd.rs/)

---

## 📋 Descripción

Aplicación web profesional diseñada para el control y gestión de facturas CFDI (Comprobante Fiscal Digital por Internet) en México. El sistema permite procesar facturas XML, identificar automáticamente su tipo (PUE, PPD o Complemento de Pago), gestionar ingresos y gastos, y generar reportes financieros profesionales en formato PDF.

**Desarrollado por [TresA Design](https://tresadesign.com)** - Productos digitales de calidad empresarial.

### 🎯 Características Principales

- **📄 Procesamiento de XML CFDI 4.0**

  - Parseo automático de facturas XML
  - Identificación de tipo de factura (PUE, PPD, Complemento de Pago)
  - Extracción de datos fiscales (RFC, montos, fechas, conceptos)

- **💰 Gestión de Ingresos**

  - Carga masiva de facturas de ingreso
  - Validación de RFC del emisor
  - Seguimiento de pagos parciales (PPD)
  - Vinculación automática de complementos de pago

- **🛒 Gestión de Gastos**

  - Carga de facturas de compra (XML)
  - Registro manual de gastos (sin XML)
  - Validación de RFC del receptor
  - Clasificación automática por tipo

- **📊 Dashboard y Reportes**

  - Visualización de métricas financieras en tiempo real
  - Filtrado por mes y año
  - Cálculo automático de:
    - Total facturado
    - Total pagado
    - Total en compras
    - Pendiente por pagar
    - Diferencia ingresos vs gastos
  - Exportación a PDF con diseño profesional

- **🔒 Validaciones y Seguridad**

  - Validación de RFC del cliente
  - Verificación de coincidencia de RFC en facturas (bloquea carga si no coincide)
  - Matching de complementos de pago con facturas PPD
  - Perfil de cliente configurable
  - Autenticación segura con Supabase Auth

- **☁️ Sincronización en la Nube**

  - Almacenamiento en Supabase (PostgreSQL)
  - Sincronización automática de datos
  - Row Level Security (RLS) para protección de datos
  - Backup automático en la nube
  - Acceso desde múltiples dispositivos

- **🔐 Autenticación y Usuarios**

  - Sistema de registro e inicio de sesión
  - Gestión de perfiles de usuario
  - Protección de rutas con middleware
  - Sesiones persistentes

---

## 🚀 Stack Tecnológico

### Core

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **UI Library**: [React 19](https://react.dev/)

### Estilos y UI

- **CSS Framework**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes**: [Shadcn/ui](https://ui.shadcn.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)

### Estado y Datos

- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Base de Datos**: [Supabase](https://supabase.com) (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Parser XML**: [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)

### Utilidades

- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jspdf-autotable)
- **Validación**: [Zod](https://zod.dev/)
- **Formularios**: [React Hook Form](https://react-hook-form.com/)
- **Notificaciones**: [Sonner](https://sonner.emilkowal.ski/)

### Herramientas de Desarrollo

- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linter**: ESLint
- **Type Checking**: TypeScript

---

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm/yarn
- Cuenta en [Supabase](https://supabase.com) (gratuita)

### Pasos

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd control-ingresos/finance-reports
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env.local` en la raíz del proyecto:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

4. **Configurar base de datos en Supabase**

   - Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
   - Abre el **SQL Editor**
   - Ejecuta el archivo `supabase/schema.sql` completo
   - Verifica que se crearon las tablas: `invoices`, `expenses`, `profiles`
   - Verifica que existe la función: `create_or_update_profile`

   📖 **Guía detallada**: Ver [docs/CONFIGURAR_SUPABASE.md](../docs/CONFIGURAR_SUPABASE.md)

5. **Ejecutar en desarrollo**

   ```bash
   pnpm dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

### Scripts Disponibles

```bash
pnpm dev      # Servidor de desarrollo
pnpm build    # Build de producción
pnpm start    # Servidor de producción
pnpm lint     # Ejecutar linter
```

---

## 🎮 Uso

### 1. Configuración Inicial

Antes de cargar facturas, configura tu perfil de cliente:

1. Navega a **Configuración** (`/settings`)
2. Ingresa tu nombre y RFC
3. Configura las opciones de validación
4. Guarda los cambios

### 2. Cargar Facturas de Ingreso

1. Ve a **Ingresos** (`/upload`)
2. Arrastra o selecciona archivos XML de facturas
3. El sistema procesará y validará automáticamente:
   - Verificación de RFC
   - Identificación de tipo (PUE/PPD/Complemento)
   - Matching de complementos con facturas PPD

### 3. Registrar Gastos

**Opción A: Cargar XML de compras**

1. Ve a **Gastos** (`/expenses`)
2. Sube archivos XML de facturas de compra
3. El sistema validará el RFC del receptor

**Opción B: Registro manual**

1. En la misma página, completa el formulario manual
2. Ingresa fecha, monto total y concepto
3. Guarda el gasto

### 4. Ver Dashboard y Reportes

1. Navega a **Dashboard** (`/dashboard`)
2. Selecciona mes y año para filtrar
3. Revisa las métricas financieras
4. Explora las tablas de facturas y gastos
5. Exporta el reporte a PDF si lo necesitas

### 5. Autenticación

1. **Registro de Usuario**
   - Ve a **Inicio** (`/`)
   - Haz clic en "Registrarse"
   - Completa el formulario con tus datos
   - Confirma tu email (si está habilitado en Supabase)
   - Tu perfil se creará automáticamente

2. **Inicio de Sesión**
   - Ve a **Inicio** (`/`)
   - Ingresa tu email y contraseña
   - Accede a todas las funcionalidades

### 6. Exportar/Importar Datos

- **Exportar**: Navegación → "Exportar Datos" (descarga JSON) - *Próximamente*
- **Importar**: Navegación → "Importar Datos" (carga JSON) - *Próximamente*

> **Nota**: Los datos se sincronizan automáticamente con Supabase. No necesitas exportar/importar manualmente.

---

## 📁 Estructura del Proyecto

```
finance-reports/
├── app/                      # Next.js App Router
│   ├── components/           # Componentes globales
│   │   ├── navigation.tsx
│   │   ├── profile-guard.tsx
│   │   └── data-export-actions.tsx
│   ├── dashboard/            # Dashboard principal
│   │   ├── components/
│   │   │   ├── dashboard-view.tsx
│   │   │   ├── metrics-cards.tsx
│   │   │   ├── pending-invoices-table.tsx
│   │   │   └── all-invoices-table.tsx
│   │   └── page.tsx
│   ├── upload/               # Carga de facturas de ingreso
│   │   ├── components/
│   │   └── page.tsx
│   ├── expenses/              # Gestión de gastos
│   │   ├── components/
│   │   └── page.tsx
│   ├── settings/              # Configuración de perfil
│   │   └── page.tsx
│   └── layout.tsx
│
├── lib/
│   ├── types/                 # Tipos TypeScript centralizados
│   │   ├── cfdi.types.ts
│   │   ├── expense.types.ts
│   │   ├── profile.types.ts
│   │   ├── report.types.ts
│   │   └── index.ts
│   ├── xml-parser/            # Parser CFDI
│   │   └── cfdi-parser.ts
│   ├── pdf-generator/         # Generación de PDFs
│   │   └── pdf-generator.ts
│   ├── utils/                 # Utilidades
│   │   ├── report-calculator.ts
│   │   ├── invoice-validator.ts
│   │   ├── expense-validator.ts
│   │   ├── rfc-validator.ts
│   │   └── data-export.ts
│   ├── supabase/              # Integración con Supabase
│   │   ├── client.ts          # Cliente del navegador
│   │   ├── server.ts          # Cliente del servidor
│   │   ├── auth-context.tsx   # Contexto de autenticación
│   │   ├── profiles.ts        # Gestión de perfiles
│   │   ├── invoices.ts        # Gestión de facturas
│   │   └── expenses.ts        # Gestión de gastos
│   └── hooks/                 # Custom hooks
│       └── use-profile-guard.ts
├── supabase/                  # Scripts SQL de Supabase
│   ├── schema.sql             # Esquema completo de BD
│   ├── fix-foreign-keys.sql   # Corrección de foreign keys
│   └── fix-profiles-constraint.sql
│
├── store/                     # Stores Zustand
│   ├── invoice-store.ts       # Facturas de ingreso
│   ├── expense-store.ts       # Gastos/compras
│   ├── profile-store.ts       # Perfil de cliente
│   └── index.ts
│
└── package.json
```

---

## 🔧 Características Técnicas

### Tipos de Factura Soportados

- **PUE** (Pago en una sola exhibición)

  - Factura pagada completamente al momento de emisión
  - Se cuenta como "pagado" inmediatamente

- **PPD** (Pago en Parcialidades o Diferidos)

  - Factura con pagos parciales o diferidos
  - Requiere complementos de pago para registrar pagos
  - Se muestra en "Pendiente por Pagar" hasta estar completamente pagada

- **COMPLEMENTO_PAGO**
  - Registra un pago realizado
  - Se vincula automáticamente con facturas PPD relacionadas
  - Extrae datos de `ImpPagado`, `BaseDR`, `ImporteDR`

### Validaciones Implementadas

- ✅ Verificación de RFC del emisor (facturas de ingreso)
- ✅ Verificación de RFC del receptor (facturas de compra)
- ✅ Matching de complementos de pago con facturas PPD
- ✅ Validación de formato XML CFDI 4.0
- ✅ Prevención de duplicados por UUID

### Base de Datos y Persistencia

- **Supabase PostgreSQL**: Base de datos principal en la nube
  - Tabla `profiles`: Perfiles de usuario
  - Tabla `invoices`: Facturas de ingreso
  - Tabla `expenses`: Gastos y compras
  - Row Level Security (RLS): Cada usuario solo ve sus datos
  - Función RPC: `create_or_update_profile` para gestión de perfiles

- **Autenticación Supabase**:
  - Registro e inicio de sesión
  - Gestión de sesiones
  - Confirmación de email (opcional)
  - Recuperación de contraseña

- **Sincronización Automática**:
  - Los datos se guardan automáticamente en Supabase
  - Sincronización en tiempo real
  - Acceso desde múltiples dispositivos

---

## 🎨 Diseño y Branding

La aplicación utiliza un diseño corporativo y sofisticado:

- **Paleta de colores**: Negro, blanco y azul cobalto (#0047AB)
- **Tipografía**: Geist (optimizada por Next.js)
- **Componentes**: Shadcn/ui para consistencia
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **Accesibilidad**: Componentes accesibles por defecto
- **PWA**: Progressive Web App instalable
- **Branding**: Desarrollado por **TresA Design**

---

## 📝 Notas de Desarrollo

### Principios de Código

- **Tipado Robusto**: Sin `any`, tipos explícitos en todo el código
- **Código Simple**: Evitar sobre-ingeniería, mantener legibilidad
- **Arquitectura Modular**: Componentes organizados por ruta
- **Tipos Centralizados**: Todas las interfaces en `/lib/types/`
- **Package Manager**: Exclusivamente `pnpm`

### Convenciones

- Componentes en carpetas `components/` dentro de cada ruta
- Tipos e interfaces exportados desde `/lib/types/index.ts`
- Stores de Zustand en `/store/`
- Utilidades reutilizables en `/lib/utils/`

---

## 🚧 Estado del Proyecto

**Versión**: 0.1.0  
**Desarrollado por**: [TresA Design](https://tresadesign.com)

### ✅ Implementado

- [x] Parser CFDI 4.0
- [x] Identificación de tipos de factura
- [x] Gestión de ingresos (facturas)
- [x] Gestión de gastos (XML + manual)
- [x] Dashboard con métricas
- [x] Generación de reportes PDF
- [x] Validación de RFC (bloquea carga si no coincide)
- [x] Matching de complementos de pago
- [x] **Autenticación de usuarios (Supabase Auth)**
- [x] **Sincronización en la nube (Supabase)**
- [x] **Base de datos PostgreSQL con RLS**
- [x] Perfil de cliente
- [x] Búsqueda y filtros avanzados
- [x] Paginación de resultados
- [x] Ordenamiento por columnas
- [x] PWA (Progressive Web App)
- [x] Branding corporativo TresA Design

### 🔮 Futuras Mejoras

- [ ] Exportación/Importación de datos (JSON)
- [ ] Múltiples perfiles de cliente por usuario
- [ ] Análisis y gráficas avanzadas
- [ ] Notificaciones de pagos pendientes
- [ ] Integración con APIs fiscales
- [ ] Almacenamiento de archivos XML en Supabase Storage
- [ ] Reportes programados por email

---

## 🔧 Configuración de Supabase

### Requisitos

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Obtén tu `URL` y `anon key`

2. **Ejecutar esquema SQL**
   - Abre el SQL Editor en Supabase
   - Ejecuta el archivo `supabase/schema.sql`
   - Verifica que se crearon las tablas y funciones

3. **Configurar variables de entorno**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
   ```

📖 **Guía completa**: Ver [docs/CONFIGURAR_SUPABASE.md](../docs/CONFIGURAR_SUPABASE.md)

### Estructura de Base de Datos

- **`profiles`**: Perfiles de usuario (RFC, nombre, validaciones)
- **`invoices`**: Facturas de ingreso (CFDI)
- **`expenses`**: Gastos y compras (XML y manuales)
- **RLS Policies**: Cada usuario solo accede a sus propios datos
- **Función RPC**: `create_or_update_profile` para gestión de perfiles

---

## 📄 Licencia

Este proyecto es propiedad de **TresA Design**. Todos los derechos reservados.

---

## 👥 Soporte

Para soporte técnico o consultas sobre el producto, contacta a **TresA Design**.

---

**Desarrollado con ❤️ por [TresA Design](https://tresadesign.com)**  
**Tecnologías**: Next.js 16, TypeScript, React 19, Supabase, Tailwind CSS 4
