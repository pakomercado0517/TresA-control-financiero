# 💰 Control de Ingresos y Gastos

> Sistema de gestión financiera para el control de facturas CFDI (México) con generación de reportes en PDF

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-FF6B6B?style=flat-square)](https://zustand-demo.pmnd.rs/)

---

## 📋 Descripción

Aplicación web MVP diseñada para el control y gestión de facturas CFDI (Comprobante Fiscal Digital por Internet) en México. El sistema permite procesar facturas XML, identificar automáticamente su tipo (PUE, PPD o Complemento de Pago), gestionar ingresos y gastos, y generar reportes financieros profesionales en formato PDF.

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
  - Verificación de coincidencia de RFC en facturas
  - Matching de complementos de pago con facturas PPD
  - Perfil de cliente configurable

- **💾 Persistencia Local**
  - Almacenamiento en IndexedDB
  - Exportación/Importación de datos (JSON)
  - Sin dependencia de backend

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
- **Persistencia**: [idb-keyval](https://github.com/jakearchibald/idb-keyval) (IndexedDB)
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

3. **Ejecutar en desarrollo**

   ```bash
   pnpm dev
   ```

4. **Abrir en el navegador**
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

### 5. Exportar/Importar Datos

- **Exportar**: Navegación → "Exportar Datos" (descarga JSON)
- **Importar**: Navegación → "Importar Datos" (carga JSON)

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
│   │   └── data-export.ts
│   ├── storage/               # Persistencia
│   │   └── idb-storage.ts
│   └── hooks/                 # Custom hooks
│       └── use-profile-guard.ts
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

### Persistencia

- **IndexedDB**: Almacenamiento local del navegador
- **Exportación JSON**: Backup completo de datos
- **Importación JSON**: Restauración de datos

---

## 🎨 Diseño

La aplicación utiliza un diseño moderno, minimalista y semi-elegante:

- **Paleta de colores**: Neutral con acentos sutiles
- **Tipografía**: Geist (optimizada por Next.js)
- **Componentes**: Shadcn/ui para consistencia
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **Accesibilidad**: Componentes accesibles por defecto

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

**Versión**: MVP (0.1.0)

### ✅ Implementado

- [x] Parser CFDI 4.0
- [x] Identificación de tipos de factura
- [x] Gestión de ingresos (facturas)
- [x] Gestión de gastos (XML + manual)
- [x] Dashboard con métricas
- [x] Generación de reportes PDF
- [x] Validación de RFC
- [x] Matching de complementos de pago
- [x] Persistencia en IndexedDB
- [x] Exportación/Importación de datos
- [x] Perfil de cliente

### 🔮 Futuras Mejoras

- [ ] Autenticación de usuarios
- [ ] Sincronización en la nube
- [ ] Múltiples perfiles de cliente
- [ ] Análisis y gráficas avanzadas
- [ ] Notificaciones de pagos pendientes
- [ ] Integración con APIs fiscales

---

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

## 👥 Contribución

Este es un proyecto MVP en desarrollo activo. Para contribuciones, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ usando Next.js y TypeScript**
