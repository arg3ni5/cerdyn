import styled, { css } from "styled-components";
import { Device, BtnCerrar } from "../../index";
import { JSX } from "react";

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
}

interface ContainerProps {
  scroll?: string;
  $bottom?: string;
  $top?: string;
  $mobileBottom?: string;
  $mobileTop?: string;
  $mobileFlipUp?: boolean;
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
  btnClose = true,
  mobileFlipUp = false,
}: ListaGenericaProps): JSX.Element => {
  const topPosition = top ?? (placement === "down" ? "100%" : undefined);
  const bottomPosition = bottom ?? (placement === "up" ? "100%" : undefined);
  const mobileTopPosition = mobilePlacement === "down" ? "100%" : undefined;
  const mobileBottomPosition = mobilePlacement === "up" ? "100%" : undefined;

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
    >
      {btnClose && (
        <section className="contentClose">
          <BtnCerrar funcion={setState} />
        </section>
      )}
      <section className="contentItems">
        {data.map((item, index) => (
          <ItemContainer key={index} onClick={() => seleccionar(item)}>
            <span>{item.icono}</span>
            <span>{item.descripcion}</span>
          </ItemContainer>
        ))}
      </section>
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
  margin-bottom: 15px;
  bottom: ${(props) => props.$bottom};
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
  z-index: 20;

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


  .contentItems {
    padding-top: 0;
    max-height: min(260px, 45vh);
    overflow-y: ${(props) => props.scroll || "auto"};
  }
`;
const ItemContainer = styled.div`
  gap: 10px;
  display: flex;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.bgtotal};
  }
`;
