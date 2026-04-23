# Distribución de Carpetas del Proyecto

## Estructura Raíz

```
g:\Developer\arg3ni5-cgastos\
├── src/                          # Código fuente principal
├── docs/                         # Documentación
├── supabase/                     # Configuración de Supabase
├── obsidian/                     # Esta documentación
├── package.json                  # Dependencias y scripts
├── vite.config.ts               # Configuración de Vite
├── tsconfig.json                # Configuración de TypeScript
├── vitest.config.ts             # Configuración de tests
├── eslint.config.js             # Configuración de linting
└── CLAUDE.md                     # Instrucciones para Claude Code
```

---

## Directorio `src/` - Código Fuente

### Estructura General

```
src/
├── components/              # [[Componentes|Componentes React]]
├── pages/                   # [[Páginas y Rutas|Páginas]]
├── store/                   # [[Stores Zustand|Stores Zustand]]
├── hooks/                   # [[Hooks y Context|Hooks personalizados]]
├── context/                 # [[Hooks y Context|React Context]]
├── supabase/                # [[Supabase y CRUD|CRUD y client config]]
├── schemas/                 # [[Validación y Schemas|Zod schemas]]
├── types/                   # Tipos TypeScript
├── utils/                   # Funciones utilitarias
├── styles/                  # Estilos globales y temas
├── config/                  # Configuración general
├── test/                    # Tests y mocks
├── App.tsx                  # Componente raíz
├── main.tsx                 # Entry point
└── index.ts                 # Barrel exports
```

---

## 📦 `src/components/` - Sistema de Atomic Design

Organizado por niveles de complejidad (Atomic Design Pattern):

### Átomos (`atomos/`)
Componentes más simples y reutilizables. Sin lógica de negocio.

```
atomos/
├── BtnCerrar.tsx           # Botón para cerrar
├── Colorcontent.tsx        # Componente de color
├── ContentHeader.tsx       # Header genérico
├── ContentFiltros.tsx      # Contenedor de filtros
├── Icono.tsx              # Ícono reutilizable
└── InputTextNumber.tsx     # Input de texto/número
```

**Uso**: Elementos UI básicos, sin estado complejo

---

### Moléculas (`moleculas/`)
Combina átomos en grupos simples y autónomos.

```
moleculas/
├── BtnCircular.tsx         # Botón circular
├── BtnForm.tsx            # Botón para formularios
├── BtnIcono.tsx           # Botón con ícono
├── Btndesplegable.tsx      # Botón desplegable
├── InputBuscadorLista.tsx  # Input con búsqueda
├── ItemsDesplegable.tsx    # Items de menú
├── ListaMenuDesplegable.tsx # Menú desplegable
├── Lottieanimacion.tsx     # Animación Lottie
├── Spinner.tsx            # Spinner de carga
├── SpinnerLoader.tsx      # Loader page completa
├── Carousel.tsx           # Carrusel de items
├── ListaGenerica.tsx      # Lista genérica reutilizable
└── fondosAnimados/
    └── Fondo1.tsx         # Fondos animados
```

**Uso**: Combinaciones simples de átomos con pequeña lógica

---

### Organismos (`organismos/`)
Componentes complejos que combinan moléculas y átomos. Contienen lógica de negocio.

```
organismos/
├── Header.tsx             # Header principal
├── Menuambur.tsx          # Menú hamburguesa
├── Sidebar.tsx            # Barra lateral
├── Selector.tsx           # Selector de items
├── DataUser.tsx           # Datos del usuario
├── CardTotales.tsx        # Tarjeta de totales
├── CardEliminarData.tsx   # Modal de eliminar
├── Tabs.tsx              # Sistema de tabs
├── CalendarioLineal.tsx   # Calendario
├── ListaPaises.tsx        # Lista de países
│
├── formularios/           # Formularios complejos
│   ├── RegistrarCategorias.tsx
│   ├── RegistrarCuentas.tsx
│   ├── RegistrarMovimientos.tsx
│   ├── InputText.tsx
│   └── InputNumber.tsx
│
├── tablas/                # Tablas y componentes de dato
│   ├── TablaMovimientos.tsx
│   ├── TablaCategorias.tsx
│   ├── Paginacion.tsx
│   ├── AccionesTabla.tsx
│   └── ContentAccionesTabla.tsx
│
└── graficas/              # Gráficos y visualizaciones
    ├── Barras.tsx        # Gráfico de barras
    ├── Dona.tsx          # Gráfico de dona
    └── Lineal.tsx        # Gráfico lineal
```

**Uso**: Lógica compleja, formularios, datos, gráficos

---

### Templates (`templates/`)
Layouts o plantillas de página. Combinan organismos en un patrón de página completa.

```
templates/
├── PlantillaBase.tsx          # Template base
├── HomeTemplate.tsx           # Template para Home
├── LoginTemplate.tsx          # Template para Login
├── DashboardTemplate.tsx      # Template para Dashboard
├── CuentasTemplate.tsx        # Template para Cuentas
├── CategoriasTemplate.tsx     # Template para Categorías
├── MovimientosTemplate.tsx    # Template para Movimientos
├── InformesTemplate.tsx       # Template para Informes
├── ConexionesTemplate.tsx     # Template para Conexiones
├── VincularTemplate.tsx       # Template para Vincular
├── ConfiguracionTemplate.tsx  # Template para Configuración
└── MovimientosCuentaModal.tsx # Modal de movimientos por cuenta
```

