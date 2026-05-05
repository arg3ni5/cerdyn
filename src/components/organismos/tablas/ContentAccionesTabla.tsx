import styled from "styled-components";
import { AccionTabla } from "../../../index";
import { v } from "../../../styles/variables";
import { JSX } from "react";

interface ContentAccionesTablaProps {
  funcionEditar: () => void;
  funcionEliminar: () => void;
}

export const ContentAccionesTabla = ({ funcionEditar, funcionEliminar }: ContentAccionesTablaProps): JSX.Element => {
  return (
    <Container>
      <AccionTabla funcion={funcionEditar} fontSize="18px" color="#7d7d7d" icono={<v.iconeditarTabla />} label="Editar" />
      <AccionTabla funcion={funcionEliminar} fontSize="20px" color="#f76e8e" icono={<v.iconeliminarTabla />} label="Eliminar" />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;

  @media (max-width: 48em) {
    justify-content: flex-end;
    gap: 8px;

    button {
      min-height: 42px;
      min-width: 108px;
      border-radius: 10px;
      border: 1px solid currentColor;
      font-size: 18px;
      font-weight: 800;
      gap: 8px;
      padding: 9px 12px;
    }

    button:first-child {
      background: rgba(125, 125, 125, 0.12);
    }

    button:last-child {
      background: rgba(247, 110, 142, 0.14);
    }

    button span {
      display: inline;
      color: ${({ theme }) => theme.text};
      font-size: 13px;
    }
  }
`;
