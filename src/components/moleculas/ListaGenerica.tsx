import styled, { css } from "styled-components";
import { Device, BtnCerrar } from "../../index";
import { JSX, useMemo, useState } from "react";

interface ListaGenericaProps {
  data: Array<{
    icono: React.ReactNode;
    descripcion: string;
    [key: string]: any;
  }>;
  setState: () => void;
  funcion: (item: any) => void;
  scroll?: string;
  top?: string;
  bottom?: string;
  placement?: "up" | "down";
  mobilePlacement?: "up" | "down";
  btnClose?: boolean;
  mobileFlipUp?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
  emptyMessage?: string;
  filterBy?: string[];
  minItemsToFilter?: number;
}

interface ContainerProps {
  scroll?: string;
  $bottom?: string;
  $top?: string;
  $mobileBottom?: string;
  $mobileTop?: string;
  $mobileFlipUp?: boolean;
  $hasFilter?: boolean;
}

export const ListaGenerica = ({
  data,
  setState,
  funcion,
  scroll,
  bottom,
  top,
  placement,
  mobilePlacement,
  btnClose = false,
  mobileFlipUp = false,
  filterable = false,
  filterPlaceholder = "Buscar...",
  emptyMessage = "No hay resultados para mostrar.",
  filterBy = [],
  minItemsToFilter = 6,
}: ListaGenericaProps): JSX.Element => {
  const [search, setSearch] = useState("");
  const topPosition = top ?? (placement === "down" ? "100%" : undefined);
  const bottomPosition = bottom ?? (placement === "up" ? "100%" : undefined);
  const mobileTopPosition = mobilePlacement === "down" ? "100%" : undefined;
  const mobileBottomPosition = mobilePlacement === "up" ? "100%" : undefined;
  const showFilter = filterable && data.length >= minItemsToFilter;

  const normalizar = (valor: unknown): string =>
    String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const filteredData = useMemo(() => {
    if (!showFilter || search.trim() === "") {
      return data;
    }

    const query = normalizar(search);

    return data.filter((item) => {
      const values = [item.descripcion, ...filterBy.map((key) => item[key])];
      return values.some((value) => normalizar(value).includes(query));
    });
  }, [data, filterBy, search, showFilter]);

  const seleccionar = (p: any): void => {
    funcion(p);
    setState();
  };

  return (
    <Container
      scroll={scroll}
      $bottom={bottomPosition}
      $top={topPosition}
      $mobileBottom={mobileBottomPosition}
      $mobileTop={mobileTopPosition}
      $mobileFlipUp={mobileFlipUp}
      $hasFilter={showFilter}
    >
      {btnClose && (
        <div className="contentClose">
          <BtnCerrar funcion={setState} />
        </div>
      )}
      {showFilter && (
        <div className="contentFilter">
          <input
            type="text"
            value={search}
            placeholder={filterPlaceholder}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="contentItems">
        {filteredData.map((item, index) => (
          <ItemContainer key={index} $compact={showFilter} onClick={() => seleccionar(item)}>
            <span>{item.icono}</span>
            <span>{item.descripcion}</span>
          </ItemContainer>
        ))}
        {filteredData.length === 0 && <EmptyState>{emptyMessage}</EmptyState>}
      </div>
    </Container>
  );
};

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  position: absolute;
  top: ${(props) => props.$top};
  margin-bottom: ${({ $hasFilter }) => $hasFilter ? "6px" : "15px"};
  bottom: ${(props) => props.$bottom};
  width: 100%;
  padding: ${({ $hasFilter }) => $hasFilter ? "6px" : "10px"};
  border-radius: 10px;
  gap: ${({ $hasFilter }) => $hasFilter ? "6px" : "10px"};
  z-index: 260;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.text}14;
  box-shadow: 0 18px 40px rgba(8, 15, 25, 0.18);

  @media (max-width: 500px) {
    ${({ $mobileTop, $mobileBottom }) =>
      $mobileTop || $mobileBottom
        ? css`
            top: ${$mobileTop || "auto"};
            bottom: ${$mobileBottom || "auto"};
            margin-bottom: 0;
          `
        : ""}

    ${({ $top, $bottom, $mobileFlipUp }) =>
      $mobileFlipUp && $top && !$bottom
        ? css`
            top: auto;
            bottom: calc(100% + 6px);
            margin-bottom: 0;
          `
        : ""}
  }

  @media ${() => Device.tablet} {
    width: 400px;
  }
  .contentClose {
    display: flex;
    justify-content: flex-end;
    padding: 0;
    margin: 0;
  }
  .contentClose > * {
    margin: 0;
  }

  && .contentFilter {
    display: grid;
    padding: 0;
    margin: 0;
    gap: 0;
  }

  && .contentFilter input {
    width: 100%;
    border: 1px solid ${({ theme }) => theme.text}20;
    background: ${({ theme }) => theme.bgAlpha};
    color: ${({ theme }) => theme.text};
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  && .contentFilter input:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}20;
  }

  && .contentItems {
    display: flex;
    flex-direction: column;
    gap: ${({ $hasFilter }) => $hasFilter ? "2px" : "0"};
    padding: 0;
    margin: 0;
    max-height: min(260px, 45vh);
    overflow-y: ${(props) => props.scroll || "auto"};
    overflow-x: hidden;
    min-height: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(225, 78, 25, 0.5) rgba(20, 27, 38, 0.06);
  }

  && .contentItems::-webkit-scrollbar {
    width: 8px;
  }

  && .contentItems::-webkit-scrollbar-track {
    background: rgba(20, 27, 38, 0.06);
    border-radius: 999px;
  }

  && .contentItems::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(255, 145, 87, 0.92), rgba(225, 78, 25, 0.88));
    border-radius: 999px;
  }

  && .contentItems::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(255, 157, 108, 1), rgba(225, 78, 25, 1));
  }
`;
const ItemContainer = styled.div<{ $compact?: boolean }>`
  gap: ${({ $compact }) => $compact ? "6px" : "10px"};
  display: flex;
  align-items: center;
  padding: ${({ $compact }) => $compact ? "6px 8px" : "10px"};
  border-radius: ${({ $compact }) => $compact ? "8px" : "10px"};
  cursor: pointer;
  line-height: 1.15;
  transition: 0.2s;

  span:first-child {
    flex: 0 0 auto;
    line-height: 1;
  }

  &:hover {
    background-color: ${({ theme }) => theme.bgtotal};
  }
`;

const EmptyState = styled.div`
  padding: 14px 10px 8px;
  color: ${({ theme }) => theme.colorSubtitle};
  text-align: center;
  font-size: 0.94rem;
`;
