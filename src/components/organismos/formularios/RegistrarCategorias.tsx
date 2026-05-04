import { useEffect, useState } from "react";
import { v } from "../../../styles/variables";
import {
  BtnForm,
  useUsuariosStore,
  useCategoriasStore,
  useOperaciones,
  CategoriaUpdate,
  CategoriaInsert,
  Accion,
  InputText,
  Spinner,
} from "../../../index";
import { useForm } from "react-hook-form";
import { CirclePicker, ColorResult } from "react-color";
import Emojipicker, { EmojiClickData } from "emoji-picker-react";
import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Container, CloseButton, ContenedorBotones, StickyFooter } from "./RegistrarMovimientos.styles";
import styled from "styled-components";

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
    <AnimatePresence>
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Formulario de categoría"
      >
        {estadoProceso && <Spinner />}

        <div className="sub-contenedor">
          <div className="encabezado">
            <h1>
              {accion === "Editar" ? "Editar categoría" : "Nueva categoría"}
            </h1>
          </div>

          <CloseButton type="button" onClick={onClose} aria-label="Cerrar formulario de categoría">
            <X size={18} />
          </CloseButton>

          <form className="formulario" onSubmit={handleSubmit(insertar)}>
            <section>
              <div>
                <InputText
                  label="Descripción"
                  defaultValue={dataSelect.descripcion || ""}
                  register={register}
                  placeholder="Descripción de la categoría"
                  errors={errors}
                  style={{ textTransform: "capitalize" }}
                />
              </div>

              <ColorSection>
                <label>Color</label>
                <div className="picker-row">
                  <ColorDot color={currentColor} />
                  <CirclePicker onChange={elegirColor} color={currentColor} />
                </div>
              </ColorSection>

              <EmojiSection>
                <label>Ícono</label>
                <EmojiTrigger
                  type="button"
                  onClick={() => setShowPicker(!showPicker)}
                  aria-label="Seleccionar ícono"
                >
                  <span>{emojiselect}</span>
                  <span className="hint">Toca para cambiar</span>
                </EmojiTrigger>
                {showPicker && (
                  <EmojiOverlay onClick={() => setShowPicker(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Emojipicker onEmojiClick={onEmojiClick} />
                    </div>
                  </EmojiOverlay>
                )}
              </EmojiSection>
            </section>

            <ContenedorBotones>
              <StickyFooter>
                <BtnForm
                  type="submit"
                  icono={<v.iconoguardar />}
                  titulo="Guardar"
                  bgcolor="linear-gradient(135deg, #ffd667 0%, #ff9558 100%)"
                />
              </StickyFooter>
            </ContenedorBotones>
          </form>
        </div>
      </Container>
    </AnimatePresence>
  );
}

const ColorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding-left: 4px;
  }

  .picker-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
`;

interface ColorDotProps {
  color: string;
}

const ColorDot = styled.div<ColorDotProps>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`;

const EmojiSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;

  label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding-left: 4px;
  }
`;

const EmojiTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid rgba(156, 163, 175, 0.2);
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  transition: border-color 0.2s;
  width: fit-content;

  span:first-child {
    font-size: 28px;
    line-height: 1;
  }

  .hint {
    font-size: 13px;
    color: ${({ theme }) => theme.colorSubtitle};
  }

  &:hover {
    border-color: #e14e19;
  }
`;

const EmojiOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