**Uso**: Layouts de página, estructura general de vistas

---

## 📄 `src/pages/` - Páginas de la Aplicación

Cada archivo corresponde a una ruta. Son wrapper delgados alrededor de templates.

```
pages/
├── Login.tsx              # Página de login (/login)
├── Home.tsx              # Página de inicio (/)
├── Dashboard.tsx         # Dashboard (/dashboard)
├── Cuentas.tsx           # Gestión de cuentas (/cuentas)
├── Movimientos.tsx       # Movimientos y transacciones (/movimientos)
├── Categorias.tsx        # Gestión de categorías (/categorias)
├── Informes.tsx          # Reportes y análisis (/informes)
├── Conexiones.tsx        # Integraciones externas (/conexiones)
├── Vincular.tsx          # Vincular cuentas (/vincular)
├── Configuracion.tsx     # Configuración (/configurar)
└── AuthCallback.tsx      # Callback de OAuth (/auth/callback)
```

Ver: [[Páginas y Rutas]]

---

## 🏪 `src/store/` - State Management con Zustand

Cada archivo es un store independiente para un dominio de datos.

```
store/
├── AuthStore.tsx         # Auth con Google (signIn, signOut)
├── UsuariosStore.tsx     # Datos del usuario actual
├── CuentasStore.tsx      # Gestión de cuentas bancarias
├── CategoriasStore.tsx   # Gestión de categorías
├── MovimientosStore.tsx  # Movimientos y transacciones
├── OperacionesStore.tsx  # Operaciones y cálculos
└── ConexionesStore.tsx   # Integraciones externas
```

Ver: [[Stores Zustand]]

---

## 🪝 `src/hooks/` - Hooks y Context

```
hooks/
└── ProtectedRoute.tsx     # Hook para proteger rutas
```

---

## 📍 `src/context/` - React Context

```
context/
├── AuthContent.tsx        # Auth context provider y hook useUserAuth
└── LoadingContext.tsx     # Loading state global
```

Ver: [[Hooks y Context]]

---

## 🗄️ `src/supabase/` - Backend Integration

Archivo de configuración + operaciones CRUD para cada entidad.

```
supabase/
├── supabase.config.tsx    # Cliente Supabase configurado
├── authHelpers.ts         # Helpers de autenticación
├── crudUsuarios.tsx       # CRUD de usuarios
├── crudCuentas.tsx        # CRUD de cuentas
├── crudCategorias.tsx     # CRUD de categorías
├── crudMovimientos.tsx    # CRUD de movimientos
├── crudConexiones.tsx     # CRUD de conexiones
└── crudMovimientosRecurrentes.tsx # CRUD de movimientos recurrentes
```

Ver: [[Supabase y CRUD]]

---

## ✅ `src/schemas/` - Validación Zod

Esquemas para validar datos antes de enviar a la BD o procesar.

```
schemas/
├── usuario.schema.ts
├── cuenta.schema.ts
├── categoria.schema.ts
├── movimiento.schema.ts
├── conexion.schema.ts
└── recurrencia.schema.ts
```

Ver: [[Validación y Schemas]]

---

## 📝 `src/types/` - Type Definitions

```
types/
├── types.ts              # Tipos personalizados principales
├── supabase.ts           # Tipos generados de Supabase (auto-gen)
└── vite-env.d.ts         # Tipos de Vite
```

---

## 🎨 `src/styles/` - Estilos Globales

```
styles/
├── GlobalStyles.ts       # Estilos globales
├── themes.ts            # Definición de temas (claro/oscuro)
├── variables.ts         # Variables de estilos
└── breakpoints.ts       # Media queries responsive
```

Ver: [[Estilos y Temas]]

---

## 🔧 `src/utils/` - Funciones Utilitarias

```
utils/
├── Conversiones.tsx      # Conversiones de datos
├── dataEstatica.tsx      # Datos estáticos/constantes
├── encryption.ts         # Encriptación LocalStorage
├── logger.ts            # Sistema de logging
├── messages.ts          # Mensajes de SweetAlert
├── recurrencia.ts       # Lógica de recurrencia
├── sweetAlertUtils.ts   # Helpers de alertas
└── Conversiones.tsx     # Helpers de conversión
```

---

## ⚙️ `src/config/` - Configuración

```
config/
├── env.ts               # Variables de entorno
└── queryClient.ts       # Configuración de React Query
```

---

## 🧪 `src/test/` - Tests y Mocks

```
test/
├── setup.ts             # Configuración de tests
├── mocks/
│   ├── stores.mock.ts   # Mocks de Zustand stores
│   └── supabase.mock.ts # Mocks de Supabase
└── recurrencia.test.ts  # Tests de recurrencia
```

---

## Relaciones de Notas

- [[Componentes]] - para entender la organización de componentes
- [[Páginas y Rutas]] - mapeo de rutas a páginas
- [[Stores Zustand]] - dónde vive el estado
- [[Supabase y CRUD]] - dónde viven las operaciones al servidor
- [[Hooks y Context]] - para hooks y contextos
