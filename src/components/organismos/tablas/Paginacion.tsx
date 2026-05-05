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
  gap: 15px;

  button {
    background-color: ${(props) => props.$colorCategoria};
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    text-align: center;
    transition: 0.3s;

    &:hover {
      box-shadow: 0px 10px 15px -3px ${(props) => props.$colorCategoria};
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
    background-color: #646464;
    cursor: no-drop;
    box-shadow: none;
  }
`;
