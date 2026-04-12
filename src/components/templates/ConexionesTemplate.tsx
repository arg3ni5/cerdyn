import styled from "styled-components";
import { Header, useUsuariosStore, useConexionesStore, Conexion } from "../../index";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const ConexionesTemplate: React.FC = () => {
  const { usuario } = useUsuariosStore();
  const { mostrarConexiones, conexiones, eliminarConexion } = useConexionesStore();
  const queryClient = useQueryClient();

  const { isLoading, error } = useQuery({
    queryKey: ["mostrar conexiones", usuario?.id],
    queryFn: async () => {
      if (usuario?.id === undefined) {
        throw new Error("User ID is required");
      }

      return await mostrarConexiones({ idusuario: usuario.id });
    },
    enabled: !!usuario?.id,
  });

  if (!usuario) {
    return null;
  }

  const confirmarEliminacion = async (conexion: Conexion) => {
    const result = await Swal.fire({
      title: "¿Eliminar esta conexión?",
      text: `@${conexion.canal_username || "sin username"} (${conexion.canal})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await eliminarConexion(conexion);
        await queryClient.invalidateQueries({
          queryKey: ["mostrar conexiones", usuario.id],
        });
        await Swal.fire("Eliminado", "La conexión se eliminó correctamente.", "success");
      } catch {
        await Swal.fire("Error", "No se pudo eliminar la conexión.", "error");
      }
    }
  };

  return (
    <Container>
      <header className="header">
        <Header stateConfig={{ state: false, setState: () => {} }} />
      </header>

      <Hero>
        <div>
          <Eyebrow>Conexiones</Eyebrow>
          <h1>Gestioná tus cuentas vinculadas</h1>
          <p>
            Revisá los canales conectados a tu cuenta y eliminá cualquier acceso que ya no querés
            conservar.
          </p>
        </div>
        <StatsCard>
          <span>Total Activo</span>
          <strong>{conexiones?.length ?? 0}</strong>
          <small>canales vinculados</small>
        </StatsCard>
      </Hero>

      <Panel>
        {isLoading && <StateMessage>Cargando vinculaciones…</StateMessage>}
        {error && <StateMessage role="alert">No se pudieron cargar las vinculaciones.</StateMessage>}

        {!isLoading && !error && (conexiones?.length ?? 0) > 0 && (
          <CardsList>
            {conexiones?.map((conexion) => (
              <ConnectionCard key={conexion.id}>
                <div className="meta">
                  <ConnectionBadge>{conexion.canal}</ConnectionBadge>
                  <strong>@{conexion.canal_username || "sin username"}</strong>
                  <span>ID externo: {conexion.canal_user_id}</span>
                  <small>
                    Vinculado{" "}
                    {conexion.vinculado_en
                      ? new Intl.DateTimeFormat("es-CR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(conexion.vinculado_en))
                      : "sin fecha registrada"}
                  </small>
                </div>

                <DeleteButton
                  type="button"
                  onClick={() => confirmarEliminacion(conexion)}
                  aria-label={`Eliminar conexión con ${conexion.canal}`}
                >
                  Eliminar
                </DeleteButton>
              </ConnectionCard>
            ))}
          </CardsList>
        )}

        {!isLoading && !error && !conexiones?.length && (
          <EmptyState>
            <strong>No tenés cuentas vinculadas todavía.</strong>
            <span>Cuando conectés un canal externo, lo vas a ver listado acá.</span>
          </EmptyState>
        )}
      </Panel>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  gap: 24px;
  grid-template:
    "header" auto
    "hero" auto
    "panel" 1fr;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }
`;

const Hero = styled.section`
  grid-area: hero;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(230px, 0.7fr);
  gap: 18px;

  h1 {
    margin: 10px 0 12px;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 0.96;
    text-wrap: balance;
  }

  p {
    margin: 0;
    max-width: 42rem;
    color: ${({ theme }) => theme.colorSubtitle};
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Eyebrow = styled.span`
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.primary};
`;

const StatsCard = styled.aside`
  padding: 22px;
  border-radius: 24px;
  background: linear-gradient(150deg, rgba(77, 169, 255, 0.18), rgba(255, 197, 106, 0.18));
  border: 1px solid rgba(77, 169, 255, 0.16);
  display: grid;
  align-content: start;
  gap: 8px;

  span {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colorSubtitle};
  }

  strong {
    font-size: 2.6rem;
    line-height: 1;
  }

  small {
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;

const Panel = styled.section`
  grid-area: panel;
  padding: 24px;
  border-radius: 28px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
`;

const StateMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colorSubtitle};
`;

const CardsList = styled.div`
  display: grid;
  gap: 16px;
`;

const ConnectionCard = styled.article`
  padding: 20px;
  border-radius: 22px;
  background: ${({ theme }) => theme.bgAlpha};
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;

  .meta {
    min-width: 0;
    display: grid;
    gap: 6px;
  }

  strong,
  span,
  small {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  strong {
    font-size: 1.05rem;
  }

  span,
  small {
    color: ${({ theme }) => theme.colorSubtitle};
  }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ConnectionBadge = styled.span`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(58, 141, 255, 0.12);
  color: ${({ theme }) => theme.primary};
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: capitalize;
`;

const DeleteButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 12px 16px;
  background: rgba(228, 76, 76, 0.12);
  color: #c63b3b;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(228, 76, 76, 0.18);
    color: #9d1f1f;
  }
`;

const EmptyState = styled.div`
  min-height: 220px;
  border-radius: 24px;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 10px;
  background: ${({ theme }) => theme.bgAlpha};

  span {
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;
