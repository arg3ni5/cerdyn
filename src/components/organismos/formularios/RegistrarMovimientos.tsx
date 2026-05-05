import { JSX, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Switch } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import { CircleCheck, Loader2, X } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { AccionesRecurrencia, BtnPreview, BtnToggleRecurrencia, CloseButton, Container, ContainerDescripcion, ContainerFecha, ContainerFuepagado, ContainerMonto, ContainerPreview, ContainerRecurrencia, ContainerRecurrenciaOpciones, ContenedorBotones, ContenedorDropdown, FilaCamposRecurrencia, FilaRecurrencia, MensualHint, StickyFooter, WrapperPagoFecha } from "./RegistrarMovimientos.styles";
import { ConfirmDialog } from "../../moleculas/ConfirmDialog";

interface RegistrarMovimientosProps {
  setState: () => void;
  state: boolean;
  dataSelect: Movimiento | undefined;
  accion?: Accion;
  tipoRegistro?: Tipo;
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

const obtenerTituloMovimiento = (accion: Accion | undefined, tipoMovimiento: Tipo): string => {
  if (accion === "Editar") return "Editar movimiento";
  if (tipoMovimiento?.tipo === "g") return "Nuevo Gasto";
  if (tipoMovimiento?.tipo === "i") return "Nuevo Ingreso";
  if (tipoMovimiento?.tipo === "t") return "Nueva Transferencia";
  return "Nuevo movimiento";
};

export const RegistrarMovimientos = ({ setState, state, dataSelect = {} as Movimiento, accion, tipoRegistro }: RegistrarMovimientosProps): JSX.Element => {
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

  // Transfer-specific state
  const [cuentaOrigen, setCuentaOrigen] = useState<Cuenta | null>(null);
  const [cuentaDestino, setCuentaDestino] = useState<Cuenta | null>(null);
  const [stateCuentaOrigen, setStateCuentaOrigen] = useState<boolean>(false);
  const [stateCuentaDestino, setStateCuentaDestino] = useState<boolean>(false);

  // Recurrence state
  const [esRecurrente, setEsRecurrente] = useState<boolean>(false);
  const [modoRecurrencia, setModoRecurrencia] = useState<'intervalo' | 'mensual'>('intervalo');
  const [intervaloDias, setIntervaloDias] = useState<number>(30);
  const [diaMes, setDiaMes] = useState<number>(1);
  const [repeticiones, setRepeticiones] = useState<number>(3);
  const [politica, setPolitica] = useState<'este_mes' | 'proximo_mes'>('este_mes');
  const [previewFechas, setPreviewFechas] = useState<string[]>([]);
  const [recurrenciaColapsada, setRecurrenciaColapsada] = useState<boolean>(false);
  const [pendingRecurrencia, setPendingRecurrencia] = useState<MovimientoInsert | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const savingRef = useRef<boolean>(false);

  const opcionesModoRecurrencia = [
    { icono: "", descripcion: "Cada N días", value: "intervalo" as const },
    { icono: "", descripcion: "Día X de cada mes", value: "mensual" as const },
  ];

  const opcionesPoliticaRecurrencia = [
    { icono: "", descripcion: "Este mes", value: "este_mes" as const },
    { icono: "", descripcion: "Próximo mes", value: "proximo_mes" as const },
  ];

  const tipoInicial = dataSelect?.tipo || tipoRegistro?.tipo || (selectTipoMovimiento?.tipo !== "b" ? selectTipoMovimiento?.tipo : undefined);
  const [tipoMovimiento, setTipoMovimiento] = useState<Tipo>(
    (tipoInicial ? DataDesplegables.movimientos[tipoInicial] : undefined) || {} as Tipo
  );
  const fechaactual = new Date();

  const esTransferencia = tipoMovimiento?.tipo === "t";

  const startSaving = (): boolean => {
    if (savingRef.current) return false;
    savingRef.current = true;
    setIsSaving(true);
    return true;
  };

  const stopSaving = (): void => {
    savingRef.current = false;
    setIsSaving(false);
  };

  useEffect(() => {
    const tipo = dataSelect?.tipo || (accion === "Nuevo" ? tipoRegistro?.tipo : undefined) || (accion === "Nuevo" && selectTipoMovimiento?.tipo !== "b" ? selectTipoMovimiento?.tipo : undefined);
    if (tipo && DataDesplegables.movimientos[tipo]) {
      setTipoMovimiento(DataDesplegables.movimientos[tipo]);
    }
  }, [dataSelect?.tipo, accion, tipoRegistro?.tipo, selectTipoMovimiento?.tipo]);

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
    reset,
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

  useEffect(() => {
    if (!state) return;

    reset({
      monto: Number(dataSelect?.valor || 0),
      descripcion: dataSelect?.descripcion || "",
      fecha: dataSelect?.fecha || fechaactual.toISOString().slice(0, 10),
      intervaloDias: 30,
      diaMes: 1,
      repeticiones: 3,
    });
  }, [state, accion, dataSelect?.id, dataSelect?.valor, dataSelect?.descripcion, dataSelect?.fecha, reset]);

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

  const insertarRecurrente = async (baseData: MovimientoInsert): Promise<void> => {
    const config: ConfigRecurrencia = {
      modo: modoRecurrencia,
      repeticiones,
      intervaloDias: modoRecurrencia === 'intervalo' ? intervaloDias : undefined,
      diaMes: modoRecurrencia === 'mensual' ? diaMes : undefined,
      politica: modoRecurrencia === 'mensual' ? politica : undefined,
    };
    await insertarMovimientosRecurrentes(baseData, config);
    setState();
  };

  const insertar = async (formData: FormInputs): Promise<void> => {
    if (savingRef.current) return;

    if (esTransferencia) {
      if (cuentaOrigen == null) {
        showErrorMessage("Seleccione la cuenta origen");
        return;
      }
      if (cuentaDestino == null) {
        showErrorMessage("Seleccione la cuenta destino");
        return;
      }
      if (cuentaOrigen.id === cuentaDestino.id) {
        showErrorMessage("La cuenta origen y destino deben ser diferentes");
        return;
      }
    } else {
      if (categoriaItemSelect == null) {
        showErrorMessage("Seleccione una categoria");
        return;
      }
      if (cuentaItemSelect == null) {
        showErrorMessage("Seleccione una cuenta");
        return;
      }
    }

    const baseData: MovimientoInsert = esTransferencia
      ? {
          descripcion: formData.descripcion,
          estado: estado,
          fecha: formData.fecha,
          tipo: "t",
          valor: parseFloat(formData.monto.toString()),
          idcuenta: null,
          idcuenta_origen: cuentaOrigen!.id,
          idcuenta_destino: cuentaDestino!.id,
        }
      : {
          descripcion: formData.descripcion,
          estado: estado,
          fecha: formData.fecha,
          idcategoria: categoriaItemSelect!.id,
          idcuenta: cuentaItemSelect!.id,
          tipo: tipoMovimiento.tipo,
          valor: parseFloat(formData.monto.toString()),
        };

    try {
      if (esRecurrente) {
        if (repeticiones > 20) {
          setPendingRecurrencia(baseData);
          return;
        }
        if (!startSaving()) return;
        await insertarRecurrente(baseData);
      } else {
        if (!startSaving()) return;
        await insertarMovimientos(baseData);
        setState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      stopSaving();
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
    if (savingRef.current) return;

    if (esTransferencia) {
      if (cuentaOrigen == null) {
        showErrorMessage("Seleccione la cuenta origen");
        return;
      }
      if (cuentaDestino == null) {
        showErrorMessage("Seleccione la cuenta destino");
        return;
      }
      if (cuentaOrigen.id === cuentaDestino.id) {
        showErrorMessage("La cuenta origen y destino deben ser diferentes");
        return;
      }
    } else {
      if (categoriaItemSelect == null) {
        showErrorMessage("Seleccione una categoria");
        return;
      }
      if (cuentaItemSelect == null) {
        showErrorMessage("Seleccione una cuenta");
        return;
      }
    }

    const baseData: MovimientoUpdate = esTransferencia
      ? {
          descripcion: formData.descripcion,
          estado: estado,
          fecha: formData.fecha,
          id: dataSelect.id,
          tipo: "t",
          valor: parseFloat(formData.monto.toString()),
          idcuenta: null,
          idcuenta_origen: cuentaOrigen!.id,
          idcuenta_destino: cuentaDestino!.id,
        }
      : {
          descripcion: formData.descripcion,
          estado: estado,
          fecha: formData.fecha,
          id: dataSelect.id,
          idcategoria: categoriaItemSelect!.id,
          idcuenta: cuentaItemSelect!.id,
          tipo: tipoMovimiento.tipo,
          valor: parseFloat(formData.monto.toString()),
        };
    try {
      if (!startSaving()) return;
      await actualizarMovimientos(baseData);
      setState();
    }
    catch (err) {
      console.error(err);
    } finally {
      stopSaving();
    }
  }

  const estadoControl = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEstado(e.target.checked);
  };

  const cambiarTipo = (p: Tipo): void => {
    setTipoMovimiento(p);
    setStateTipo(!stateTipo);
  };

  const toggleCuenta = (): void => {
    setStateCuenta(!stateCuenta);
    setStateCategorias(false);
    setStateCuentaOrigen(false);
    setStateCuentaDestino(false);
  };

  const toggleCategorias = (): void => {
    setStateCategorias(!stateCategorias);
    setStateCuenta(false);
    setStateCuentaOrigen(false);
    setStateCuentaDestino(false);
  };

  const toggleCuentaOrigen = (): void => {
    setStateCuentaOrigen(!stateCuentaOrigen);
    setStateCuentaDestino(false);
    setStateCuenta(false);
    setStateCategorias(false);
  };

  const toggleCuentaDestino = (): void => {
    setStateCuentaDestino(!stateCuentaDestino);
    setStateCuentaOrigen(false);
    setStateCuenta(false);
    setStateCategorias(false);
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

    if (dataSelect?.tipo === "t") {
      // For transfers, set origin and destination accounts
      const origen = cuentas.find(c => c.id === dataSelect.idcuenta_origen);
      const destino = cuentas.find(c => c.id === dataSelect.idcuenta_destino);
      if (origen) setCuentaOrigen(origen);
      if (destino) setCuentaDestino(destino);
      return;
    }

    const cuentaNombre = (dataSelect as Movimiento & { cuenta?: string })?.cuenta;
    const cuentaSeleccionada = cuentas.find((cuenta) => {
      if (dataSelect?.idcuenta) return cuenta.id === dataSelect.idcuenta;
      if (cuentaNombre) return cuenta.descripcion === cuentaNombre;
      return false;
    });

    if (cuentaSeleccionada) {
      selectCuenta(cuentaSeleccionada);
    }
  }, [accion, dataSelect?.idcuenta, dataSelect?.tipo, dataSelect?.idcuenta_origen, dataSelect?.idcuenta_destino, (dataSelect as Movimiento & { cuenta?: string })?.cuenta, cuentas, selectCuenta]);

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
    <AnimatePresence>
      {pendingRecurrencia && (
        <ConfirmDialog
          title="¿Crear movimientos recurrentes?"
          message={`Vas a crear ${repeticiones} movimientos recurrentes. ¿Quieres continuar?`}
          confirmText={`Sí, crear ${repeticiones}`}
          variant="warning"
          onConfirm={async () => {
            try {
              if (!startSaving()) return;
              await insertarRecurrente(pendingRecurrencia);
            } catch (err) {
              console.error(err);
            } finally {
              stopSaving();
              setPendingRecurrencia(null);
            }
          }}
          onCancel={() => setPendingRecurrencia(null)}
          isLoading={isSaving}
        />
      )}
      {state && (
        <Container
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="sub-contenedor"
            onClick={(e) => { e.stopPropagation(); }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="encabezado">
              <div className="encabezado-contenido">
                <h1>{obtenerTituloMovimiento(accion, tipoMovimiento)}</h1>
                <ContenedorDropdown className="selector-tipo-movimiento">
                  <Selector
                    color="#e14e19"
                    texto1="Tipo: "
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
              <CloseButton onClick={setState} type="button" disabled={isSaving}>
                <X size={24} />
              </CloseButton>
            </div>

            <form onSubmit={accion == "Nuevo" ? handleSubmit(insertar) : handleSubmit(actualizar)} className="formulario">
              <section>
                <WrapperPagoFecha>
                  <ContainerFuepagado>
                    <label>Fue pagado:</label>
                    <div className="pago-control">
                      <span className="pago-icon">
                        <CircleCheck size={18} strokeWidth={2.4} />
                      </span>
                      <span className="pago-text">{estado ? "Pagado" : "Pendiente"}</span>
                      <Switch
                        onChange={estadoControl}
                        checked={estado}
                        color="warning"
                      />
                    </div>
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
                    placeholder="0.00"
                    errors={errors}
                  />
                </ContainerMonto>

                <ContainerDescripcion>
                  <label>Descripción:</label>
                  <InputText
                    defaultValue={dataSelect.descripcion!}
                    register={register}
                    placeholder="Ingrese una descripción"
                    errors={errors}
                    variant="surface"
                  />
                </ContainerDescripcion>

                {esTransferencia ? (
                  <>
                    <ContenedorDropdown $active={stateCuentaOrigen}>
                      <label>Cuenta origen: </label>
                      <Selector
                        color="#3b82f6"
                        texto1={cuentaOrigen?.icono}
                        texto2={cuentaOrigen?.descripcion || "Seleccionar cuenta origen"}
                        funcion={toggleCuentaOrigen}
                      />
                      {stateCuentaOrigen && (
                        <ListaGenerica
                          placement="down"
                          mobilePlacement="up"
                          scroll="auto"
                          filterable
                          filterPlaceholder="Buscar cuenta origen..."
                          emptyMessage="No hay cuentas origen que coincidan."
                          filterBy={["descripcion"]}
                          setState={() => setStateCuentaOrigen(!stateCuentaOrigen)}
                          data={cuentas?.map(cuenta => ({
                            ...cuenta,
                            descripcion: cuenta.descripcion || '',
                            icono: cuenta.icono || ''
                          })) || []}
                          funcion={(c) => { setCuentaOrigen(c as Cuenta); setStateCuentaOrigen(false); }}
                        />
                      )}
                    </ContenedorDropdown>

                    <ContenedorDropdown $active={stateCuentaDestino}>
                      <label>Cuenta destino: </label>
                      <Selector
                        color="#3b82f6"
                        texto1={cuentaDestino?.icono}
                        texto2={cuentaDestino?.descripcion || "Seleccionar cuenta destino"}
                        funcion={toggleCuentaDestino}
                      />
                      {stateCuentaDestino && (
                        <ListaGenerica
                          placement="up"
                          mobilePlacement="up"
                          scroll="auto"
                          filterable
                          filterPlaceholder="Buscar cuenta destino..."
                          emptyMessage="No hay cuentas destino que coincidan."
                          filterBy={["descripcion"]}
                          setState={() => setStateCuentaDestino(!stateCuentaDestino)}
                          data={cuentas?.filter(c => c.id !== cuentaOrigen?.id).map(cuenta => ({
                            ...cuenta,
                            descripcion: cuenta.descripcion || '',
                            icono: cuenta.icono || ''
                          })) || []}
                          funcion={(c) => { setCuentaDestino(c as Cuenta); setStateCuentaDestino(false); }}
                        />
                      )}
                    </ContenedorDropdown>
                  </>
                ) : (
                  <>
                    <ContenedorDropdown $active={stateCuenta}>
                      <label>Cuenta: </label>
                      <Selector
                        color="#e14e19"
                        texto1={cuentaItemSelect?.icono}
                        texto2={cuentaItemSelect?.descripcion || "Seleccionar Cuenta"}
                        funcion={toggleCuenta}
                      />
                      {stateCuenta && (
                        <ListaGenerica
                          placement="down"
                          mobilePlacement="up"
                          scroll="auto"
                          filterable
                          filterPlaceholder="Buscar cuenta..."
                          emptyMessage="No hay cuentas que coincidan."
                          filterBy={["descripcion"]}
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

                    <ContenedorDropdown $active={stateCategorias}>
                      <label>Categoria: </label>
                      <Selector
                        color="#e14e19"
                        texto1={categoriaItemSelect?.icono}
                        texto2={categoriaItemSelect?.descripcion || "Seleccionar Categoria"}
                        funcion={toggleCategorias}
                      />

                      {stateCategorias && (
                        <ListaGenerica
                          placement="up"
                          mobilePlacement="up"
                          scroll="auto"
                          filterable
                          filterPlaceholder="Buscar categoría..."
                          emptyMessage="No hay categorías que coincidan."
                          filterBy={["descripcion"]}
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
                  </>
                )}

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
                    titulo={isSaving ? "Guardando..." : "Guardar"}
                    bgcolor="#DAC1FF"
                    icono={isSaving ? <Loader2 className="spin" size={20} /> : <v.iconoguardar />}
                    disabled={isSaving}
                  />
                  <BtnForm
                    funcion={setState}
                    type="button"
                    titulo="Cancelar"
                    bgcolor="#ff4d4f"
                    icono={<v.iconocerrar />}
                    disabled={isSaving}
                  />
                </StickyFooter>
              </ContenedorBotones>
            </form>
          </motion.div>
        </Container>
      )}
    </AnimatePresence>
  );
}
