import React from "react";
import styled, { keyframes } from "styled-components";
import { BtnForm, v, useAuthStore } from "../../index";

export const LoginTemplate: React.FC = () => {
  const { signInWithGoogle }: { signInWithGoogle: () => void } = useAuthStore();

  return (
    <Container $imgfondo={v.imagenfondo}>
      <Backdrop aria-hidden="true" />
      <ContentCard>
        <Eyebrow translate="no">CERDYN 1.0</Eyebrow>
        <BrandRow>
          <LogoWrap>
            <img src={v.logo} alt="Logo de Cerdyn" width="120" height="120" />
          </LogoWrap>
          <div>
            <Titulo translate="no">Cerdyn</Titulo>
            <Lead>Controlá ingresos, gastos y cuentas desde una sola vista.</Lead>
          </div>
        </BrandRow>

        <FeatureGrid aria-label="Beneficios principales">
          <FeatureCard>
            <strong>Panel Claro</strong>
            <span>Totales, movimientos y reportes listos para revisar rápido.</span>
          </FeatureCard>
          <FeatureCard>
            <strong>Datos Seguros</strong>
            <span>Autenticación con Google y sesión persistente protegida.</span>
          </FeatureCard>
          <FeatureCard>
            <strong>Multi-Cuenta</strong>
            <span>Separá efectivo, banco y otras cuentas sin perder contexto.</span>
          </FeatureCard>
        </FeatureGrid>

        <ActionArea>
          <BtnForm
            titulo="Continuar Con Google"
            icono={<v.iconogoogle />}
            bgcolor="linear-gradient(135deg, #f5c84c 0%, #ff8d57 100%)"
            funcion={signInWithGoogle}
          />
          <HelperText>Usá tu cuenta de Google para sincronizar tus datos con Supabase.</HelperText>
        </ActionArea>
      </ContentCard>
    </Container>
  );
};

interface ContainerProps {
  $imgfondo: string;
}

const float = keyframes`
  from {
    transform: translateY(-6px);
  }
  to {
    transform: translateY(8px);
  }
`;

const Container = styled.main<ContainerProps>`
  position: relative;
  min-height: 100vh;
  padding: 32px 18px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at top left, rgba(255, 188, 92, 0.3), transparent 32%),
    linear-gradient(135deg, rgba(13, 24, 38, 0.82), rgba(20, 44, 65, 0.74)),
    url(${(props) => props.$imgfondo}) center/cover no-repeat;
  color: #fff7ea;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  backdrop-filter: blur(8px);
`;

const ContentCard = styled.section`
  position: relative;
  z-index: 1;
  width: min(920px, 100%);
  padding: clamp(24px, 4vw, 40px);
  border-radius: 32px;
  background:
    linear-gradient(145deg, rgba(11, 18, 30, 0.92), rgba(26, 44, 61, 0.86));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28);
  display: grid;
  gap: 28px;
`;

const Eyebrow = styled.span`
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  color: rgba(255, 222, 173, 0.78);
`;

const BrandRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 140px) minmax(0, 1fr);
  gap: 24px;
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const LogoWrap = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: grid;
  place-items: center;
  border-radius: 28px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);

  img {
    width: 72%;
    height: auto;
    animation: ${float} 1.8s ease-in-out infinite alternate;
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      animation: none;
    }
  }
`;

const Titulo = styled.h1`
  margin: 0 0 10px;
  font-size: clamp(3rem, 8vw, 5rem);
  line-height: 0.95;
  text-wrap: balance;
`;

const Lead = styled.p`
  max-width: 32rem;
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.15rem);
  color: rgba(245, 240, 232, 0.82);
  text-wrap: pretty;

  @media (max-width: 720px) {
    margin: 0 auto;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.article`
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.09);
  display: grid;
  gap: 8px;

  strong {
    font-size: 1rem;
  }

  span {
    color: rgba(250, 245, 239, 0.72);
    font-size: 0.95rem;
  }
`;

const ActionArea = styled.div`
  display: grid;
  gap: 14px;
  justify-items: start;

  @media (max-width: 720px) {
    justify-items: stretch;
  }
`;

const HelperText = styled.p`
  margin: 0;
  color: rgba(250, 245, 239, 0.72);
  font-size: 0.95rem;
`;
