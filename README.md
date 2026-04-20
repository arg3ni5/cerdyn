
# Sistema control de gastos con REACT - cerdyn v.1.0

Cerdyn es un sistema para controlar los gastos personales de forma fácil y rápida.

## 🚀 Características

- 💰 Control de gastos e ingresos personales
- 💸 Transferencias entre cuentas propias (sin afectar totales de ingresos/gastos)
- 📊 Visualización de datos con gráficos
- 🏦 Gestión de múltiples cuentas
- 🏷️ Categorización de movimientos
- 📈 Informes y reportes detallados
- 🔐 Autenticación segura con Google OAuth
- 🌓 Modo claro/oscuro
- 💱 Soporte multi-moneda

## Authors

- [@ing-franklin-bustamante-CODIGO369](https://www.youtube.com/@Codigo369)


## Demo

https://cerdyn.com/


## Stack de tecnologias utilizadas

**Frontend:** React.js, Zustand, Styled Components, TanStack Query

**Backend:** PostgreSQL, Supabase

**Validación:** Zod

**Seguridad:** Encrypted LocalStorage, Session Management


## 🔧 Configuración del proyecto

### Requisitos previos

- Node.js 16 o superior
- npm o yarn
- Cuenta de Supabase

### Instalación

1. Clona el repositorio
```bash
git clone https://github.com/arg3ni5/arg3ni5-cgastos.git
cd arg3ni5-cgastos
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno

Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Edita el archivo `.env` y configura las siguientes variables:

```env
# Supabase Configuration
# Obtén estos valores de tu proyecto Supabase: https://app.supabase.com/project/_/settings/api
VITE_APP_SUPABASE_URL=tu_supabase_project_url_aqui
VITE_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui

# Application Environment
# Opciones: development, production, test
VITE_APP_ENV=development

# Session Configuration (opcional)
# Timeout de sesión en milisegundos (por defecto: 24 horas)
VITE_SESSION_TIMEOUT=86400000
```

### Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Configura la autenticación de Google OAuth en la sección de Authentication
3. Ejecuta las migraciones de base de datos ubicadas en `database/migrations/`
4. Copia la URL del proyecto y la clave anónima a tu archivo `.env`

### Migraciones de base de datos

Las migraciones están en el directorio `database/migrations/` y deben ejecutarse en orden en el SQL editor de Supabase:

| Archivo | Descripción |
|---------|-------------|
| `001_add_transferencias.sql` | Agrega soporte para transferencias entre cuentas (tipo `t`) |

### Variables de Entorno Requeridas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_APP_SUPABASE_URL` | URL de tu proyecto Supabase | Sí |
| `VITE_APP_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `VITE_APP_ENV` | Entorno de la aplicación (development/production/test) | No |
| `VITE_SESSION_TIMEOUT` | Timeout de sesión en milisegundos | No |

### Iniciar proyecto

Para inicializar en modo desarrollo:

```bash
npm run dev
```

Para construir para producción:

```bash
npm run build
```

Para previsualizar la build de producción:

```bash
npm run preview
```

## 🔒 Seguridad

Este proyecto implementa múltiples capas de seguridad:

- **Validación de datos**: Todas las entradas se validan con Zod
- **Cifrado de LocalStorage**: Datos sensibles se almacenan cifrados
- **Expiración de sesión**: Las sesiones expiran automáticamente
- **Logging centralizado**: Todos los errores se registran para debugging
- **Error Boundaries**: Captura errores de React para evitar crashes
- **Typed Environment Variables**: Variables de entorno tipadas y validadas

## 💸 Transferencias entre cuentas

Cerdyn soporta el tipo de movimiento **`t` (transferencia)**, que permite mover fondos entre cuentas propias sin afectar los totales de ingresos ni gastos.

### Cómo funciona

- Al registrar un movimiento de tipo **Transferencia**, se seleccionan:
  - **Cuenta origen**: de donde sale el dinero
  - **Cuenta destino**: donde entra el dinero
- El monto **se resta** del saldo de la cuenta origen
- El monto **se suma** al saldo de la cuenta destino
- Las transferencias **no aparecen** en los reportes de ingresos/gastos

### Ejemplo

Transferir $5,000 de tu cuenta bancaria a tu cartera:
```
Tipo: Transferencia 💸
Monto: $5,000
Cuenta origen: Banco
Cuenta destino: Cartera
```

Resultado:
- Banco: -$5,000
- Cartera: +$5,000
- Ingresos totales: sin cambio
- Gastos totales: sin cambio

### Cambios requeridos en la base de datos

Para habilitar transferencias, ejecuta la migración `database/migrations/001_add_transferencias.sql` en tu proyecto Supabase. Esta migración:
1. Agrega las columnas `idcuenta_origen` e `idcuenta_destino` a la tabla `movimientos`
2. Actualiza el trigger que asigna el usuario para soportar transferencias
3. Actualiza las funciones de cálculo de saldo para incluir transferencias
4. Actualiza la función RPC `mmovimientosmesanio` para retornar transferencias

## 🧪 Testing

La infraestructura de testing está configurada. Para ejecutar tests:

```bash
npm test
```

**Nota**: Actualmente se requiere instalar vitest y @testing-library/react para ejecutar tests.

## 📥 Importar movimientos desde Excel (XLSX)

Se agregó la ruta **`/movimientos/importar`** para importar movimientos en 3 pasos:

1. **Subir archivo** y descargar plantilla oficial.
2. **Previsualizar + validar** filas detectadas.
3. **Resolver errores + importar** en lotes.

### Plantilla oficial

- Hoja `Movimientos` con columnas:
  - `fecha` (YYYY-MM-DD)
  - `descripcion`
  - `tipo` (`ingreso` o `gasto`)
  - `valor` (> 0)
  - `idcategoria` (obligatorio)
  - `idcuenta` (opcional)
- Hoja `Categorias` (referencia):
  - `tipo`
  - `idcategoria`
  - `descripcion`

### Reglas clave

- **No se admiten transferencias** en este flujo de importación.
- La categoría debe existir para el usuario actual y coincidir con el tipo de movimiento.
- Si hay categorías inválidas/faltantes, se pueden corregir por grupos con “Aplicar a todas”.

## 📝 Scripts disponibles

```json
{
  "dev": "Inicia el servidor de desarrollo",
  "build": "Construye para producción",
  "preview": "Previsualiza la build de producción",
  "lint": "Ejecuta el linter",
  "lint:fix": "Ejecuta el linter y corrige errores automáticamente",
  "test": "Ejecuta los tests",
  "test:ui": "Ejecuta los tests con interfaz visual",
  "test:coverage": "Ejecuta los tests con reporte de cobertura"
}
```

## Pantallazos
![Screenshot1](https://i.ibb.co/F3VVTv0/HGERTHDDFGG.png)

![Screenshot2](https://i.ibb.co/cDjwFzH/screencapture-127-0-0-1-5173-movimientos-2023-09-22-00-38-32.png)

![Screenshot3](https://i.ibb.co/tCqq9Kw/32shots-so.png)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Adquiere el curso

Puedes adquirir el curso en:

[codigo369.com](https://codigo369.com/)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia correspondiente.

## 📞 Soporte

Para soporte, visita [codigo369.com](https://codigo369.com/) o contacta al autor.
