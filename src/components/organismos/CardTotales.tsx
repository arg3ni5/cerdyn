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
    <Container>
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

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.bg};
  border-radius: 25px;
  padding: 20px;
  width: 100%;
  justify-content: space-between;
  .contentTextos {
    display: flex;
    flex-direction: column;
    .title {
      font-size: 14px;
    }
    .total {
      font-size: 22px;
      font-weight: 500;
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
