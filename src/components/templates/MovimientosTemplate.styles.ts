import styled from "styled-components";
import { Device } from "../../index";

interface ContainerProps {
  $isBalanceActive: boolean;
}

export const Container = styled.div<ContainerProps>`
  max-width: 100%;
  overflow-x: hidden;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  grid-template:
    "header" 100px
    "tipo" 100px
    "totales" auto
    "calendario" 100px
    "main" auto
    "empty" auto;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }
  .tipo {
    grid-area: tipo;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .totales {
    grid-area: totales;
    display: grid;
    align-items: center;
    grid-template-columns: 1fr;
    gap: 10px;

    @media ${Device.tablet} {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .calendario {
    grid-area: calendario;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .empty {
  }
  .main {
    grid-area: main;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 10px;

    > * {
      flex: 1 1 100%;
      max-width: 100%;
    }

    @media ${Device.tablet} {
      > * {
        flex: ${({ $isBalanceActive }) => ($isBalanceActive ? "1 1 calc(50% - 5px)" : "1 1 100%")};
        max-width: ${({ $isBalanceActive }) => ($isBalanceActive ? "calc(50% - 5px)" : "100%")};
      }
    }
  }

  .filtros-activo {
    display: flex;
    justify-content: flex-start;
    margin-right: auto;
  }

  .filtros-secundarios {
    display: flex;
    margin-left: auto;
    justify-content: flex-end;
    gap: 10px;
  }
`;
export const ContentFiltro = styled.div`
  display: flex;
  flex-wrap: wrap;
`;


export const TipoBar = styled.section`
  grid-area: tipo;
  display: grid;
  grid-template-columns: 1fr auto; /* filters | + button */
  gap: 12px;
  align-items: center;

  > :first-child {
    width: 100%;
    min-width: 0;
  }
`;

export const FiltersScroll = styled.div`
`;

export const AddWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const MobileOnly = styled.div`
  display: block;

  @media ${Device.tablet} {
    display: none;
  }
`;

export const DesktopOnly = styled.div`
  display: none;

  @media ${Device.tablet} {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    gap: 10px;
  }
`;