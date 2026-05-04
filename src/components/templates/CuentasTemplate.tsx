import { Header, v, useOperaciones, Tipo, Btndesplegable, ListaMenuDesplegable, DataDesplegableCuenta, RegistrarCuentas, Cuenta, CuentaInsert, CuentaUpdate, Accion, showSuccessMessage, showErrorMessage } from "../../index";
import { useState } from "react";
import { useUsuariosStore, useCuentaStore } from "../../index";
import { Container, ContentFiltro } from "./CuentasTemplate.styles";
import { MovimientosCuentaModal } from "./MovimientosCuentaModal";
import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../moleculas/ConfirmDialog";

interface CuentasTemplateProps {
	data: Cuenta[];
}

export const CuentasTemplate = ({ data }: CuentasTemplateProps) => {
	const [state, setState] = useState(false);
	const [openRegistro, setOpenRegistro] = useState(false);
	const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(null);
	const { usuario } = useUsuariosStore();
	const { eliminarCuenta } = useCuentaStore();
	const [accion, setAccion] = useState<Accion>("Nuevo");
	const [dataSelect, setDataSelect] = useState<CuentaInsert | CuentaUpdate>({});
	const [stateTipo, setStateTipo] = useState(false);
	const { selectTipoCuenta, setTipoCuenta } = useOperaciones();
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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
		try {
			await eliminarCuenta(confirmDeleteId);
			showSuccessMessage('Cuenta eliminada correctamente');
		} catch (error) {
			showErrorMessage('Error al eliminar la cuenta');
		} finally {
			setConfirmDeleteId(null);
		}
	};

	const totalSaldos = data?.reduce((sum, cuenta) => sum + (cuenta.saldo_actual || 0), 0) || 0;
  const tipoCuentaLabel = selectTipoCuenta.tipo === "efectivo" ? "Efectivo" : selectTipoCuenta.text;
  const accountTypeDescription =
    selectTipoCuenta.tipo === "efectivo"
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
					<h2>Saldo Total</h2>
					<p className="total-amount">{usuario?.moneda} {totalSaldos.toFixed(2)}</p>
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
          <span className="toolbar-label">Nueva cuenta</span>
          <p className="toolbar-description">Creá una cuenta con saldo inicial e ícono para ubicarla rápido.</p>
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
            <span>Agregar Cuenta</span>
          </button>
        </div>
			</section>

			<section className="main">
				{data?.length > 0 ? (
					<div className="accounts-grid">
						{data.map((cuenta) => (
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
                      <small>{selectTipoCuenta.text}</small>
                    </div>
                  </div>
                  <span className="open-indicator">Ver</span>
								</div>
                <div className="card-body">
								  <p className="balance">{usuario?.moneda} {cuenta.saldo_actual?.toFixed(2)}</p>
                  <span className="balance-label">Saldo disponible</span>
                </div>
								<div className="card-actions">
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
						))}
					</div>
				) : (
					<div className="empty-state">
            <div className="empty-card">
              <h2>No hay cuentas registradas</h2>
              <p>Creá tu primera cuenta para empezar a registrar movimientos y ver tu saldo total.</p>
            </div>
          </div>
				)}
			</section>
		</Container>
	);
}
