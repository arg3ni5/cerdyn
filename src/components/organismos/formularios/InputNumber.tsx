import { CSSProperties, JSX, ReactNode } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import styled from "styled-components";

interface InputNumberProps {
  style?: CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: number;
  placeholder?: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  icono?: ReactNode;
}

export const InputNumber = ({
  style,
  onChange,
  defaultValue,
  placeholder,
  register,
  errors,
  icono
}: InputNumberProps): JSX.Element => {
  const montoRegister = register("monto", {
    required: true,
    valueAsNumber: true,
    validate: (value) => !isNaN(value) || "Please enter a valid number"
  });

  return (
    <Container>
      <ContainerTextoicono>
        <span>{icono || "₡"}</span>
        <input
          step="0.01"
          inputMode="decimal"
          style={style}
          type="number"
          defaultValue={defaultValue}
          placeholder={placeholder}
          {...montoRegister}
          onChange={(e) => {
            montoRegister.onChange(e);
            onChange?.(e);
          }}
        />
      </ContainerTextoicono>

      {errors.monto?.type === "required" && (
        <p>Campo requerido</p>
      )}
      {errors.monto?.type === "Number" && (
        <p>Ingrese un número valido</p>
      )}
    </Container>
  );
};
const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;

  input {
    background-color: transparent;
    border: 1px solid rgba(156, 163, 175, 0.2);
    border-radius: 16px;
    box-sizing: border-box;
    color: ${({ theme }) => theme.text};
    font-size: 24px;
    font-weight: 900;
    outline: none;
    padding: 16px 24px 16px 48px;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;

    &:focus {
      border-color: #e14e19;
      box-shadow: 0 0 0 3px rgba(225, 78, 25, 0.08);
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  p {
    color: #ff6d00;
    font-size: 12px;
    margin-top: 4px;
  }
`;


const ContainerTextoicono = styled.div`
  position: relative;

  span {
    position: absolute;
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    pointer-events: none;
    z-index: 1;
  }
`;
