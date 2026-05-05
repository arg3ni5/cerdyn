import styled from "styled-components";
import { HashLoader } from "react-spinners";
export function SpinnerLoader() {
  return (
    <Container>
      <HashLoader color="#7f3ceb" size={200} />
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  inset: 0;
  width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  z-index: 9999;
  background: ${({ theme }) => theme.bgtotal};
  transition: opacity 0.3s ease;
`;
