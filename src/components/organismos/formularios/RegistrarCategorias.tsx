import { useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Spinner,
  BtnForm,
  useUsuariosStore,
  useCategoriasStore,
  useOperaciones,
  CategoriaUpdate,
  CategoriaInsert,
  Accion
} from "../../../index";
import { useForm } from "react-hook-form";
import { CirclePicker, ColorResult } from "react-color";
import Emojipicker, { EmojiClickData } from "emoji-picker-react";

interface RegistrarCategoriasProps {
  onClose: () => void;
  dataSelect: CategoriaInsert | CategoriaUpdate;
  accion: Accion;
}

export const RegistrarCategorias = ({ onClose, dataSelect, accion }: RegistrarCategoriasProps) => {
  const { insertarCategorias, editarCategoria } = useCategoriasStore();
  const { usuario } = useUsuariosStore();
  const { selectTipoCategoria } = useOperaciones();
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [emojiselect, setEmojiselect] = useState<string>("😻");
  const [currentColor, setColor] = useState<string>("#F44336");
  const [estadoProceso, setEstadoproceso] = useState<boolean>(false);

  function onEmojiClick(emojiObject: EmojiClickData): void {
    setEmojiselect(() => emojiObject.emoji);
    setShowPicker(false);
  }

  function elegirColor(color: ColorResult): void {
    setColor(color.hex);
  }

  interface FormInputs {
    descripcion: string;
    color: string;
    icono: string;
    idusuario?: number;
    tipo?: string;
    id?: number;
  }

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormInputs>();
  const insertar = async (formData: FormInputs): Promise<void> => {
    if (usuario?.id == undefined) {
      return;
    }

    const baseData = {
      descripcion: formData.descripcion,
      tipo: (accion === "Editar" ? dataSelect.tipo : selectTipoCategoria.tipo),
      color: currentColor,
      icono: emojiselect,
      idusuario: usuario.id,
    };

    if (accion === "Editar" && dataSelect.id) {
      const updateData: CategoriaUpdate = {
        ...baseData,
        id: dataSelect.id,
      };

      try {
        setEstadoproceso(true);
        await editarCategoria(updateData);
        setEstadoproceso(false);
        onClose();
      } catch (error) {
        setEstadoproceso(false);
      }
    } else {
      try {
        setEstadoproceso(true);
        await insertarCategorias(baseData);
        setEstadoproceso(false);
        onClose();
      } catch (error) {
        setEstadoproceso(false);
      }
    }
  };

  useEffect(() => {
    if (accion === "Editar") {
      setEmojiselect(dataSelect.icono || "😻");
      setColor(dataSelect.color || '#F44336');
    }
  }, [accion, dataSelect.color, dataSelect.icono]);

  return (
    <Container role="dialog" aria-modal="true" aria-label="Formulario de categoría">
      {estadoProceso && <Spinner />}

      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>
              {accion == "Editar"
                ? "Editar categoria"
                : "Registrar nueva categoria"}
            </h1>
          </section>

          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>

        <form className="formulario" onSubmit={handleSubmit(insertar)}>
          <section>
            <div>
              <InputText
                defaultValue={dataSelect.descripcion || ""}
                register={register}
                placeholder="Descripcion"
                errors={errors}
                style={{ textTransform: "capitalize" }}
              />
            </div>
            <div className="colorContainer">
              <ContentTitle>
                {<v.paletacolores />}
                <span>Color</span>
              </ContentTitle>
              <div className="colorPickerContent">
                <CirclePicker onChange={elegirColor} color={currentColor} />
              </div>
            </div>
            <div>
              <ContentTitle>
                <input
                  readOnly={true}
                  value={emojiselect}
                  type="text"
                  onClick={() => setShowPicker(!showPicker)}
                ></input>
                <span>icono</span>
              </ContentTitle>
              {showPicker && (
                <ContainerEmojiPicker>
                  <Emojipicker onEmojiClick={onEmojiClick} />
                </ContainerEmojiPicker>
              )}
            </div>
            <div className="btnguardarContent">
              <BtnForm
                // funcion={handleSubmit(insertar)}
                type="submit"
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor="#DAC1FF"
              />
            </div>
          </section>
        </form>
      </div>
    </Container>
  );
}
const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .sub-contenedor {
    width: 500px;
    max-width: 85%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 20px;
        font-weight: 500;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .formulario {
      section {
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
  }
`;

const ContentTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  svg {
    font-size: 25px;
  }
  input {
    border: none;
    outline: none;
    background: transparent;
    padding: 2px;
    width: 40px;
    font-size: 28px;
  }
`;
const ContainerEmojiPicker = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;
