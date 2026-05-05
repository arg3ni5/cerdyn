import styled from "styled-components";
import {v} from "../../index"
import { JSX } from "react";
interface SelectorProps {
  color: string;
  state?: boolean;
  funcion: () => void;
  texto1?: string | null | undefined;
  texto2?: string | null | undefined;
}

export const Selector = ({ 
  color, 
  state, 
  funcion, 
  texto1, 
  texto2 
}: SelectorProps): JSX.Element => {
  return (
    <Container color={color} onClick={funcion}>
      <div>
        <span>{texto1}</span>
        <span>{texto2}</span>
      </div>
      <span className={state ? "open" : "close"}>{<v.iconoFlechabajo/>}</span>
    </Container>
  );
};
interface ContainerProps {
  color: string;
}

const Container = styled.div<ContainerProps>`
 display: flex;
 justify-content:space-between;
 align-items: center;
 height: 100%;
 cursor: pointer;
 border: 2px solid ${(props) => props.color};
 border-radius: 10px;
 padding: 8px 10px;
 gap: 8px;
 transition: 0.3s;
 font-weight: 600;

 box-shadow: 4px 9px 20px -12px ${(props) => props.color};
 .open{
    transition: 0.3s;
    transform: rotate(0deg);
 }
 .close{
    transition: 0.3s;
    transform: rotate(180deg);
 }
 &:hover {
    background-color: ${(props) => props.color};
    color: #000;
  }

`;
