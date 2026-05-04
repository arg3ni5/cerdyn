import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AuthCallback from "../pages/AuthCallback";
import { ProtectedRoute } from "../hooks/ProtectedRoute";
import { useUserAuth } from "../context/AuthContent";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";

const Login = lazy(async () => await import("../pages/Login").then((module) => ({ default: module.Login })));
const Home = lazy(async () => await import("../pages/Home").then((module) => ({ default: module.Home })));
const Configuracion = lazy(
  async () => await import("../pages/Configuracion").then((module) => ({ default: module.Configuracion }))
);
const Categorias = lazy(
  async () => await import("../pages/Categorias").then((module) => ({ default: module.Categorias }))
);
const Movimientos = lazy(
  async () => await import("../pages/Movimientos").then((module) => ({ default: module.Movimientos }))
);
const ImportarMovimientos = lazy(
  async () => await import("../pages/ImportarMovimientos").then((module) => ({ default: module.ImportarMovimientos }))
);
const Informes = lazy(
  async () => await import("../pages/Informes").then((module) => ({ default: module.Informes }))
);
const Vincular = lazy(async () => await import("../pages/Vincular").then((module) => ({ default: module.Vincular })));
const Conexiones = lazy(
  async () => await import("../pages/Conexiones").then((module) => ({ default: module.Conexiones }))
);
const Dashboard = lazy(async () => await import("../pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const Cuentas = lazy(async () => await import("../pages/Cuentas").then((module) => ({ default: module.Cuentas })));

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
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cuentas" element={<Cuentas />} />
          <Route path="/conexiones" element={<Conexiones />} />
          <Route path="/vincular" element={<Vincular />} />
          <Route path="/configurar" element={<Configuracion />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/movimientos/importar" element={<ImportarMovimientos />} />
          <Route path="/informes" element={<Informes />} />
          <Route path="/acercade" element={<Home />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
