import styled from "styled-components";
import { CSSProperties } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface InputTextProps {
  style?: CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string | number;
  placeholder?: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  type?: string;
  name?: string;
  minLength?: number;
  label?: string;
  variant?: "line" | "surface";
}

export function InputText({
  style,
  onChange,
  defaultValue,
  placeholder,
  register,
  errors,
  minLength,
  type = "text",
  name = "descripcion",
  label,
  variant = "line",
}: InputTextProps) {
  return (
    <Container $variant={variant}>
      {label && <Label>{label}</Label>}
      <input
        style={style}
        // Remove onChange prop since it will be handled by register
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        {...register(name, { required: true, minLength })}
      />

      {errors[name]?.type === "required" && (
        <p>Campo requerido</p>
      )}
      {errors[name]?.type === "minLength" && (
        <p>Debe tener al menos 2 caracteres</p>
      )}
    </Container>
  );
}

const Container = styled.div<{ $variant: "line" | "surface" }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  input {
    background: ${({ theme, $variant }) => $variant === "surface" ? "transparent" : theme.bgtotal};
    border: ${({ $variant }) => $variant === "surface" ? "1px solid rgba(156, 163, 175, 0.2)" : "none"};
    border-bottom: ${({ $variant }) => $variant === "surface" ? "1px solid rgba(156, 163, 175, 0.2)" : "solid 1px grey"};
    border-radius: ${({ $variant }) => $variant === "surface" ? "16px" : "0"};
    box-sizing: border-box;
    font-size: ${({ $variant }) => $variant === "surface" ? "17px" : "16px"};
    font-weight: ${({ $variant }) => $variant === "surface" ? "700" : "400"};
    padding: ${({ $variant }) => $variant === "surface" ? "18px 22px" : "10px 10px 10px 5px"};
    display: block;
    width: 100%;
    color: ${({ theme }) => theme.text};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    &:focus {
      border-color: ${({ $variant }) => $variant === "surface" ? "#e14e19" : "transparent"};
      border-bottom-color: ${({ $variant }) => $variant === "surface" ? "#e14e19" : "transparent"};
      box-shadow: ${({ $variant }) => $variant === "surface" ? "0 0 0 3px rgba(225, 78, 25, 0.08)" : "none"};
    }
    &::placeholder {
      color: #9ca3af;
      font-weight: ${({ $variant }) => $variant === "surface" ? "600" : "400"};
    }
  }
  p {
    color: #ff6d00;
    font-size: 12px;
  }
`;

const Label = styled.label`
  font-size: 0.9em;
  color: ${({ theme }) => theme.text};
`;
