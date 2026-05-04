import styled from "styled-components";

interface AccionTablaProps {
  funcion: () => void;
  icono: React.ReactNode;
  color: string;
  fontSize: string;
  label?: string;
}

export function AccionTabla({ funcion, icono, color, fontSize, label }: AccionTablaProps) {
  return (
    <Container
      type="button"
      onClick={funcion}
      color={color}
      fontSize={fontSize}
      aria-label={label}
      title={label}
    >
      {icono}
      {label && <span>{label}</span>}
    </Container>
  );
}

const Container = styled.button<{ color: string; fontSize: string }>`
  align-items: center;
  background: transparent;
  border: 0;
  color: ${(props) => props.color};
  cursor: pointer;
  display: inline-flex;
  font-size: ${(props) => props.fontSize};
  justify-content: center;
  padding: 4px;

  span {
    display: none;
  }
`;
