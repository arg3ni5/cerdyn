import { RegistrarMovimientos, Tipo, useOperaciones } from "../index";
import { DataDesplegables } from "../utils/dataEstatica";
import { useMovimientoModalStore } from "../store/useMovimientoModalStore";

export default function GlobalMovimientoModal() {
  const { isOpen, tipoRegistro: tipoRegistroSeleccionado, closeMovimientoModal } = useMovimientoModalStore();
  const { selectTipoMovimiento } = useOperaciones();

  const tipoRegistro = (
    tipoRegistroSeleccionado ??
    (
      selectTipoMovimiento?.tipo && selectTipoMovimiento.tipo !== "b"
        ? selectTipoMovimiento
        : DataDesplegables.movimientos.g
    )
  ) as Tipo;

  return isOpen ? (
    <RegistrarMovimientos
      accion="Nuevo"
      dataSelect={undefined}
      state={isOpen}
      setState={closeMovimientoModal}
      tipoRegistro={tipoRegistro}
    />
  ) : null;
}
