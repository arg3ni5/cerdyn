# Flujo de Autenticación

Cómo funciona el login, el manejo de sesiones y la autenticación en la aplicación.

Ver: [[Hooks y Context#🔐 Flujo de Autenticación]]

---

## 🔐 Resumen General

La app usa **Google OAuth** a través de Supabase para autenticar usuarios.

```
Usuario abre app
       ↓
¿Hay sesión activa?
       ├─ NO → Redirigir a /login
       └─ SÍ → Continuar a dashboard
```

---

## 📋 Componentes Involucrados

| Componente | Archivo | Propósito |
|-----------|---------|----------|
| **AuthStore** | `src/store/AuthStore.tsx` | SignIn/Signout con Supabase |
| **AuthContext** | `src/context/AuthContent.tsx` | Proveedor y hook useUserAuth |
| **ProtectedRoute** | `src/hooks/ProtectedRoute.tsx` | Proteger rutas autenticadas |
| **App** | `src/App.tsx` | Orquesta auth con React Query |
| **Login** | `src/pages/Login.tsx` | Página de login UI |

---

## 🔄 Paso a Paso: El Flujo Completo

### Paso 1: Usuario Abre la App

```typescript
// src/main.tsx
// App se renderiza
function App() {
  const { user } = useUserAuth();

  // Supabase escucha cambios de auth
  // Retorna undefined si no hay sesión
}
```

---

### Paso 2: AuthContextProvider Escucha Sesión

**Archivo**: `src/context/AuthContent.tsx`

```typescript
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // CLAVE: Escuchar cambios de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Sesión NULL = ningún usuario logueado
        if (session == null) {
          setUser(null);
          navigate("/login");
          return;
        }

        // Sesión EXISTE = usuario autenticado
        const metadata = session.user.user_metadata;

        const user = {
          name: metadata.name,
          idauth_supabase: session.user.id,
          picture: metadata.picture
        };

        setUser(user);

        // Insertar/actualizar usuario en tabla 'usuarios'
        await insertarUsuarios(user, session.user.id);

        // Si estaba en /login, redirigir a /
        if (pathname === "/login") {
          navigate("/");
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);
};
```

---

### Paso 3: Usuario Hace Click en "Login con Google"

**Archivo**: `src/pages/Login.tsx`

```typescript
export const Login = () => {
  const { signInWithGoogle } = useAuthStore();

  const handleLoginGoogle = async () => {
    const userData = await signInWithGoogle();

    if (userData) {
      // userData.url es el enlace a Google OAuth
      // Supabase lo maneja automáticamente
      // Redirigirá de vuelta después que usuario autoriza
    }
  };

  return (
    <LoginTemplate>
      <button onClick={handleLoginGoogle}>
        Continuar con Google
      </button>
    </LoginTemplate>
  );
};
```

---

### Paso 4: AuthStore Inicia OAuth

**Archivo**: `src/store/AuthStore.tsx`

```typescript
export const useAuthStore = create<AuthStore>((set) => ({
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      // Supabase retorna URL de Google o maneja redirección
      if (error) throw error;

      set({ isAuth: true });

      // userData contiene info del provider y URL
      return {
        provider: data.provider,
        url: data.url || ''
      };
    } catch (error) {
      set({ isAuth: false });
      showErrorMessage('Error en autenticación');
      return undefined;
    }
  }
}));
```

---

### Paso 5: Google OAuth Flow

```
┌──────────────────────────────────────────────────────┐
│  1. Supabase redirige a Google                       │
│     https://accounts.google.com/o/oauth2/auth?...    │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│  2. Usuario ve pantalla de permisos de Google        │
│     "Control-Gastos quiere acceder a tu cuenta"      │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│  3. Usuario hace click "Aceptar" o "Denegar"         │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│  4. Google redirige a Supabase con código OAuth      │
│     https://app.com/auth/callback?code=...           │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│  5. Supabase intercambia código por tokens           │
│     - Access Token (sesión del usuario)              │
│     - Refresh Token (renovar sesión)                 │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│  6. Supabase guarda tokens en LocalStorage           │
│     (o SessionStorage)                               │
└──────────────────────────────────────────────────────┘
```

---

### Paso 6: Supabase Detecta Cambio

Una vez que Supabase intercambia el token, el `onAuthStateChange` en **AuthContextProvider** se dispara:

```typescript
// onAuthStateChange se ejecuta con:
// _event = 'SIGNED_IN'
// session = { user: { id, user_metadata }, ...}

// Ejecuta:
setUser(user);  // Actualiza contexto
insertarUsuarios(user, session.user.id);  // Guarda en BD
navigate('/');  // Redirige a home
```

---

### Paso 7: App Carga Datos del Usuario

**Archivo**: `src/App.tsx`

```typescript
function App() {
  const { setUsuario, ObtenerUsuarioActual } = useUsuariosStore();

  // IMPORTANTE: Con React Query
  const { data: usuario, isLoading } = useQuery({
    queryKey: ["usuarioActual"],
    queryFn: ObtenerUsuarioActual,
    enabled: pathname !== "/login",  // No ejecutar en /login
    staleTime: 5 * 60 * 1000,        // Cache 5 min
  });

  useEffect(() => {
    if (usuario) {
      setUsuario(usuario);  // Guardar en UsuariosStore
    }
  }, [usuario]);

  // Mostrar loader mientras carga
  if (pathname !== "/login" && isLoading) {
    return <SpinnerLoader />;
  }

  // Renderizar app con tema del usuario
  const themeName = usuario?.tema === "0" ? "light" : "dark";

  return (
    <ThemeProvider theme={themeName === "light" ? Light : Dark}>
      <AuthContextProvider>
        {/* Rutas protegidas aquí */}
        <MyRoutes isLoading={isLoading} />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
```

---

### Paso 8: Rutas Protegidas

**Archivo**: `src/routers/routes.tsx`

```typescript
export const MyRoutes = ({ isLoading }: ProtectedRouteProps) => {
  const { user } = useUserAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* RUTAS PROTEGIDAS */}
      <Route element={<ProtectedRoute
        user={user}
        redirectTo="/"
        isLoading={isLoading}
      />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cuentas" element={<Cuentas />} />
        {/* ... más rutas */}
      </Route>
    </Routes>
  );
};
```

**ProtectedRoute** verifica:
- ¿Usuario existe? → Si: renderiza ruta
- ¿Usuario NULL? → No: redirige a /login

---

## 🔄 Caso: Cerrar Sesión (Logout)

```
Usuario click "Cerrar Sesión"
       ↓
AuthStore.signout()
       ↓
supabase.auth.signOut()
       ↓
Supabase elimina tokens de cliente
       ↓
BD escucha onAuthStateChange (SIGNED_OUT)
       ↓
setUser(null)
       ↓
navigate("/login")
```

---

## 🔄 Caso: Refrescar Página

```
Usuario presiona F5
       ↓
App se monta
       ↓
onAuthStateChange ejecuta
       ↓
Supabase verifica token en LocalStorage
       ├─ Token VÁLIDO → session = {...user...}
       │                setUser(user)
       │                Muestra dashboard
       │
       └─ Token INVÁLIDO → session = null
                           setUser(null)
                           Redirige a /login
```

---

## 🔐 Seguridad

### Tokens

- **Access Token**: JWT de corta duración (~1 hora)
- **Refresh Token**: Se usa para obtener nuevo access token automáticamente

### LocalStorage

Los tokens se guardan encriptados en `localStorage`:

```javascript
// Supabase lo maneja automáticamente
localStorage.getItem('sb-auth-token')
```

### Row-Level Security (RLS)

En Supabase, cada tabla tiene políticas RLS:

```sql
-- Usuario solo ve sus propios registros
CREATE POLICY "Users can read own data"
ON "public"."movimientos"
FOR SELECT
USING (auth.uid() = usuario_id);
```

---

## 📊 Diagrama de Estados

```
                    ┌──────────────┐
                    │  SIN SESIÓN  │
                    │  (UN-AUTH)   │
                    └──────┬───────┘
                           │
                  Click Login con Google
                           │
                           ↓
                    ┌──────────────┐
                    │  EN GOOGLE   │
                    │  OAUTH FLOW  │
                    └──────┬───────┘
                           │
                  Google redirige a callback
                           │
                           ↓
        ┌───────────┬──────────────┬──────────────┐
        │           │              │              │
        ↓           ↓              ↓              ↓
      ERROR    CANCELADO    APROBADO    TOKEN INVÁLIDO
        │           │              │              │
        └─────┬─────┴──────────┬───┴──────────┬──┘
              │                │              │
              ↓                ↓              ↓
         REDIRIGE       ┌──────────────┐  REDIRIGE
         A LOGIN        │ CON SESIÓN   │  A LOGIN
                        │ (AUTH)       │
                        │ DASHBOARD    │
                        └──────────────┘
```

---

## 🔗 Relaciones de Notas

- [[Hooks y Context]] - AuthContext y useUserAuth hook
- [[Stores Zustand]] - AuthStore para OAuth
- [[Componentes]] - Login component UI
- [[Páginas y Rutas]] - ProtectedRoute y rutas
- [[Arquitectura]] - auth en la arquitectura general
