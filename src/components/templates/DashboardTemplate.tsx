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

  const balanceEsPositivo = Number(totalMesAñoPagados || 0) >= 0;

  return (
    <Container>
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Dashboard</span>
          <h1>Tu panorama financiero del mes</h1>
          <p>
            Revisá ingresos, gastos y balance pagado desde una vista más clara antes de entrar al
            detalle en los gráficos.
          </p>
        </div>

        <div className="hero-side-card">
          <span>Estado mensual</span>
          <strong>{balanceEsPositivo ? "Saludable" : "En Revisión"}</strong>
          <small>
            {balanceEsPositivo
              ? "Tus ingresos pagados cubren el gasto del período."
              : "Tus gastos pagados superan el ingreso del período."}
          </small>
        </div>
      </section>

      <section className="filtros">
        <FilterShell>
          <CalendarioLineal />
        </FilterShell>
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
  gap: 22px;
  grid-template:
    "header" 100px
    "hero" auto
    "filtros" auto
    "totales" auto
    "graficos" auto;

  @media ${Device.tablet} {
    grid-template:
      "header" 100px
      "hero" auto
      "filtros" auto
      "totales" auto
      "graficos" auto;
  }

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }

  .hero {
    grid-area: hero;
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.8fr);
    gap: 18px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .hero-copy {
    h1 {
      margin: 8px 0 10px;
      font-size: clamp(2.1rem, 5vw, 3.4rem);
      line-height: 0.94;
      text-wrap: balance;
    }

    p {
      max-width: 44rem;
      margin: 0;
      color: ${({ theme }) => theme.colorSubtitle};
      font-size: 1rem;
      text-wrap: pretty;
    }
  }

  .eyebrow {
    display: inline-block;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.primary};
  }

  .hero-side-card {
    padding: 24px;
    border-radius: 28px;
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(198, 228, 255, 0.8));
    color: #172335;
    display: grid;
    align-content: start;
    gap: 8px;
    box-shadow: 0 20px 40px rgba(45, 98, 166, 0.12);

    span {
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #47627f;
    }

    strong {
      font-size: 2.2rem;
      line-height: 1;
    }

    small {
      color: #47627f;
      font-size: 0.98rem;
    }
  }

  .filtros {
    grid-area: filtros;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .totales {
    grid-area: totales;
    display: grid;
    gap: 14px;
    grid-template-columns: 1fr;

    @media ${Device.tablet} {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .graficos {
    grid-area: graficos;
    overflow-x: auto;
    max-width: 100%;
  }
`;

const FilterShell = styled.div`
  width: 100%;
  border-radius: 28px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  padding: 8px 10px;
`;
