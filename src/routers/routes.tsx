import { lazy, Suspense, type ComponentType } from "react";
import { Routes, Route } from "react-router-dom";
import AuthCallback from "../pages/AuthCallback";
import { ProtectedRoute } from "../hooks/ProtectedRoute";
import { useUserAuth } from "../context/AuthContent";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";

const lazyPage = <TModule extends Record<TExport, ComponentType>, TExport extends keyof TModule>(
  importer: () => Promise<TModule>,
  exportName: TExport
) => lazy(async () => await importer().then((module) => ({ default: module[exportName] })));

const Login = lazyPage(() => import("../pages/Login"), "Login");
const Home = lazyPage(() => import("../pages/Home"), "Home");
const Configuracion = lazyPage(() => import("../pages/Configuracion"), "Configuracion");
const Categorias = lazyPage(() => import("../pages/Categorias"), "Categorias");
const Movimientos = lazyPage(() => import("../pages/Movimientos"), "Movimientos");
const ImportarMovimientos = lazyPage(() => import("../pages/ImportarMovimientos"), "ImportarMovimientos");
const Informes = lazyPage(() => import("../pages/Informes"), "Informes");
const Vincular = lazyPage(() => import("../pages/Vincular"), "Vincular");
const Conexiones = lazyPage(() => import("../pages/Conexiones"), "Conexiones");
const Dashboard = lazyPage(() => import("../pages/Dashboard"), "Dashboard");
const Cuentas = lazyPage(() => import("../pages/Cuentas"), "Cuentas");

const protectedRoutes = [
  { path: "/", element: <Home /> },
  { path: "/home", element: <Home /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/cuentas", element: <Cuentas /> },
  { path: "/conexiones", element: <Conexiones /> },
  { path: "/vincular", element: <Vincular /> },
  { path: "/configurar", element: <Configuracion /> },
  { path: "/categorias", element: <Categorias /> },
  { path: "/movimientos", element: <Movimientos /> },
  { path: "/movimientos/importar", element: <ImportarMovimientos /> },
  { path: "/informes", element: <Informes /> },
  { path: "/acercade", element: <Home /> },
];

interface ProtectedRouteProps {
  isLoading: boolean;
}

export const MyRoutes = ({ isLoading }: ProtectedRouteProps) => {
  const { user } = useUserAuth();

  return (
    <Suspense fallback={<SpinnerLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<ProtectedRoute user={user} redirectTo="/" isLoading={isLoading} />}>
          {protectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
};
