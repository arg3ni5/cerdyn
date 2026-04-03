import styled from "styled-components";
import {
  Header,
  CalendarioLineal,
  CardTotales,
  useMovimientosStore,
  v,
  Tabs
} from "../../index";
import { useState } from "react";
import { Device } from "../../styles/breakpoints";

export const DashboardTemplate = () => {
  const [state, setState] = useState(false);

  const {
    totalMesAñoPagados,
    ingresosPagadosMes,
    gastosPagadosMes,
  } = useMovimientosStore();

  return (
    <Container>
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>

      <section className="filtros">
        <CalendarioLineal />
      </section>

      <section className="totales">
        <CardTotales
          total={ingresosPagadosMes}
          title="Ingresos pagados"
          color={v.colorIngresos}
          icono={<v.flechaarribalarga />}
        />
        <CardTotales
          total={gastosPagadosMes}
          title="Gastos pagados"
          color={v.colorGastos}
          icono={<v.flechaabajolarga />}
        />
        <CardTotales
          total={totalMesAñoPagados}
          title="Balance pagado"
          color={v.colorBalance}
          icono={<v.balance />}
        />
      </section>

      <section className="graficos">
        <Tabs />
      </section>
    </Container>
  );
};

const Container = styled.div`
  max-width: 100%;
  overflow-x: hidden;
  padding: 15px;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};

  display: grid;
  grid-template:
    "header" 100px
    "filtros" 100px
    "totales" 360px
    "graficos" auto;

  @media ${Device.tablet} {
    grid-template:
      "header" 100px
      "filtros" 100px
      "totales" 140px
      "graficos" auto;
  }

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }

  .filtros {
    grid-area: filtros;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 10px;
  }

  .totales {
    grid-area: totales;
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr;

    @media ${Device.tablet} {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .graficos {
    grid-area: graficos;
    margin-top: 20px;
    overflow-x: auto;
    max-width: 100%;
  }
`;
