import { JSX, useEffect } from "react";
import { v } from "../../../styles/variables";
import styled from "styled-components";

interface PaginacionProps {
  color?: string;
  pagina: number;
  setPagina: (pagina: number) => void;
  maximo: number;
  bgCategoria?: string; 
  colorCategoria?: string;
}

interface ContainerProps {
  $bgCategoria: string;
  $colorCategoria: string;
}

export const Paginacion = ({ pagina, setPagina, maximo, color, bgCategoria, colorCategoria }: PaginacionProps): JSX.Element => {
  const totalPaginas = Math.max(1, Math.ceil(maximo));
  const paginaActual = Math.min(Math.max(pagina, 1), totalPaginas);

  useEffect(() => {
    if (pagina !== paginaActual) {
      setPagina(paginaActual);
    }
  }, [pagina, paginaActual, setPagina]);

  const nextPage = (): void => {
    setPagina(Math.min(paginaActual + 1, totalPaginas));
  };

  const previousPage = (): void => {
    setPagina(Math.max(paginaActual - 1, 1));
  };

  return (
    <Container $bgCategoria={bgCategoria || ''} $colorCategoria={color || colorCategoria || ''}>
      <button disabled={paginaActual === 1} onClick={() => setPagina(1)} title="Primera página" aria-label="Primera página">
        <span>{<v.iconotodos />}</span>
      </button>
      <button disabled={paginaActual === 1} onClick={previousPage} title="Página anterior" aria-label="Página anterior">
        <span className="iconoIzquierda">{<v.iconoflechaderecha />}</span>
      </button>
      <span className="page-status">
        <strong>{paginaActual}</strong>
        <span>de</span>
        <strong>{totalPaginas}</strong>
      </span>
      <button
        disabled={paginaActual === totalPaginas}
        onClick={nextPage}
        title="Página siguiente"
        aria-label="Página siguiente"
      >
        <span>{<v.iconoflechaderecha />}</span>
      </button>
    </Container>
  );
};

const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;

  .page-status {
    min-width: 96px;
    min-height: 40px;
    padding: 0 14px;
    border-radius: 6px;
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.text}18;
    color: ${({ theme }) => theme.text};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 700;

    span {
      color: ${({ theme }) => theme.colorSubtitle};
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
    }
  }

  button {
    background-color: ${(props) => props.$colorCategoria || "#fe6156"};
    border: none;
    padding: 0;
    border-radius: 6px;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

    &:hover {
      box-shadow: 0px 10px 15px -3px ${(props) => props.$colorCategoria || "#fe6156"};
      transform: translateY(-1px);
    }
    .iconoIzquierda {
      transform: rotate(-180deg);
    }
    span {
      color: #fff;
      display: flex;
      svg {
        font-size: 15px;
        font-weight: 800;
      }
    }
  }

  button[disabled] {
    background-color: ${({ theme }) => theme.text}28;
    cursor: not-allowed;
    opacity: 0.65;
    box-shadow: none;
    transform: none;
  }
`;
