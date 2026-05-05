import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { useOperaciones } from "../../index";

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = "Guardando..." }: SpinnerProps) {
  const { colorCategoria } = useOperaciones();
  return (
    <Container role="status" aria-live="polite" aria-label={label}>
      <ClimbingBoxLoader color={colorCategoria} size={18} />
      <span>{label}</span>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
  position: absolute;
  inset: 0;
  z-index: 30;
  background: ${({ theme }) => theme.bgtotal}e6;
  backdrop-filter: blur(2px);
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: opacity 0.3s ease;
`;
