import { JSX, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { Switch } from "@mui/material";
import {
  useMovimientosStore,
  useCategoriasStore,
  useOperaciones,
  ListaGenerica,
  Selector,
  InputNumber,
  InputText,
  useCuentaStore,
  v,
  BtnForm,
  Accion,
  Movimiento,
  MovimientoInsert,
  showErrorMessage,
  MovimientoUpdate,
  useUsuariosStore,
  DataDesplegableMovimientos,
  Tipo,
  DataDesplegables,
  Cuenta,
} from "../../../index";
import { ConfigRecurrencia } from "../../../store/MovimientosStore";
import { showConfirmDialog } from "../../../utils/messages";
import { useQuery } from "@tanstack/react-query";

interface RegistrarMovimientosProps {
  setState: () => void;
  state: boolean;
  dataSelect: Movimiento | undefined;
  accion?: Accion;
}

interface FormInputs {
  fecha: string;
  descripcion: string;
  monto: number;
  intervaloDias: number;
  diaMes: number;
  repeticiones: number;
}

const esPagado = (estado: unknown): boolean => {
  if (typeof estado === "boolean") return estado;
  if (typeof estado === "number") return estado === 1;
  if (typeof estado === "string") {
    const valor = estado.trim().toLowerCase();
    return valor === "1" || valor === "true";
  }
  return false;
};

export const RegistrarMovimientos = ({ setState, dataSelect = {} as Movimiento, accion }: RegistrarMovimientosProps): JSX.Element => {
  const { cuentaItemSelect, mostrarCuentas, selectCuenta } = useCuentaStore();
  const { selectTipoMovimiento } = useOperaciones();
  const { idusuario } = useUsuariosStore();
  const { categoriaItemSelect, selectCategoria, mostrarCategorias } = useCategoriasStore();
  const { insertarMovimientos, actualizarMovimientos, insertarMovimientosRecurrentes, previewRecurrencia } = useMovimientosStore();

  const [estado, setEstado] = useState<boolean>(true);
  const [stateCategorias, setStateCategorias] = useState<boolean>(false);
  const [stateCuenta, setStateCuenta] = useState<boolean>(false);
  const [stateTipo, setStateTipo] = useState<boolean>(false);
  const [stateModoRecurrencia, setStateModoRecurrencia] = useState<boolean>(false);
  const [statePoliticaRecurrencia, setStatePoliticaRecurrencia] = useState<boolean>(false);

  // Recurrence state
  const [esRecurrente, setEsRecurrente] = useState<boolean>(false);
  const [modoRecurrencia, setModoRecurrencia] = useState<'intervalo' | 'mensual'>('intervalo');
  const [intervaloDias, setIntervaloDias] = useState<number>(30);
  const [diaMes, setDiaMes] = useState<number>(1);
  const [repeticiones, setRepeticiones] = useState<number>(3);
  const [politica, setPolitica] = useState<'este_mes' | 'proximo_mes'>('este_mes');
  const [previewFechas, setPreviewFechas] = useState<string[]>([]);
  const [recurrenciaColapsada, setRecurrenciaColapsada] = useState<boolean>(false);

  const opcionesModoRecurrencia = [
    { icono: "", descripcion: "Cada N días", value: "intervalo" as const },
    { icono: "", descripcion: "Día X de cada mes", value: "mensual" as const },
  ];

  const opcionesPoliticaRecurrencia = [
    { icono: "", descripcion: "Este mes", value: "este_mes" as const },
    { icono: "", descripcion: "Próximo mes", value: "proximo_mes" as const },
  ];

  const tipoInicial = dataSelect?.tipo || (selectTipoMovimiento?.tipo !== "b" ? selectTipoMovimiento?.tipo : undefined);
  const [tipoMovimiento, setTipoMovimiento] = useState<Tipo>(
    (tipoInicial ? DataDesplegables.movimientos[tipoInicial] : undefined) || {} as Tipo
  );
  const fechaactual = new Date();

  useEffect(() => {
    const tipo = dataSelect?.tipo || (accion === "Nuevo" && selectTipoMovimiento?.tipo !== "b" ? selectTipoMovimiento?.tipo : undefined);
    if (tipo && DataDesplegables.movimientos[tipo]) {
      setTipoMovimiento(DataDesplegables.movimientos[tipo]);
    }
  }, [dataSelect?.tipo, accion, selectTipoMovimiento?.tipo]);

  useEffect(() => {
    if (accion === "Editar") {
      setEstado(esPagado(dataSelect?.estado));
      return;
    }
    if (accion === "Nuevo") {
      setEstado(true);
    }
  }, [accion, dataSelect?.estado, dataSelect?.id]);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<FormInputs>(
    {
      defaultValues: {
        monto: dataSelect.valor || 0,
        descripcion: dataSelect.descripcion || "",
        fecha: dataSelect.fecha || fechaactual.toISOString().slice(0, 10),
        intervaloDias: 30,
        diaMes: 1,
        repeticiones: 3,
      },
    }
  );

  const fechaActualForm = watch('fecha');
  const intervaloDiasForm = watch('intervaloDias');
  const diaMesForm = watch('diaMes');
  const repeticionesForm = watch('repeticiones');

  useEffect(() => {
    const value = Number(intervaloDiasForm);
    if (Number.isNaN(value)) return;
    const clamped = Math.min(Math.max(value, 1), 365);
    setIntervaloDias(clamped);
    setPreviewFechas([]);
  }, [intervaloDiasForm]);

  useEffect(() => {
    const value = Number(diaMesForm);
    if (Number.isNaN(value)) return;
    const clamped = Math.min(Math.max(value, 1), 31);
    setDiaMes(clamped);
    setPreviewFechas([]);
  }, [diaMesForm]);

  useEffect(() => {
    const value = Number(repeticionesForm);
    if (Number.isNaN(value)) return;
    const clamped = Math.min(Math.max(value, 2), 60);
    setRepeticiones(clamped);
    setPreviewFechas([]);
  }, [repeticionesForm]);

  const insertar = async (formData: FormInputs): Promise<void> => {
    if (categoriaItemSelect == null) {
      showErrorMessage("Seleccione una categoria");
      return;
    }
    if (cuentaItemSelect == null) {
      showErrorMessage("Seleccione una cuenta");
      return;
    }

    const baseData = {
      descripcion: formData.descripcion,
      estado: estado,
      fecha: formData.fecha,
      idcategoria: categoriaItemSelect.id,
      idcuenta: cuentaItemSelect.id,
      tipo: tipoMovimiento.tipo,
      valor: parseFloat(formData.monto.toString()),
    } as MovimientoInsert;

    try {
      if (esRecurrente) {
        if (repeticiones > 20) {
          const confirmed = await showConfirmDialog(
            `Vas a crear ${repeticiones} movimientos recurrentes. ¿Quieres continuar?`,
            '¿Estás seguro?',
            `Sí, crear ${repeticiones}`,
            'Cancelar'
          );
          if (!confirmed) return;
        }
        const config: ConfigRecurrencia = {
          modo: modoRecurrencia,
          repeticiones,
          intervaloDias: modoRecurrencia === 'intervalo' ? intervaloDias : undefined,
          diaMes: modoRecurrencia === 'mensual' ? diaMes : undefined,
          politica: modoRecurrencia === 'mensual' ? politica : undefined,
        };
        await insertarMovimientosRecurrentes(baseData, config);
      } else {
        console.log(baseData);
        await insertarMovimientos(baseData);
      }
      setState();
    } catch (err) {
      console.error(err);
    }
  };

  const actualizarPreview = (): void => {
    if (!esRecurrente) {
      setPreviewFechas([]);
      return;
    }
    const fechaBase = fechaActualForm;
    const config: ConfigRecurrencia = {
      modo: modoRecurrencia,
      repeticiones,
      intervaloDias: modoRecurrencia === 'intervalo' ? intervaloDias : undefined,
      diaMes: modoRecurrencia === 'mensual' ? diaMes : undefined,
      politica: modoRecurrencia === 'mensual' ? politica : undefined,
    };
    const fechas = previewRecurrencia({ fecha: fechaBase } as MovimientoInsert, config);
    setPreviewFechas(fechas);
  };

  const actualizar = async (formData: FormInputs): Promise<void> => {
    if (categoriaItemSelect == null) {
      showErrorMessage("Seleccione una categoria");
      return;
    }
    if (cuentaItemSelect == null) {
      showErrorMessage("Seleccione una cuenta");
      return;
    }

    const baseData = {
      descripcion: formData.descripcion,
      estado: estado,
      fecha: formData.fecha,
      id: dataSelect.id,
      idcategoria: categoriaItemSelect.id,
      idcuenta: cuentaItemSelect.id,
      tipo: tipoMovimiento.tipo,
      valor: parseFloat(formData.monto.toString()),
    } as MovimientoUpdate;
    try {
      console.log('actualizar', baseData);

      await actualizarMovimientos(baseData);
      setState();
    }
    catch (err) {
      console.error(err);
    }
  }

  const estadoControl = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEstado(e.target.checked);
  };

  const cambiarTipo = (p: Tipo): void => {
    setTipoMovimiento(p);
    setStateTipo(!stateTipo);
  };

  const { data: cuentas } = useQuery({
    queryKey: ["cuentas", idusuario],
    queryFn: () => mostrarCuentas({ idusuario } as Cuenta),
    enabled: !!idusuario,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: categorias } = useQuery({
    queryKey: ["categorias", tipoMovimiento?.tipo, idusuario],
    queryFn: () => mostrarCategorias({ tipo: tipoMovimiento?.tipo, idusuario }),
    enabled: !!idusuario && !!tipoMovimiento?.tipo,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (accion !== "Editar") return;
    if (!cuentas?.length) return;

    const cuentaNombre = (dataSelect as Movimiento & { cuenta?: string })?.cuenta;
    const cuentaSeleccionada = cuentas.find((cuenta) => {
      if (dataSelect?.idcuenta) return cuenta.id === dataSelect.idcuenta;
      if (cuentaNombre) return cuenta.descripcion === cuentaNombre;
      return false;
    });

    if (cuentaSeleccionada) {
      selectCuenta(cuentaSeleccionada);
    }
  }, [accion, dataSelect?.idcuenta, (dataSelect as Movimiento & { cuenta?: string })?.cuenta, cuentas, selectCuenta]);

  useEffect(() => {
    if (accion !== "Editar") return;
    if (!categorias?.length) return;

    const categoriaNombre = (dataSelect as Movimiento & { categoria?: string })?.categoria;
    const categoriaSeleccionada = categorias.find((categoria) => {
      if (dataSelect?.idcategoria) return categoria.id === dataSelect.idcategoria;
      if (categoriaNombre) return categoria.descripcion === categoriaNombre;
      return false;
    });

    if (categoriaSeleccionada) {
      selectCategoria(categoriaSeleccionada);
    }
  }, [accion, dataSelect?.idcategoria, (dataSelect as Movimiento & { categoria?: string })?.categoria, categorias, selectCategoria]);

  return (
    <Container onClick={setState}>
      <div
        className="sub-contenedor"
        onClick={(e) => { e.stopPropagation(); }}>
        <div className="encabezado">
          <ContenedorDropdown>
            <Selector
              color="#e14e19"
              texto1={tipoMovimiento?.text ? accion + " " : ""}
              texto2={tipoMovimiento?.text || "Seleccione un tipo"}
              funcion={() => setStateTipo(!stateTipo)}
            />

            {stateTipo && (
              <ListaGenerica
                placement="down"
                mobilePlacement="down"
                btnClose={false}
                scroll="hidden"
                setState={() => setStateTipo(!stateTipo)}
                data={DataDesplegableMovimientos.filter(item => item.tipo != "b").map(item => ({
                  descripcion: item.text,
                  ...item,
                }))}
                funcion={cambiarTipo}
              />
            )}
          </ContenedorDropdown>
        </div>

        <form onSubmit={accion == "Nuevo" ? handleSubmit(insertar) : handleSubmit(actualizar)} className="formulario">
          <section>
            <WrapperPagoFecha>
              <ContainerFuepagado>
                <span>{<v.iconocheck />}</span>
                <label>Fue pagado:</label>
                <Switch
                  onChange={estadoControl}
                  checked={estado}
                  color="warning"
                />
              </ContainerFuepagado>
              <ContainerFecha>
                <label>Fecha:</label>
                <input
                  type="date"
                  {...register("fecha", { required: true })}
                ></input>
                {errors.fecha?.type === "required" && (<p>El campo es requerido</p>)}
              </ContainerFecha>
            </WrapperPagoFecha>

            <ContainerMonto>
              <label>Monto:</label>
              <InputNumber
                defaultValue={dataSelect.valor!}
                register={register}
                placeholder="Ingrese monto"
                errors={errors}
                icono={<v.iconocalculadora />}
              />
            </ContainerMonto>

            <div>
              <label>Descripción:</label>
              <InputText
                defaultValue={dataSelect.descripcion!}
                register={register}
                placeholder="Ingrese una descripcion"
                errors={errors}
              />
            </div>

            <ContenedorDropdown>
              <label>Cuenta: </label>
              <Selector
                color="#e14e19"
                texto1={cuentaItemSelect?.icono}
                texto2={cuentaItemSelect?.descripcion || "Seleccionar Cuenta"}
                funcion={() => setStateCuenta(!stateCuenta)}
              />
              {stateCuenta && (
                <ListaGenerica
                  placement="down"
                  mobilePlacement="up"
                  scroll="auto"
                  setState={() => setStateCuenta(!stateCuenta)}
                  data={cuentas?.map(cuenta => ({
                    ...cuenta,
                    descripcion: cuenta.descripcion || '',
                    icono: cuenta.icono || ''
                  })) || []}
                  funcion={selectCuenta}
                />
              )}
            </ContenedorDropdown>

            <ContenedorDropdown>
              <label>Categoria: </label>
              <Selector
                color="#e14e19"
                texto1={categoriaItemSelect?.icono}
                texto2={categoriaItemSelect?.descripcion || "Seleccionar Categoria"}
                funcion={() => setStateCategorias(!stateCategorias)}
              />

              {stateCategorias && (
                <ListaGenerica
                  placement="up"
                  mobilePlacement="up"
                  scroll="auto"
                  setState={() => setStateCategorias(!stateCategorias)}
                  data={categorias?.map(cat => ({
                    ...cat,
                    descripcion: cat.descripcion || '',
                    icono: cat.icono || ''
                  })) || []}
                  funcion={selectCategoria}
                />
              )}
            </ContenedorDropdown>

            {accion === "Nuevo" && (
              <ContainerRecurrencia>
                <FilaRecurrencia>
                  <ContainerFuepagado>
                    <label>Recurrente:</label>
                    <Switch
                      checked={esRecurrente}
                      onChange={(e) => {
                        setEsRecurrente(e.target.checked);
                        if (!e.target.checked) {
                          setPreviewFechas([]);
                        }
                        setRecurrenciaColapsada(false);
                      }}
                      color="warning"
                    />
                  </ContainerFuepagado>
                  {esRecurrente && (
                    <AccionesRecurrencia>
                      <BtnPreview
                        type="button"
                        onClick={() => {
                          actualizarPreview();
                          setRecurrenciaColapsada(true);
                        }}
                      >
                        Previsualizar
                      </BtnPreview>
                      <BtnToggleRecurrencia
                        type="button"
                        onClick={() => setRecurrenciaColapsada(!recurrenciaColapsada)}
                      >
                        {recurrenciaColapsada ? "Mostrar opciones" : "Ocultar opciones"}
                      </BtnToggleRecurrencia>
                    </AccionesRecurrencia>
                  )}
                </FilaRecurrencia>

                {esRecurrente && !recurrenciaColapsada && (
                  <ContainerRecurrenciaOpciones>
                    <ContenedorDropdown>
                      <label>Modo:</label>
                      <Selector
                        color="#e14e19"
                        texto2={modoRecurrencia === 'intervalo' ? 'Cada N días' : 'Día X de cada mes'}
                        funcion={() => setStateModoRecurrencia(!stateModoRecurrencia)}
                        state={stateModoRecurrencia}
                      />
                      {stateModoRecurrencia && (
                        <ListaGenerica
                          placement="down"
                          mobilePlacement="down"
                          scroll="hidden"
                          btnClose={false}
                          setState={() => setStateModoRecurrencia(!stateModoRecurrencia)}
                          data={opcionesModoRecurrencia}
                          funcion={(item) => {
                            setModoRecurrencia(item.value);
                            setPreviewFechas([]);
                          }}
                        />
                      )}
                    </ContenedorDropdown>

                    {modoRecurrencia === 'intervalo' && (
                      <FilaCamposRecurrencia>
                        <ContainerMonto>
                          <label>Cada (días):</label>
                          <InputText
                            type="number"
                            name="intervaloDias"
                            defaultValue={intervaloDias}
                            register={register}
                            errors={errors}
                            placeholder="1 - 365"
                          />
                        </ContainerMonto>
                        <ContainerMonto>
                          <label>Repeticiones <small>(mín. 2)</small>:</label>
                          <InputText
                            type="number"
                            name="repeticiones"
                            defaultValue={repeticiones}
                            register={register}
                            errors={errors}
                            placeholder="2 - 60"
                          />
                        </ContainerMonto>
                      </FilaCamposRecurrencia>
                    )}

                    {modoRecurrencia === 'mensual' && (
                      <>
                        <FilaCamposRecurrencia>
                          <ContainerMonto>
                            <label>Día del mes:</label>
                            <InputText
                              type="number"
                              name="diaMes"
                              defaultValue={diaMes}
                              register={register}
                              errors={errors}
                              placeholder="1 - 31"
                            />
                          </ContainerMonto>
                          <ContainerMonto>
                            <label>Repeticiones <small>(mín. 2)</small>:</label>
                            <InputText
                              type="number"
                              name="repeticiones"
                              defaultValue={repeticiones}
                              register={register}
                              errors={errors}
                              placeholder="2 - 60"
                            />
                          </ContainerMonto>
                        </FilaCamposRecurrencia>
                        <ContenedorDropdown>
                          <label>Inicio:</label>
                          <Selector
                            color="#e14e19"
                            texto2={politica === 'este_mes' ? 'Este mes' : 'Próximo mes'}
                            funcion={() => setStatePoliticaRecurrencia(!statePoliticaRecurrencia)}
                            state={statePoliticaRecurrencia}
                          />
                          {statePoliticaRecurrencia && (
                            <ListaGenerica
                              placement="down"
                              mobilePlacement="down"
                              scroll="hidden"
                              btnClose={false}
                              setState={() => setStatePoliticaRecurrencia(!statePoliticaRecurrencia)}
                              data={opcionesPoliticaRecurrencia}
                              funcion={(item) => {
                                setPolitica(item.value);
                                setPreviewFechas([]);
                              }}
                            />
                          )}
                        </ContenedorDropdown>
                        <MensualHint>La fecha seleccionada arriba no afecta al modo mensual; las fechas se calculan desde el mes de inicio.</MensualHint>
                      </>
                    )}
                  </ContainerRecurrenciaOpciones>
                )}

                {esRecurrente && previewFechas.length > 0 && (
                  <ContainerPreview>
                    <label>Fechas a generar ({previewFechas.length}):</label>
                    <ul>
                      {previewFechas.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </ContainerPreview>
                )}
              </ContainerRecurrencia>
            )}
          </section>
          <ContenedorBotones>
            <StickyFooter>
              <BtnForm
                type="submit"
                titulo="Guardar"
                bgcolor="#DAC1FF"
                icono={<v.iconoguardar />}
              />
              <BtnForm
                funcion={setState}
                type="button"
                titulo="Cancelar"
                bgcolor="#ff4d4f"
                icono={<v.iconocerrar />}
              />
            </StickyFooter>
          </ContenedorBotones>
        </form>
      </div>
    </Container>
  );
}
const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 100;
  color: black;

  .sub-contenedor {
    width: 500px;
    max-width: 85%;
    max-height: min(92vh, 780px);
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;
    color: ${({ theme }) => theme.text};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    label {
      font-weight: 550;
    }
    .encabezado {
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      align-items: center;
      margin-bottom: 20px;
      h1 {
        font-size: 30px;
        font-weight: 700;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .formulario {
      display: flex;
      flex-direction: column;
      min-height: 0;
      .contentBtnsave {
        padding-top: 10px;
        display: flex;
        justify-content: center;
      }
      section {
        padding-top: 5px;
        gap: 20px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        min-height: 0;
        -webkit-overflow-scrolling: touch;
        .colorContainer {
          .colorPickerContent {
            padding-top: 15px;
            min-height: 50px;
          }
        }
      }
    }

    @media (max-width: 500px) {
      max-width: 92%;
      max-height: 92dvh;
      padding: 12px 20px !important;

      input {
        padding: 8px !important;
        font-size: 15px;
      }

      label {
        font-size: 14px;
      }
    }

  }
  @keyframes scale-up-bottom {
    0% {
      transform: scale(0.5);
      transform-origin: center bottom;
    }
    100% {
      transform: scale(1);
      transform-origin: center bottom;
    }
  }
`;

const WrapperPagoFecha = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  flex-wrap: nowrap;

  > div {
    flex: 1;
    min-width: 0; // evita que el contenido fuerce wrapping
  }

  @media (max-width: 500px) {
    flex-direction: column;
    flex-wrap: wrap;
  }
`;
const ContainerMonto = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  label {
    margin-bottom: 5px;
    font-weight: 550;
  }

  @media (max-width: 500px) {
    width: 100%;
  }
`;



const ContainerFuepagado = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
  min-width: 205px;
`;

const ContenedorDropdown = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  gap: 10px;
  flex-direction: row;
  align-items: center;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
  }

  label {
    white-space: nowrap;
  }

  > *:not(label) {
    flex: 1;
    width: 100%;
  }
`;

const ContainerFecha = styled.div`
  display: flex;
  flex: 1;
  gap: 10px;
  align-items: center;
  min-width: 205px;
  input {
    appearance: none;
    color: ${({ theme }) => theme.text};
    font-family: “Helvetica”, arial, sans-serif;
    font-size: 17px;
    border: none;
    background: ${({ theme }) => theme.bgtotal};
    padding: 4px;
    display: inline-block;
    visibility: visible;
    width: 140px;
    cursor: pointer;
    &:focus {
      border-radius: 10px;

      outline: 0;
      /* box-shadow: 0 0 5px 0.4rem rgba(252, 252, 252, 0.25); */
    }
  }
`;

const ContenedorBotones = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const StickyFooter = styled.div`
  margin-top: 20px;
  position: sticky;
  bottom: 0;
  background: ${({ theme }) => theme.bgtotal};
  padding: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  position: relative;
`;

const ContainerRecurrencia = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.text}33;
  padding-top: 10px;
`;

const FilaRecurrencia = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const AccionesRecurrencia = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 500px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const ContainerRecurrenciaOpciones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FilaCamposRecurrencia = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;

  > * {
    flex: 1;
    min-width: 0;
  }
`;

const BtnPreview = styled.button`
  background: #e14e19;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;
  white-space: nowrap;
`;

const BtnToggleRecurrencia = styled(BtnPreview)`
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.text}44;
`;

const ContainerPreview = styled.div`
  background: ${({ theme }) => theme.bgtotal};
  border: 1px solid ${({ theme }) => theme.text}33;
  border-radius: 8px;
  padding: 8px 12px;
  max-height: 150px;
  overflow-y: auto;

  label {
    font-size: 13px;
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  li {
    background: #e14e1922;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 13px;
  }
`;

const MensualHint = styled.small`
  color: ${({ theme }) => theme.text}99;
  font-size: 12px;
  display: block;
`;
