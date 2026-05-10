import { useEffect, useState } from "react";
import styled from "styled-components";
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
  InputTextNumber,
} from "../../../index";
import { v } from "../../../styles/variables";
import { useForm } from "react-hook-form";
import Emojipicker, { EmojiClickData } from "emoji-picker-react";
import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Container, CloseButton, ContenedorBotones, StickyFooter } from "./RegistrarMovimientos.styles";

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
  const [emojiselect, setEmojiselect] = useState<string>("💰");
  const [estadoProceso, setEstadoproceso] = useState<boolean>(false);

  function onEmojiClick(emojiObject: EmojiClickData): void {
    setEmojiselect(() => emojiObject.emoji);
    setShowPicker(false);
  }

  interface FormInputs {
    descripcion: string;
    saldo_actual: number;
    limite_credito: number;
    dia_corte: number;
    dia_pago: number;
    tasa_interes: number;
    pago_minimo_config: number;
    icono: string;
    idusuario?: number;
    id?: number;
  }

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<FormInputs>();

  const tipoCuenta = accion === "Editar" && "tipo" in dataSelect && dataSelect.tipo
    ? dataSelect.tipo
    : selectTipoCuenta.tipo;
  const esTarjetaCredito = tipoCuenta === "c";

  const submitForm = async (formData: FormInputs): Promise<void> => {
    if (usuario?.id == undefined) {
      return;
    }

    const limiteCredito = Number(formData.limite_credito || 0);
    const saldoActual = esTarjetaCredito
      ? (accion === "Editar" ? Number(formData.saldo_actual || 0) : limiteCredito)
      : Number(formData.saldo_actual || 0);

    const baseData = {
      descripcion: formData.descripcion,
      saldo_actual: saldoActual,
      icono: emojiselect,
      tipo: tipoCuenta,
      subtipo: esTarjetaCredito ? "tarjeta_credito" : "debito",
      limite_credito: esTarjetaCredito ? limiteCredito : null,
      dia_corte: esTarjetaCredito ? Number(formData.dia_corte || 1) : null,
      dia_pago: esTarjetaCredito ? Number(formData.dia_pago || 1) : null,
      tasa_interes: esTarjetaCredito ? Number(formData.tasa_interes || 0) : null,
      pago_minimo_config: esTarjetaCredito ? Number(formData.pago_minimo_config || 0) : null,
      idusuario: usuario.id,
    };

    try {
      setEstadoproceso(true);
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
    } finally {
      setEstadoproceso(false);
    }
  };

  useEffect(() => {
    if (accion === "Editar") {
      setValue("descripcion", dataSelect.descripcion || "");
      setValue("saldo_actual", (dataSelect as CuentaUpdate).saldo_actual || 0);
      setValue("limite_credito", (dataSelect as CuentaUpdate).limite_credito || (dataSelect as CuentaUpdate).saldo_actual || 0);
      setValue("dia_corte", (dataSelect as CuentaUpdate).dia_corte || 1);
      setValue("dia_pago", (dataSelect as CuentaUpdate).dia_pago || 1);
      setValue("tasa_interes", (dataSelect as CuentaUpdate).tasa_interes || 0);
      setValue("pago_minimo_config", (dataSelect as CuentaUpdate).pago_minimo_config || 0);
      setEmojiselect(dataSelect.icono || "💰");
    }
  }, [accion, dataSelect, setValue]);

  return (
    <AnimatePresence>
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Formulario de cuenta"
      >
        <div className="sub-contenedor" aria-busy={estadoProceso}>
          {estadoProceso && <Spinner />}

          <div className="encabezado">
            <h1>
              {accion === "Editar" ? "Editar cuenta" : "Nueva cuenta"}
            </h1>
          </div>

          <CloseButton
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario de cuenta"
            disabled={estadoProceso}
          >
            <X size={18} />
          </CloseButton>

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
              {(!esTarjetaCredito || accion === "Editar") && (
                <div>
                  <InputTextNumber
                    label={esTarjetaCredito ? "Crédito disponible actual" : "Saldo actual"}
                    name="saldo_actual"
                    defaultValue={(dataSelect as CuentaUpdate).saldo_actual || 0}
                    register={register}
                    placeholder="0.00"
                    errors={errors}
                  />
                </div>
              )}

              {esTarjetaCredito && (
                <>
                  <div>
                    <InputTextNumber
                      label="Límite de crédito"
                      name="limite_credito"
                      defaultValue={(dataSelect as CuentaUpdate).limite_credito || (dataSelect as CuentaUpdate).saldo_actual || 0}
                      register={register}
                      placeholder="0.00"
                      errors={errors}
                    />
                  </div>

                  <CreditFieldsGrid>
                    <InputTextNumber
                      label="Día de corte"
                      name="dia_corte"
                      defaultValue={(dataSelect as CuentaUpdate).dia_corte || 1}
                      register={register}
                      placeholder="1"
                      errors={errors}
                    />
                    <InputTextNumber
                      label="Día de pago"
                      name="dia_pago"
                      defaultValue={(dataSelect as CuentaUpdate).dia_pago || 1}
                      register={register}
                      placeholder="1"
                      errors={errors}
                    />
                    <InputTextNumber
                      label="Tasa interés %"
                      name="tasa_interes"
                      defaultValue={(dataSelect as CuentaUpdate).tasa_interes || 0}
                      register={register}
                      placeholder="0"
                      errors={errors}
                    />
                    <InputTextNumber
                      label="Pago mínimo"
                      name="pago_minimo_config"
                      defaultValue={(dataSelect as CuentaUpdate).pago_minimo_config || 0}
                      register={register}
                      placeholder="0"
                      errors={errors}
                    />
                  </CreditFieldsGrid>
                </>
              )}

              <EmojiSection>
                <label>Ícono</label>
                <EmojiTrigger
                  type="button"
                  onClick={() => setShowPicker(!showPicker)}
                  aria-label="Seleccionar ícono"
                  disabled={estadoProceso}
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
                  disabled={estadoProceso}
                />
              </StickyFooter>
            </ContenedorBotones>
          </form>
        </div>
      </Container>
    </AnimatePresence>
  );
}

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

const CreditFieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
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
