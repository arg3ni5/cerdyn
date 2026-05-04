import { createContext, JSX, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider, styled } from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { MyRoutes } from "./routers/routes";
import { Sidebar } from "./components/organismos/sidebar/Sidebar";
import { Menuambur } from "./components/organismos/Menuambur";
import { AuthContextProvider } from "./context/AuthContent";
import { LoadingProvider } from "./context/LoadingContext";
import { useUsuariosStore } from "./store/UsuariosStore";
import { SpinnerLoader } from "./components/moleculas/SpinnerLoader";
import { GlobalStyles } from "./styles/GlobalStyles";
import { Dark, Light } from "./styles/themes";
import { Device } from "./styles/breakpoints";
import type { Usuario } from "./supabase/crudUsuarios";
import ErrorBoundary from "./components/ErrorBoundary";
import QuickAddModal from "./components/QuickAddModal";
import FloatingAddButton from './components/FloatingAddButton';
import { ToastContainer } from './components/atomos/ToastContainer';

type ThemeContextType = typeof Light;

export const ThemeContext = createContext<ThemeContextType>(Light);

function App(): JSX.Element {
  const { setUsuario, clearUsuario, ObtenerUsuarioActual } = useUsuariosStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isPublicRoute = pathname === "/login" || pathname === "/auth/callback";

  const {
    data: usuario,
    isLoading,
    error,
    fetchStatus
  } = useQuery<Usuario, Error>({
    queryKey: ["usuarioActual"],
    queryFn: ObtenerUsuarioActual,
    enabled: !isPublicRoute,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // Cache usuario por 5 minutos
  });

  useEffect(() => {
    if (usuario) {
      setUsuario(usuario);
    }

    if (error && fetchStatus !== "fetching" && !isPublicRoute) {
      clearUsuario();
      navigate("/login");
    }
  }, [usuario, error, fetchStatus, isPublicRoute, setUsuario, clearUsuario, navigate]);

  const themeStyle = useMemo(() => {
    const themeName = usuario?.tema === "0" ? "light" : "dark";
    return themeName === "light" ? Light : Dark;
  }, [usuario?.tema]);

  if (!isPublicRoute && isLoading) return <SpinnerLoader />;


  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={themeStyle}>
        <LoadingProvider>
          <ThemeProvider theme={themeStyle}>
            <GlobalStyles />
            <ToastContainer />
            <AuthContextProvider>
              {!isPublicRoute ? (
                <Container className={sidebarOpen ? "active" : ""}>
                  <div className="ContentSidebar">
                    <Sidebar
                      state={sidebarOpen}
                      setState={() => setSidebarOpen(!sidebarOpen)}
                    />
                  </div>

                  <div className="ContentMenuambur">
                    <Menuambur />
                  </div>

                  <Containerbody>
                    <FloatingAddButton />
                    <QuickAddModal />
                    <MyRoutes isLoading={isLoading} />
                  </Containerbody>
                </Container>
              ) : (
                <MyRoutes isLoading={isLoading} />
              )}
            </AuthContextProvider>
          </ThemeProvider>
        </LoadingProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  background: ${({ theme }) => theme.bgtotal};
  transition: grid-template-columns 0.2s ease-in-out, background-color 0.2s ease-in-out;

  .ContentSidebar {
    display: none;
  }

  .ContentMenuambur {
    display: block;
    position: absolute;
    left: 20px;
  }

  @media ${Device.tablet} {
    grid-template-columns: 65px 1fr;

    &.active {
      grid-template-columns: 220px 1fr;
    }

    .ContentSidebar {
      display: initial;
    }

    .ContentMenuambur {
      display: none;
    }
  }
`;

const Containerbody = styled.div`
  grid-column: 1;
  width: 100%;

  @media ${Device.tablet} {
    grid-column: 2;
  }
`;

export default App;
