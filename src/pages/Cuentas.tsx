import { CuentasTemplate } from "../components/templates/CuentasTemplate";
import { useCuentaStore } from "../store/CuentaStore";
import { useOperaciones } from "../store/OperacionesStore";
import { useUsuariosStore } from "../store/UsuariosStore";
import { Cuenta } from "../supabase/crudCuentas";
import { useQuery } from "@tanstack/react-query";
import { logger } from "../utils/logger";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";

export function Cuentas() {
  const { selectTipoCuenta } = useOperaciones();
  const { cuentas, mostrarCuentas } = useCuentaStore();
  const { usuario } = useUsuariosStore();
  const isDev = import.meta.env.DEV;

  const { isLoading, error } = useQuery<Cuenta[], Error>({
    queryKey: ["mostrar cuentas", selectTipoCuenta, usuario?.id],
    queryFn: () => {
      if (!usuario?.id) {
        logger.warn('Usuario no disponible para cargar cuentas');
        throw new Error("Usuario no disponible");
      }
      return mostrarCuentas({
        idusuario: usuario.id,
        tipo: selectTipoCuenta.tipo
      } as Cuenta);
    },
    enabled: !!usuario?.id,
    staleTime: isDev ? 0 : 5 * 60 * 1000, // 0 en desarrollo, 5 minutos en producción
    gcTime: 10 * 60 * 1000, // 10 minutos (renamed from cacheTime)
    refetchOnMount: isDev ? "always" : true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Mostrar loader mientras se cargan los datos
  if (isLoading) return <SpinnerLoader />;

  // Si hay error en la query
  if (error) {
    logger.error('Error al cargar cuentas', { error });
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error al cargar las cuentas</h2>
        <p>{error?.message}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>Por favor, recarga la página o intenta más tarde</p>
      </div>
    );
  }

  // Si no hay usuario cargado, mostrar spinner (debería ser rápido)
  if (!usuario?.id) {
    return <SpinnerLoader />;
  }

  return (
    <>
      <CuentasTemplate data={cuentas} />
    </>
  );
}
