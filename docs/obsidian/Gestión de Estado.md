# Gestión de Estado

Cerdyn utiliza un enfoque híbrido para manejar la información, optimizando entre la persistencia del servidor y la reactividad del cliente.

## 📦 Zustand Store
Se utiliza para el estado global que debe persistir durante la sesión del usuario. Los stores principales son:
- `AuthStore`: Gestión de la sesión y usuario actual.
- `CuentaStore`: Estado de las cuentas bancarias/billeteras.
- `MovimientosStore`: Gestión de transacciones.
- `CategoriasStore`: Organización de categorías de gastos/ingresos.

## ⚡ TanStack Query
Se encarga de la sincronización con el servidor (Supabase), manejando:
- Caching de datos.
- Estados de carga (`isLoading`).
- Refresco automático de datos tras mutaciones.

## 🔄 Flujo de Actualización
1. El usuario realiza una acción en la UI.
2. Se dispara una mutación en Supabase.
3. TanStack Query invalida la cache.
4. El [[Zustand Store]] se actualiza si es necesario reflejar el cambio globalmente.
