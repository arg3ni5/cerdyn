import styled from "styled-components";
import { useUsuariosStore, BtnCircular } from "../../index";
import { JSX } from "react";

interface CardTotalesProps {
  color: string;
  total: number | string;
  title: string;
  icono: React.ReactNode;
}

export const CardTotales = ({ color, total, title, icono }: CardTotalesProps): JSX.Element => {
  const { usuario } = useUsuariosStore();

  // Formatear el número a 2 decimales
  const formatearTotal = (valor: number | string): string => {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <Container $accent={color}>
      <div className="contentTextos">
        <section>
          <span className="title">{title}</span>
        </section>
        <span className="total">
          {usuario?.moneda} {formatearTotal(total)}
        </span>
      </div>
      <div className="contentIcono">
        <BtnCircular
          height="50px"
          width="50px"
          bgcolor={color}
          fontsize="25px"
          icono={icono}
          textcolor="#ffffff"
          translatex="-45px"
          translatey="-15px"
        />
      </div>
    </Container>
  );
};

const Container = styled.div<{ $accent: string }>`
  display: flex;
  align-items: center;
  background:
    linear-gradient(180deg, ${({ theme }) => theme.bg3}, ${({ theme }) => theme.bg});
  border-radius: 26px;
  padding: 22px;
  width: 100%;
  justify-content: space-between;
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(151, 151, 151, 0.12);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 5px;
    background: ${({ $accent }) => $accent};
  }

  .contentTextos {
    display: flex;
    flex-direction: column;
    gap: 6px;
    .title {
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${({ theme }) => theme.colorSubtitle};
    }
    .total {
      font-size: clamp(1.45rem, 3vw, 1.8rem);
      font-weight: 700;
    }
    section{
      display:flex;
      gap:10px;
      display:flex;
      align-items:center;
    }
  }
  .contentIcono {
    display: flex;
  }
`;
