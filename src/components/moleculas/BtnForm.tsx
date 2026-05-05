import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

interface BtnFormProps {
  funcion?: () => void;
  className?: string;
  titulo: string;
  bgcolor: string;
  icono?: React.ReactNode;
  url?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const BtnForm: React.FC<BtnFormProps> = ({
  funcion,
  className,
  titulo,
  bgcolor,
  icono,
  url,
  type = "button",
  disabled = false,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (type === "submit") return; // permite que el formulario maneje el submit

    e.preventDefault(); // evita que se dispare el submit por accidente

    if (url) {
      navigate(url);
    } else if (funcion) {
      funcion();
    }
  };

  return (
    <Container type={type} $bgcolor={bgcolor} onClick={handleClick} disabled={disabled}>
      <div className={className || "btn"}><span className="icon">{icono}</span> <span>{titulo}</span></div>
    </Container>
  );
};

interface StyledButtonProps {
  $bgcolor: string;
}

const Container = styled.button<StyledButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  border: none;
  gap: 10px;
  background-color: initial;
  z-index: 2;
  cursor: pointer;
  touch-action: manipulation;

  .btn {
    background: ${(props) => props.$bgcolor};
    padding: 0.6em 1.3em;
    font-weight: 900;
    font-size: 18px;
    border: 3px solid black;
    border-radius: 0.4em;
    box-shadow: 0.1em 0.1em #000;
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    color: #000;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 10px;

    .icon {
      position: relative;
      top : 0.1em;
    }

    a {
      text-decoration: none;
      color: #000;
    }

    .spin {
      animation: spin 1s linear infinite;
    }
  }

  &:not(:disabled) .btn:hover {
      transform: translate(-0.05em, -0.05em);
      box-shadow: 0.15em 0.15em #000;
      filter: brightness(1.03);
  }

  &:not(:disabled) .btn:active {
      transform: translate(0.05em, 0.05em);
      box-shadow: 0.05em 0.05em #000;
  }

  &:focus-visible .btn {
    box-shadow: 0 0 0 4px rgba(52, 131, 235, 0.25), 0.1em 0.1em #000;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:disabled .btn {
    opacity: 0.72;
    filter: grayscale(0.15);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
