# Integración con Supabase

Supabase actúa como el Backend-as-a-Service (BaaS) proporcionando base de datos y autenticación.

## 🔑 Autenticación
- **Método**: Google OAuth.
- **Flujo**: El usuario se autentica $\rightarrow$ `AuthCallback.tsx` procesa el token $\rightarrow$ `AuthStore` guarda la sesión.

## 🛠️ Capa de Datos (CRUD)
La lógica de acceso a datos no está dispersa en los componentes, sino centralizada en `src/supabase/`:
- `supabase.config.tsx`: Configuración del cliente.
- `crudMovimientos.tsx`, `crudCuentas.tsx`, etc.: Funciones asíncronas para leer, crear, actualizar y borrar registros.

## 🛡️ Seguridad
- **Zod**: Se utilizan esquemas en `src/schemas/` para validar que los datos enviados a Supabase sean correctos.
- **RLS (Row Level Security)**: Se asume que las tablas en PostgreSQL tienen políticas de seguridad para que los usuarios solo accedan a sus propios datos.
