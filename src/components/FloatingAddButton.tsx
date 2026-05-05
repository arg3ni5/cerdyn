import { useState } from 'react';
import { styled } from 'styled-components';
import { useLocation } from 'react-router-dom';
import { Tipo, v } from '../index';
import { DataDesplegables } from '../utils/dataEstatica';
import { useMovimientoModalStore } from '../store/useMovimientoModalStore';

export default function FloatingAddButton() {
  const openMovimientoModal = useMovimientoModalStore((state) => state.openMovimientoModal);
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  if (pathname === '/movimientos') return null;

  const gastos = DataDesplegables.movimientos.g as Tipo;
  const ingresos = DataDesplegables.movimientos.i as Tipo;
  const transferencias = DataDesplegables.movimientos.t as Tipo;

  const obtenerTextoNuevoMovimiento = (item: Tipo): string => {
    if (item.tipo === "t") return "Nueva Transferencia";
    if (item.tipo === "i") return "Nuevo Ingreso";
    return "Nuevo Gasto";
  };

  const nuevoRegistro = (tipo: Tipo): void => {
    openMovimientoModal(tipo);
    setIsOpen(false);
  };

  return (
    <FloatingActionMenu
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {isOpen && (
        <div className="opciones">
          {[gastos, ingresos, transferencias].map((item) => (
            <FloatingActionOption
              key={item.tipo}
              type="button"
              onClick={() => nuevoRegistro(item)}
              $bgcolor={item.bgcolor}
              $textcolor={item.color}
            >
              <span>{item.icono}</span>
              <strong>{obtenerTextoNuevoMovimiento(item)}</strong>
            </FloatingActionOption>
          ))}
        </div>
      )}
      <FloatingActionToggle
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Registrar movimiento"
        aria-expanded={isOpen}
      >
        <v.agregar />
      </FloatingActionToggle>
    </FloatingActionMenu>
  );
}

const FloatingActionMenu = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;

  .opciones {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  @media (min-width: 768px) {
    right: 32px;
    bottom: 32px;
  }
`;

const FloatingActionToggle = styled.button`
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: #e14e19;
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(225, 78, 25, 0.28);
  transition: transform 0.2s ease, background-color 0.2s ease;

  svg {
    width: 28px;
    height: 28px;
  }

  &:hover {
    transform: scale(1.05);
    background: #c44214;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const FloatingActionOption = styled.button<{ $bgcolor: string; $textcolor: string }>`
  border: none;
  border-radius: 18px;
  padding: 12px 14px;
  min-width: 168px;
  background: ${({ $bgcolor }) => $bgcolor};
  color: ${({ $textcolor }) => $textcolor};
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
  transition: transform 0.2s ease, filter 0.2s ease;

  span {
    font-size: 20px;
    line-height: 1;
  }

  strong {
    font-size: 14px;
  }

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }
`;
