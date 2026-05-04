import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { Header, supabase, useConexionesStore, useUsuariosStore } from "../../index";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

type LinkStatus = "loading" | "no-session" | "success" | "already" | "error";

export const VincularTemplate: React.FC = () => {
  const { usuario } = useUsuariosStore();
  const { conexiones, insertarConexion, mostrarConexiones } = useConexionesStore();
  const [status, setStatus] = useState<LinkStatus>("loading");
  const [msgError, setMsgError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const canal = searchParams.get("canal") || "telegram";
  const canalUserId = searchParams.get("id");
  const canalUsername = searchParams.get("username") || "";

  useQuery({
    queryKey: ["mostrar conexiones", usuario?.id],
    queryFn: async () => {
      if (!usuario?.id) {
        throw new Error("User ID is required");
      }

      return await mostrarConexiones({ idusuario: usuario.id });
    },
    enabled: !!usuario?.id,
  });

  const statusMessage = useMemo(() => {
    switch (status) {
      case "loading":
        return "Verificando tu sesión…";
      case "no-session":
        return "Iniciá sesión para vincular tu cuenta.";
      case "success":
        return "La cuenta se vinculó correctamente.";
      case "already":
        return `La cuenta de ${canal} ya estaba vinculada.`;
      case "error":
      default:
        return "No pudimos completar la vinculación.";
    }
  }, [canal, status]);

  useEffect(() => {
    const vincular = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        setStatus("no-session");
        return;
      }

      if (usuario?.id === undefined) {
        setStatus("error");
        setMsgError("No se encontró el ID de usuario.");
        return;
      }

      if (!canalUserId) {
        setStatus("error");
        setMsgError("No se encontró el identificador del canal que querés vincular.");
        return;
      }

      if (!conexiones) return;

      const yaVinculado = conexiones.some(
        (conexion) => conexion.canal === canal && conexion.canal_user_id === canalUserId
      );

      if (yaVinculado) {
        setStatus("already");
        return;
      }

      try {
        await insertarConexion({
          idusuario: usuario.id,
          canal,
          canal_user_id: canalUserId,
          canal_username: canalUsername,
        });
        setStatus("success");
      } catch (err) {
        if (err instanceof Error && err.message.toLowerCase().includes("duplicate")) {
          setStatus("already");
        } else {
          setStatus("error");
          setMsgError("Revisá el enlace de vinculación y volvé a intentarlo.");
        }
      }
    };

    if (usuario?.id) {
      void vincular();
    }
  }, [canal, canalUserId, canalUsername, conexiones, insertarConexion, usuario?.id]);

  return (
    <Container>
      <header className="header">
        <Header stateConfig={{ state: false, setState: () => { } }} />
      </header>
      <section className="area2">
        {status === "loading" && <p>🔄 Verificando tu sesión...</p>}
        {status === "no-session" && <p>🔒 Iniciá sesión para vincular tu cuenta.</p>}
        {status === "success" && <p>✅ ¡Tu cuenta fue vinculada exitosamente!</p>}
        {status === "already" && <p>⚠️ Esta cuenta de {canal} ya está vinculada.</p>}
        {status === "error" && <p>❌ Ocurrió un error al vincular tu cuenta.</p>}
      </section>

      <MainCard>
        <Eyebrow>Vincular Canal</Eyebrow>
        <h1>{status === "success" ? "Todo Listo" : "Estado De Vinculación"}</h1>
        <StatusPill data-status={status}>{statusMessage}</StatusPill>

        {(status === "success" || status === "already") && (
          <PrimaryAction type="button" onClick={() => navigate("/conexiones")}>
            Ver Mis Cuentas Vinculadas
          </PrimaryAction>
        )}

        {msgError && <ErrorText role="alert">{msgError}</ErrorText>}
      </MainCard>

      {conexiones && conexiones.length > 0 && (
        <ConnectionsPanel>
          <h2>Canales Actuales</h2>
          <CardsList>
            {conexiones.map((conexion) => (
              <ConnectionCard key={`${conexion.canal}-${conexion.canal_user_id}`}>
                <strong>{conexion.canal}</strong>
                <span>@{conexion.canal_username || "sin username"}</span>
                <small>ID: {conexion.canal_user_id}</small>
              </ConnectionCard>
            ))}
          </CardsList>
        </ConnectionsPanel>
      )}
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
    "main" auto
    "panel" 1fr;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }
`;

const MainCard = styled.section`
  grid-area: main;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.92), rgba(191, 222, 255, 0.72));
  color: #172335;
  box-shadow: 0 20px 40px rgba(45, 98, 166, 0.12);
  display: grid;
  gap: 14px;

  h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 0.96;
    text-wrap: balance;
  }
`;

const Eyebrow = styled.span`
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #47627f;
`;

const StatusPill = styled.div`
  width: fit-content;
  padding: 12px 16px;
  border-radius: 999px;
  font-weight: 700;

  &[data-status="loading"] {
    background: rgba(58, 141, 255, 0.12);
    color: #2160a7;
  }

  &[data-status="success"] {
    background: rgba(37, 168, 110, 0.14);
    color: #0f7d4a;
  }

  &[data-status="already"] {
    background: rgba(255, 179, 71, 0.22);
    color: #a86409;
  }

  &[data-status="error"],
  &[data-status="no-session"] {
    background: rgba(228, 76, 76, 0.14);
    color: #a22828;
  }
`;

const PrimaryAction = styled.button`
  width: fit-content;
  border: none;
  border-radius: 999px;
  padding: 13px 18px;
  background: #172335;
  color: #f7f7f7;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: #0f1826;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: #a22828;
`;

const ConnectionsPanel = styled.section`
  grid-area: panel;
  padding: 24px;
  border-radius: 28px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);

  h2 {
    margin-top: 0;
  }
`;

const CardsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const ConnectionCard = styled.article`
  padding: 18px;
  border-radius: 22px;
  background: ${({ theme }) => theme.bgAlpha};
  display: grid;
  gap: 6px;

  span,
  small {
    color: ${({ theme }) => theme.colorSubtitle};
    overflow-wrap: anywhere;
  }
`;
