import styled from "styled-components";
import { motion } from "motion/react";

export const Container = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 24px;
  }

  .sub-contenedor {
    background: ${({ theme }) => theme.bgtotal};
    width: 100%;
    max-width: 500px;
    border-radius: 32px 32px 0 0;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    color: ${({ theme }) => theme.text || '#1f2937'};
    overflow: hidden;

    @media (min-width: 640px) {
      border-radius: 40px;
      height: auto;
    }

    .encabezado {
      padding: 24px 24px 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0;
      padding-right: 76px;

      @media (min-width: 640px) {
        padding: 40px 40px 0;
        padding-right: 96px;
      }

      .encabezado-contenido {
        display: flex;
        flex-direction: column;
        gap: 14px;
        width: 100%;
        min-width: 0;
      }

      h1 {
        font-size: 24px;
        font-weight: 900;
        text-transform: uppercase;
        line-height: 1.2;
        margin: 0;

        @media (min-width: 640px) {
          font-size: 30px;
        }
      }

      .selector-tipo-movimiento {
        max-width: 100%;
      }
    }

    .formulario {
      display: flex;
      flex-direction: column;
      min-height: 0;
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;

      section {
        padding: 24px;
        gap: 24px;
        display: flex;
        flex-direction: column;

        @media (min-width: 640px) {
          padding: 32px 40px;
        }
      }
    }

    label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
      padding-left: 4px;
    }
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s;

  &:hover {
    color: #e14e19;
    background-color: rgba(225, 78, 25, 0.05);
  }

  @media (min-width: 640px) {
    top: 40px;
    right: 40px;
  }
`;

export const WrapperPagoFecha = styled.div`
  display: flex;
  gap: 24px;
  width: 100%;
  flex-wrap: nowrap;

  > div {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const ContainerMonto = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const ContainerDescripcion = styled(ContainerMonto)`
  gap: 8px;

  label {
    margin-bottom: 0;
  }
`;

export const ContainerFuepagado = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;

  label {
    margin-bottom: 0;
  }

  .pago-control {
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(156, 163, 175, 0.2);
    border-radius: 12px;
    padding: 4px 6px 4px 14px;
  }

  .pago-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f97316;
    flex: 0 0 auto;
  }

  .pago-text {
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    font-weight: 800;
    line-height: 1;
    min-width: 72px;
  }

  .MuiSwitch-root {
    margin-left: auto;
  }
`;

export const ContenedorDropdown = styled.div<{ $active?: boolean }>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    margin-bottom: 0;
  }
`;

export const ContainerFecha = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  input {
    appearance: none;
    color: ${({ theme }) => theme.text};
    font-family: “Helvetica”, arial, sans-serif;
    font-size: 16px;
    border: 1px solid rgba(156, 163, 175, 0.2);
    background: ${({ theme }) => theme.bgtotal};
    padding: 10px 12px;
    border-radius: 8px;
    display: block;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #e14e19;
      box-shadow: 0 0 0 3px rgba(225, 78, 25, 0.1);
    }
  }
`;

export const ContenedorBotones = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 24px;
  border-top: 1px solid rgba(156, 163, 175, 0.1);
  background: ${({ theme }) => theme.bgtotal};
  margin-top: auto;

  @media (min-width: 640px) {
    padding: 24px 40px;
  }
`;

export const StickyFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
`;

export const ContainerRecurrencia = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid rgba(156, 163, 175, 0.1);
  padding-top: 16px;
`;

export const FilaRecurrencia = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const AccionesRecurrencia = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

export const ContainerRecurrenciaOpciones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FilaCamposRecurrencia = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;

  > * {
    flex: 1;
    min-width: 0;
  }
`;

export const BtnPreview = styled.button`
  background: #e14e19;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  align-self: flex-start;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: #d13f0f;
    transform: translateY(-1px);
  }
`;

export const BtnToggleRecurrencia = styled(BtnPreview)`
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 1px solid rgba(156, 163, 175, 0.2);

  &:hover {
    background: rgba(225, 78, 25, 0.05);
    border-color: #e14e19;
    color: #e14e19;
    transform: none;
  }
`;

export const ContainerPreview = styled.div`
  background: rgba(225, 78, 25, 0.05);
  border: 1px solid rgba(225, 78, 25, 0.2);
  border-radius: 8px;
  padding: 12px;
  max-height: 150px;
  overflow-y: auto;

  label {
    font-size: 12px;
    font-weight: 600;
    display: block;
    margin-bottom: 8px;
    color: #e14e19;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  li {
    background: #e14e1922;
    border: 1px solid #e14e1944;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
  }
`;

export const MensualHint = styled.small`
  color: ${({ theme }) => theme.text}99;
  font-size: 11px;
  display: block;
  line-height: 1.4;
`;
