# Zustand Store

Detalle de los almacenes de estado global utilizados en la aplicación.

## 📁 Stores Disponibles
- **AuthStore**: Maneja la sesión del usuario, tokens y datos del perfil.
- **UsuariosStore**: Información extendida del usuario.
- **CuentaStore**: Lista de cuentas, saldos y preferencias de moneda.
- **CategoriasStore**: Gestión de categorías y sus iconos/colores.
- **MovimientosStore**: Historial de transacciones y filtros.
- **OperacionesStore**: Estado temporal para la creación de nuevos movimientos.
- **ConexionesStore**: Gestión de vinculaciones externas.

## ⚙️ Patrón de Uso
Los stores definen tanto el **estado** como las **acciones** para modificar dicho estado, evitando que la lógica de actualización esté dispersa en los componentes.
