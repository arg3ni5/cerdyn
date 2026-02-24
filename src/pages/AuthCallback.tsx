import { useEffect } from "react";
import styled from "styled-components";
import { supabase } from "../index";
import { useNavigate } from "react-router-dom";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      // hash example: "#/auth/callback?code=XYZ"
      const hash = window.location.hash || "";
      const qs = hash.includes("?") ? hash.split("?")[1] : "";
      const code = new URLSearchParams(qs).get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          navigate("/login", { replace: true });
          return;
        }
        navigate("/", { replace: true });
        return;
      }

      // fallback
      const { data } = await supabase.auth.getSession();
      navigate(data.session ? "/" : "/login", { replace: true });
    };

    run();
  }, [navigate]);

  return (
    <Container>
      <Content>
        <SpinnerLoader />
        <Title>Autenticando tu cuenta</Title>
        <Subtitle>Por favor espera un momento...</Subtitle>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 40px;
  background: ${({ theme }) => theme.bg};
  border-radius: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;

  @media (max-width: 576px) {
    border-radius: 20px;
    gap: 20px;
    padding: 30px 20px;
  }
`;

const Title = styled.h1`
  font-size: 1.5em;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.text};
  letter-spacing: 0.5px;

  @media (max-width: 576px) {
    font-size: 1.25em;
  }
`;

const Subtitle = styled.p`
  font-size: 1em;
  color: ${({ theme }) => theme.text}99;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.3px;

  @media (max-width: 576px) {
    font-size: 0.9em;
  }
`;