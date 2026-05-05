import { useState } from "react";
import styled from "styled-components";
import { BtnForm } from "../moleculas/BtnForm";
import { v } from "../../styles/variables";
import { useCategoriasStore, useUsuariosStore } from "../../index";
import { ConfirmDialog } from "../moleculas/ConfirmDialog";
import { AnimatePresence } from "motion/react";

export function CardEliminarData() {
  const { eliminarCategoriasTodas } = useCategoriasStore();
  const { usuario } = useUsuariosStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirm = async () => {
    const p = {
      idusuario: usuario?.id,
    };
    setIsResetting(true);
    try {
      await eliminarCategoriasTodas(p);
    } finally {
      setIsResetting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Container>
      <AnimatePresence>
        {confirmOpen && (
          <ConfirmDialog
            title="¿Eliminar todas las categorías?"
            message="Esta acción es irreversible. Se eliminarán todas tus categorías registradas."
            confirmText="Sí, eliminar"
            onConfirm={handleConfirm}
            onCancel={() => setConfirmOpen(false)}
            isLoading={isResetting}
          />
        )}
      </AnimatePresence>

      <h2>Resetear todo</h2>
      <span>
        🐽ADVERTENCIA!: *esta acción es irreversible, una vez ejecutada se
        eliminaran todos tus registros de movimientos incluso las categorias
        registradas. <br />
        *Se reseteara tambien los saldos acumulados en tus cuentas.
      </span>
      <BtnForm
        titulo="resetear"
        bgcolor="rgba(247, 92, 92, 0.87)"
        funcion={() => setConfirmOpen(true)}
      />
      <div className="contentImg">
        <img src={v.logo2} />
      </div>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  width: 100%;
  border-radius: 10px;
  border: 2px solid rgba(255, 99, 99, 0.87);
  height: 100%;
  background: rgb(42, 1, 1);
  background: linear-gradient(
    18deg,
    rgba(252, 69, 69, 0.12) 9%,
    rgba(252, 69, 69, 0.3) 100%
  );
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 10px;
  gap: 20px;

  h2 {
    color: rgba(252, 69, 69, 0.72);
  }
  span {
    color: rgba(251, 82, 82, 0.67);
    font-size: 120%;
  }
  .contentImg {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20%;
    opacity: 0.18;
    margin: 30px;
    img {
      width: 100%;
      animation: flotar 1.7s ease-in-out infinite alternate;
    }
  }
  @keyframes flotar {
    0% {
      transform: translate(0, 0px);
    }
    50% {
      transform: translate(0, 10px);
    }
    100% {
      transform: translate(0, -0px);
    }
  }
`;
