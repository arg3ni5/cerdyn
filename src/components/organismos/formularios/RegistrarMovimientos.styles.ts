import styled from "styled-components";

export const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 100;
  color: black;

  .sub-contenedor {
    width: 500px;
    max-width: 85%;
    max-height: min(92vh, 780px);
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;
    color: ${({ theme }) => theme.text};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    label {
      font-weight: 550;
    }
    .encabezado {
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      align-items: center;
      margin-bottom: 20px;
      h1 {
        font-size: 30px;
        font-weight: 700;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .formulario {
      display: flex;
      flex-direction: column;
      min-height: 0;
      .contentBtnsave {
        padding-top: 10px;
        display: flex;
        justify-content: center;
      }
      section {
        padding-top: 5px;
        gap: 20px;
        display: flex;
        flex-direction: column;
        .colorContainer {
          .colorPickerContent {
            padding-top: 15px;
            min-height: 50px;
          }
        }
      }
    }

    @media (max-width: 500px) {
      max-width: 92%;
      max-height: 92dvh;
      padding: 12px 20px !important;

      .formulario {
        section {
          overflow-y: auto;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }
      }

      input {
        padding: 8px !important;
        font-size: 15px;
      }

      label {
        font-size: 14px;
      }
    }

  }
  @keyframes scale-up-bottom {
    0% {
      transform: scale(0.5);
      transform-origin: center bottom;
    }
    100% {
      transform: scale(1);
      transform-origin: center bottom;
    }
  }
`;

export const WrapperPagoFecha = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  flex-wrap: nowrap;

  > div {
    flex: 1;
    min-width: 0; // evita que el contenido fuerce wrapping
  }

  @media (max-width: 500px) {
    flex-direction: column;
    flex-wrap: wrap;
  }
`;
export const ContainerMonto = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  label {
    margin-bottom: 5px;
    font-weight: 550;
  }

  @media (max-width: 500px) {
    width: 100%;
  }
`;



export const ContainerFuepagado = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
  min-width: 205px;
`;

export const ContenedorDropdown = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  gap: 10px;
  flex-direction: row;
  align-items: center;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
  }

  label {
    white-space: nowrap;
  }

  > *:not(label) {
    flex: 1;
    width: 100%;
  }
`;

export const ContainerFecha = styled.div`
  display: flex;
  flex: 1;
  gap: 10px;
  align-items: center;
  min-width: 205px;
  input {
    appearance: none;
    color: ${({ theme }) => theme.text};
    font-family: “Helvetica”, arial, sans-serif;
    font-size: 17px;
    border: none;
    background: ${({ theme }) => theme.bgtotal};
    padding: 4px;
    display: inline-block;
    visibility: visible;
    width: 140px;
    cursor: pointer;
    &:focus {
      border-radius: 10px;

      outline: 0;
      /* box-shadow: 0 0 5px 0.4rem rgba(252, 252, 252, 0.25); */
    }
  }
`;

export const ContenedorBotones = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const StickyFooter = styled.div`
  margin-top: 20px;
  position: sticky;
  bottom: 0;
  background: ${({ theme }) => theme.bgtotal};
  padding: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  position: relative;
`;

export const ContainerRecurrencia = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.text}33;
  padding-top: 10px;
`;

export const FilaRecurrencia = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const AccionesRecurrencia = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 500px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

export const ContainerRecurrenciaOpciones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  padding: 6px 14px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;
  white-space: nowrap;
`;

export const BtnToggleRecurrencia = styled(BtnPreview)`
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.text}44;
`;

export const ContainerPreview = styled.div`
  background: ${({ theme }) => theme.bgtotal};
  border: 1px solid ${({ theme }) => theme.text}33;
  border-radius: 8px;
  padding: 8px 12px;
  max-height: 150px;
  overflow-y: auto;

  label {
    font-size: 13px;
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  li {
    background: #e14e1922;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 13px;
  }
`;

export const MensualHint = styled.small`
  color: ${({ theme }) => theme.text}99;
  font-size: 12px;
  display: block;
`;
