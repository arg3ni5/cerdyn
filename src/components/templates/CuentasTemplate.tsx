import { Header, v, useOperaciones, Tipo, Btndesplegable, ListaMenuDesplegable, DataDesplegableCuenta, RegistrarCuentas, Cuenta, CuentaInsert, CuentaUpdate, Accion, showSuccessMessage, showErrorMessage } from "../../index";
import { useState } from "react";
import { useUsuariosStore, useCuentaStore } from "../../index";
import { Container, ContentFiltro } from "./CuentasTemplate.styles";
import { MovimientosCuentaModal } from "./MovimientosCuentaModal";
import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../moleculas/ConfirmDialog";
import { RefreshCw } from "lucide-react";

interface CuentasTemplateProps {
	data: Cuenta[];
}

export const CuentasTemplate = ({ data }: CuentasTemplateProps) => {
	const [state, setState] = useState(false);
	const [openRegistro, setOpenRegistro] = useState(false);
	const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(null);
	const { usuario } = useUsuariosStore();
	const { actualizarCuenta, eliminarCuenta } = useCuentaStore();
	const [accion, setAccion] = useState<Accion>("Nuevo");
	const [dataSelect, setDataSelect] = useState<CuentaInsert | CuentaUpdate>({});
	const [stateTipo, setStateTipo] = useState(false);
	const { selectTipoCuenta, setTipoCuenta } = useOperaciones();
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [recalculatingId, setRecalculatingId] = useState<number | null>(null);

	const cambiarTipo = (p: Tipo) => {
		setTipoCuenta(p);
		setStateTipo(!stateTipo);
		setState(false);
	};

	const cerrarDesplegables = () => {
		setStateTipo(false);
		setState(false);
	};

	const openTipo = () => {
		setStateTipo(!stateTipo);
		setState(false);
	};

	const openUser = () => {
		setState(!state);
		setStateTipo(false);
	};

	const nuevoRegistro = () => {
		setOpenRegistro(!openRegistro);
		setAccion("Nuevo");
		setDataSelect({});
	};

	const openEditModal = (cuenta: Cuenta) => {
		setAccion("Editar");
		setDataSelect(cuenta as CuentaUpdate);
		setOpenRegistro(true);
	};

	const handleDelete = (id: number) => {
		setConfirmDeleteId(id);
	};

	const confirmDelete = async () => {
		if (confirmDeleteId == null) return;
		setIsDeleting(true);
		try {
			const success = await eliminarCuenta(confirmDeleteId);
			if (!success) throw new Error('No se pudo eliminar la cuenta');
			showSuccessMessage('Cuenta eliminada correctamente');
		} catch (error) {
			showErrorMessage('Error al eliminar la cuenta');
		} finally {
			setIsDeleting(false);
			setConfirmDeleteId(null);
		}
	};

	const recalcularSaldo = async (cuenta: Cuenta) => {
		setRecalculatingId(cuenta.id);
		try {
			const response = await actualizarCuenta(cuenta.id, {
				descripcion: cuenta.descripcion,
				icono: cuenta.icono,
				tipo: cuenta.tipo,
				idusuario: cuenta.idusuario,
				saldo_actual: 0,
			});
			if (!response) throw new Error("No se pudo recalcular el saldo");
			showSuccessMessage("Saldo recalculado correctamente");
		} catch (error) {
			showErrorMessage("Error al recalcular el saldo");
		} finally {
			setRecalculatingId(null);
		}
	};

	const isCreditView = selectTipoCuenta.tipo === "c";
	const totalSaldos = data?.reduce((sum, cuenta) => sum + (cuenta.saldo_actual || 0), 0) || 0;
	const totalLimiteCredito = data?.reduce((sum, cuenta) => sum + (cuenta.limite_credito || cuenta.saldo_actual || 0), 0) || 0;
	const totalCreditoDisponible = isCreditView ? totalSaldos : 0;
	const totalCreditoUtilizado = isCreditView
		? data?.reduce((sum, cuenta) => {
			const limite = cuenta.limite_credito || cuenta.saldo_actual || 0;
			const disponible = cuenta.saldo_actual || 0;
			return sum + Math.max(limite - disponible, 0);
		}, 0) || 0
		: 0;
  const tipoCuentaLabel = selectTipoCuenta.tipo === "efectivo" ? "Efectivo" : selectTipoCuenta.text;
  const accountTypeDescription =
    isCreditView
      ? "Controlá límite, crédito disponible, deuda usada y fechas clave de tus tarjetas."
      : selectTipoCuenta.tipo === "efectivo"
      ? "Revisá tus cuentas de efectivo y accesos rápidos para movimientos cotidianos."
      : "Organizá tus cuentas por tipo para tener mejor control del saldo disponible.";

	return (
		<Container onClick={cerrarDesplegables}>
			{openRegistro && (
				<RegistrarCuentas
					dataSelect={dataSelect}
					onClose={() => setOpenRegistro(false)}
					accion={accion}
				/>
			)}

			{cuentaSeleccionada && (
				<MovimientosCuentaModal
					cuenta={cuentaSeleccionada}
					onClose={() => setCuentaSeleccionada(null)}
				/>
			)}

			<AnimatePresence>
				{confirmDeleteId != null && (
					<ConfirmDialog
						title="¿Eliminar cuenta?"
						message="No podrás revertir esta acción."
						confirmText="Sí, eliminar"
						onConfirm={confirmDelete}
						onCancel={() => setConfirmDeleteId(null)}
						isLoading={isDeleting}
					/>
				)}
			</AnimatePresence>

			<header className="header">
				<Header stateConfig={{ state: state, setState: openUser }} />
			</header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Cuentas</span>
          <h1>{tipoCuentaLabel}</h1>
          <p>{accountTypeDescription}</p>
        </div>

        <div className="hero-side-card">
          <span>Total de cuentas</span>
          <strong>{data?.length || 0}</strong>
          <small>{(data?.length || 0) === 1 ? "cuenta visible" : "cuentas visibles"}</small>
          <div className="type-badge">{selectTipoCuenta.text}</div>
        </div>
      </section>

			<section className="total-summary">
				<div className="total-card">
					<h2>{isCreditView ? "Crédito disponible" : "Saldo Total"}</h2>
					<p className="total-amount">{usuario?.moneda} {(isCreditView ? totalCreditoDisponible : totalSaldos).toFixed(2)}</p>
					{isCreditView && (
						<div className="credit-summary">
							<span>Límite: {usuario?.moneda} {totalLimiteCredito.toFixed(2)}</span>
							<span>Utilizado: {usuario?.moneda} {totalCreditoUtilizado.toFixed(2)}</span>
						</div>
					)}
				</div>
			</section>

			<section className="tipo">
				<div
          className="filter-card"
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
          <span className="toolbar-label">Tipo de cuenta</span>
          <p className="toolbar-description">Cambiá entre los grupos disponibles para enfocarte en cada saldo.</p>
          <ContentFiltro>
						<Btndesplegable
							textcolor={selectTipoCuenta.color}
							bgcolor={selectTipoCuenta.bgcolor}
							text={selectTipoCuenta.text}
							funcion={openTipo}
						/>
						{stateTipo && (
							<ListaMenuDesplegable
								data={DataDesplegableCuenta}
								top="112%"
								funcion={(p) => cambiarTipo(p as Tipo)}
							/>
						)}
					</ContentFiltro>
				</div>

				<div className="action-card">
          <span className="toolbar-label">{isCreditView ? "Nueva tarjeta" : "Nueva cuenta"}</span>
          <p className="toolbar-description">
						{isCreditView
							? "Creá una tarjeta con límite, fechas de corte y pago para controlar el crédito disponible."
							: "Creá una cuenta con saldo inicial e ícono para ubicarla rápido."}
					</p>
          <button
            type="button"
            className="primary-action"
            onClick={(e) => {
              e.stopPropagation();
              nuevoRegistro();
            }}
          >
            <span className="icon">
              <v.agregar />
            </span>
            <span>{isCreditView ? "Agregar tarjeta" : "Agregar Cuenta"}</span>
          </button>
        </div>
			</section>

			<section className="main">
				{data?.length > 0 ? (
					<div className="accounts-grid">
						{data.map((cuenta) => (
							(() => {
								const limite = cuenta.limite_credito || cuenta.saldo_actual || 0;
								const disponible = cuenta.saldo_actual || 0;
								const utilizado = Math.max(limite - disponible, 0);
								const usoPorcentaje = limite > 0 ? Math.min((utilizado / limite) * 100, 100) : 0;

								return (
							<div
								key={cuenta.id}
								className="account-card"
								onClick={() => setCuentaSeleccionada(cuenta)}
							>
								<div className="card-header">
                  <div className="card-header-copy">
									  <span className="icon">{cuenta.icono}</span>
									  <div>
                      <h3>{cuenta.descripcion}</h3>
                      <small>{isCreditView ? "Tarjeta de crédito" : selectTipoCuenta.text}</small>
                    </div>
                  </div>
                  <span className="open-indicator">Ver</span>
								</div>
                <div className="card-body">
								  <p className="balance">{usuario?.moneda} {(cuenta.saldo_actual || 0).toFixed(2)}</p>
                  <span className="balance-label">{isCreditView ? "Crédito disponible" : "Saldo disponible"}</span>
									{isCreditView && (
										<div className="credit-metrics">
											<div className="credit-row">
												<span>Límite</span>
												<strong>{usuario?.moneda} {limite.toFixed(2)}</strong>
											</div>
											<div className="credit-row">
												<span>Utilizado</span>
												<strong>{usuario?.moneda} {utilizado.toFixed(2)}</strong>
											</div>
											<div className="usage-bar" aria-label={`Uso de crédito ${usoPorcentaje.toFixed(0)}%`}>
												<span style={{ width: `${usoPorcentaje}%` }} />
											</div>
											<div className="credit-dates">
												<span>Corte: día {cuenta.dia_corte || "-"}</span>
												<span>Pago: día {cuenta.dia_pago || "-"}</span>
											</div>
										</div>
									)}
                </div>
								<div className="card-actions">
									{!isCreditView && (
										<button
											type="button"
											className="recalculate-action"
											onClick={(e) => {
												e.stopPropagation();
												void recalcularSaldo(cuenta);
											}}
											aria-label={`Recalcular saldo de ${cuenta.descripcion}`}
											title="Recalcular saldo"
											disabled={recalculatingId === cuenta.id}
										>
											<RefreshCw size={16} />
										</button>
									)}
									<button
                    type="button"
										onClick={(e) => {
											e.stopPropagation();
											openEditModal(cuenta);
										}}
                    aria-label={`Editar cuenta ${cuenta.descripcion}`}
									>
										✏️
									</button>
									<button
                    type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleDelete(cuenta.id);
										}}
                    aria-label={`Eliminar cuenta ${cuenta.descripcion}`}
									>
										🗑️
									</button>
								</div>
							</div>
								);
							})()
						))}
					</div>
				) : (
					<div className="empty-state">
            <div className="empty-card">
              <h2>{isCreditView ? "No hay tarjetas registradas" : "No hay cuentas registradas"}</h2>
              <p>
								{isCreditView
									? "Creá tu primera tarjeta para empezar a controlar límite, uso y fechas de pago."
									: "Creá tu primera cuenta para empezar a registrar movimientos y ver tu saldo total."}
							</p>
            </div>
          </div>
				)}
			</section>
		</Container>
	);
}
