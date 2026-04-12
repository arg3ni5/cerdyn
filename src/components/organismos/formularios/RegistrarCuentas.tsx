import { useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Spinner,
  BtnForm,
  useUsuariosStore,
  useCuentaStore,
  useOperaciones,
  CuentaUpdate,
  CuentaInsert,
  Accion,
  InputTextNumber, // Assuming this component exists or will be created for number inputs
} from "../../../index";
import { useForm } from "react-hook-form";
import Emojipicker, { EmojiClickData } from "emoji-picker-react";

interface RegistrarCuentasProps {
  onClose: () => void;
  dataSelect: CuentaInsert | CuentaUpdate;
  accion: Accion;
}

export const RegistrarCuentas = ({ onClose, dataSelect, accion }: RegistrarCuentasProps) => {
  const { insertarCuenta, actualizarCuenta } = useCuentaStore();
  const { usuario } = useUsuariosStore();
  const { selectTipoCuenta } = useOperaciones();
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [emojiselect, setEmojiselect] = useState<string>("💰"); // Default icon for accounts
  const [estadoProceso, setEstadoproceso] = useState<boolean>(false);

  function onEmojiClick(emojiObject: EmojiClickData): void {
    setEmojiselect(() => emojiObject.emoji);
    setShowPicker(false);
  }

  interface FormInputs {
    descripcion: string;
    saldo_actual: number; // Changed from 'saldo' to 'saldo_actual' to match Cuenta type
    icono: string;
    idusuario?: number;
    id?: number;
  }

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue, // Added setValue to prefill form
  } = useForm<FormInputs>();

  const submitForm = async (formData: FormInputs): Promise<void> => {
    if (usuario?.id == undefined) {
      return;
    }

    const baseData = {
      descripcion: formData.descripcion,
      saldo_actual: Number(formData.saldo_actual), // Ensure saldo_actual is a number
      icono: emojiselect,
      tipo: accion === "Editar" && "tipo" in dataSelect && dataSelect.tipo 
        ? dataSelect.tipo 
        : selectTipoCuenta.tipo,
      idusuario: usuario.id,
    };

    setEstadoproceso(true);
    try {
      if (accion === "Editar" && dataSelect.id) {
        const updateData: CuentaUpdate = {
          ...baseData,
          id: dataSelect.id,
        };
        await actualizarCuenta(dataSelect.id, updateData);
      } else {
        await insertarCuenta(baseData);
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar la cuenta:", error);
      // Potentially show an error message to the user
    } finally {
      setEstadoproceso(false);
    }
  };

  useEffect(() => {
    if (accion === "Editar") {
      setValue("descripcion", dataSelect.descripcion || "");
      setValue("saldo_actual", (dataSelect as CuentaUpdate).saldo_actual || 0);
      setEmojiselect(dataSelect.icono || "💰");
    }
  }, [accion, dataSelect, setValue]);

  return (
    <Container role="dialog" aria-modal="true" aria-label="Formulario de cuenta">
      {estadoProceso && <Spinner />}

      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>
              {accion == "Editar"
                ? "Editar cuenta"
                : "Registrar nueva cuenta"}
            </h1>
          </section>

          <section>
            <button type="button" onClick={onClose} aria-label="Cerrar formulario de cuenta">x</button>
          </section>
        </div>

        <form className="formulario" onSubmit={handleSubmit(submitForm)}>
          <section>
            <div>
              <InputText
                label="Descripción"
                defaultValue={dataSelect.descripcion || ""}
                name="descripcion"
                register={register}
                placeholder="Descripción de la cuenta"
                errors={errors}
                style={{ textTransform: "capitalize" }}
              />
            </div>
            <div>
              {/* Assuming InputTextNumber is a component similar to InputText but for numbers */}
              <InputTextNumber
                label="Saldo actual"
                name="saldo_actual"
                defaultValue={(dataSelect as CuentaUpdate).saldo_actual || 0}
                register={register}
                placeholder="0.00"
                errors={errors}
              />
            </div>
            <div>
              <ContentTitle>
                <input
                  readOnly={true}
                  value={emojiselect}
                  type="text"
                  onClick={() => setShowPicker(!showPicker)}
                ></input>
                <span>Icono</span>
              </ContentTitle>
              {showPicker && (
                <ContainerEmojiPicker>
                  <Emojipicker onEmojiClick={onEmojiClick} />
                </ContainerEmojiPicker>
              )}
            </div>
            <div className="btnguardarContent">
              <BtnForm
                type="submit"
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor="linear-gradient(135deg, #ffd667 0%, #ff9558 100%)"
              />
            </div>
          </section>
        </form>
      </div>
    </Container>
  );
}
const Container = styled.div`
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .sub-contenedor {
    width: 500px;
    max-width: 85%;
    border-radius: 28px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.3);
    padding: 20px 36px 24px 36px;
    z-index: 100;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 24px;
        font-weight: 700;
        margin: 0;
      }
      button {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 999px;
        background: ${({ theme }) => theme.bg3};
        color: ${({ theme }) => theme.text};
        font-size: 20px;
        cursor: pointer;
      }
    }
    .formulario {
      section {
        gap: 20px;
        display: flex;
        flex-direction: column;
      }
    }
  }
`;

const ContentTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  margin-top: 10px; // Added some margin for spacing
  svg {
    font-size: 25px;
  }
  input {
    border: none;
    outline: none;
    background: ${({ theme }) => theme.bg3};
    border-radius: 12px;
    padding: 8px;
    width: 40px;
    font-size: 28px;
    cursor: pointer;
  }
  span {
    font-size: 1em; // Adjusted for consistency
    color: ${({ theme }) => theme.text}; // Use theme color
  }
`;
const ContainerEmojiPicker = styled.div`
  position: absolute; // Changed to absolute to overlay correctly
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0; // Ensure it covers the whole screen or is positioned appropriately
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5); // Added a backdrop for better focus
  z-index: 1001; // Ensure it's above the modal content
`;

// Make sure to export RegistrarCuentas from src/index.ts or wherever components are aggregated.
// Also, ensure InputTextNumber is either an existing component or created.
// If InputTextNumber does not exist, it can be a copy of InputText, but with type="number".
// For example, a simple InputTextNumber could be:
/*
import { UseFormRegister, FieldErrors } from "react-hook-form";
import styled from "styled-components";

interface InputTextNumberProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  placeholder?: string;
  defaultValue?: number;
}

export const InputTextNumber = ({ label, name, register, errors, placeholder, defaultValue }: InputTextNumberProps) => (
  <InputContainer>
    <LabelText>{label}</LabelText>
    <StyledInput
      type="number"
      step="0.01" // For currency or precise numbers
      defaultValue={defaultValue}
      placeholder={placeholder}
      {...register(name, { required: `${label} es requerido`, valueAsNumber: true })}
    />
    {errors[name] && <ErrorMessage>{errors[name]?.message?.toString()}</ErrorMessage>}
  </InputContainer>
);

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const LabelText = styled.label`
  font-size: 0.9em;
  color: ${({ theme }) => theme.text};
`;

const StyledInput = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.text}; // Use theme color for border
  background-color: ${({ theme }) => theme.bg}; // Use theme background
  color: ${({ theme }) => theme.text};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary}; // Use a primary color for focus
  }
`;

const ErrorMessage = styled.span`
  color: red;
  font-size: 0.8em;
`;
*/

// Add the following to src/index.ts:
// export * from "./components/organismos/formularios/RegistrarCuentas";

// And if InputTextNumber was created as part of this subtask and is not already exported:
// export * from "./components/atomos/InputTextNumber"; // Assuming it's placed in atomos
// Or adjust the path according to where InputTextNumber is created/located.
// For this subtask, I will assume InputTextNumber is already available or will be handled separately.
// The primary goal is the RegistrarCuentas.tsx component.