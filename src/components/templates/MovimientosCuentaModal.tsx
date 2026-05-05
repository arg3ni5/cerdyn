import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cuenta, Movimiento, MovimientosMesAnioAll, useUsuariosStore, ObtenerSaldoCuentaAFecha, RegistrarMovimientos, Spinner, MostrarMovimientosPorMesAñoAll } from "../../index";
import { supabase } from "../../supabase/supabase.config";
import dayjs from "dayjs";
import styled from "styled-components";
import { Pencil } from "lucide-react";

interface MovimientosCuentaModalProps {
	cuenta: Cuenta;
	onClose: () => void;
}

type MovimientoDetalleCuenta = Movimiento & {
	cuenta?: string | null;
	categoria?: string | null;
	cuenta_origen?: string | null;
	cuenta_destino?: string | null;
};

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 1rem;
`;

const ModalContent = styled.div`
	position: relative;
	background: ${({ theme }) => theme.bg};
	color: ${({ theme }) => theme.text};
	border-radius: 12px;
	max-width: 600px;
	width: 100%;
	max-height: 80vh;
	overflow-y: auto;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

	.modal-header {
		padding: 2rem;
		border-bottom: 1px solid ${({ theme }) => theme.border || 'rgba(0,0,0,0.1)'};
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 0;
		background: ${({ theme }) => theme.bg};
		z-index: 10;

		h2 {
			margin: 0;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

					button {
			background: none;
			border: none;
			font-size: 1.5rem;
			cursor: pointer;
			color: ${({ theme }) => theme.text};
			padding: 0;

			&:hover {
				opacity: 0.7;
			}

			&:disabled {
				cursor: not-allowed;
				opacity: 0.45;
			}
		}
	}

	.modal-body {
		padding: 2rem;

		.info-periodo {
			background: ${({ theme }) => theme.bgAlpha || 'rgba(0,0,0,0.05)'};
			padding: 1rem;
			border-radius: 8px;
			margin-bottom: 1rem;
			font-size: 0.9rem;
			color: ${({ theme }) => theme.text};
			p {
				margin: 10px 0;
			}
		}

		.movimientos-list {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;

			.movimiento-item {
				background: ${({ theme }) => theme.bgAlpha || 'rgba(0,0,0,0.05)'};
				padding: 1rem;
				border-radius: 8px;
				border-left: 4px solid;
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 0.75rem;
				color: ${({ theme }) => theme.text};

				&.ingreso {
					border-left-color: #10b981;
					background: ${({ theme }) => `linear-gradient(0deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.08)), ${theme.bgAlpha}`};
				}

				&.gasto {
					border-left-color: #ef4444;
					background: ${({ theme }) => `linear-gradient(0deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.08)), ${theme.bgAlpha}`};
				}

				&.transferencia {
					border-left-color: #3b82f6;
					background: ${({ theme }) => `linear-gradient(0deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.1)), ${theme.bgAlpha}`};
				}

				.item-info {
					flex: 1;
					min-width: 0;

					.item-descripcion {
						font-weight: 500;
						margin-bottom: 0.25rem;
						overflow-wrap: anywhere;
					}

					.item-fecha {
						font-size: 0.85rem;
						color: ${({ theme }) => theme.colorSubtitle};
					}

					.item-meta {
						font-size: 0.82rem;
						color: ${({ theme }) => theme.colorSubtitle};
						margin-top: 0.2rem;
						overflow-wrap: anywhere;
					}
				}

				.item-actions {
					display: inline-flex;
					align-items: center;
					gap: 0.5rem;
					flex: 0 0 auto;
				}

				.edit-button {
					width: 34px;
					height: 34px;
					border: 1px solid ${({ theme }) => theme.text}22;
					border-radius: 50%;
					background: ${({ theme }) => theme.bg};
					color: ${({ theme }) => theme.text};
					display: grid;
					place-items: center;
					cursor: pointer;
					transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;

					&:hover {
						transform: translateY(-1px);
						border-color: #667df4;
						color: #667df4;
					}

					&:disabled {
						cursor: not-allowed;
						opacity: 0.5;
						transform: none;
					}
				}

				.item-valor {
					font-weight: 600;
					font-size: 1.1rem;
					white-space: nowrap;

					&.ingreso {
						color: #10b981;
					}

					&.gasto {
						color: #ef4444;
					}
				}
			}
		}

		.sin-movimientos {
			text-align: center;
			padding: 2rem;
			color: ${({ theme }) => theme.colorSubtitle};

			p {
				margin: 0;
				font-size: 1.1rem;
			}
		}

		.resumen-totales {
			margin: 1.5rem 0;
			padding: 1.5rem;
			border-radius: 12px;
			background: ${({ theme }) => theme.bgAlpha || 'rgba(0,0,0,0.02)'};
			border: 1px solid ${({ theme }) => theme.border || 'rgba(0,0,0,0.1)'};
			display: flex;
			flex-direction: column;
			gap: 0.75rem;

			.total-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0.25rem 0;
				gap: 1rem;

				&.main-balance {
					margin-top: 0.5rem;
					padding-top: 0.75rem;
					border-top: 2px solid ${({ theme }) => theme.border || 'rgba(0,0,0,0.1)'};
					font-weight: 700;
					font-size: 1.2rem;
				}

				.label {
					font-size: 0.95rem;
					color: ${({ theme }) => theme.colorSubtitle};
				}

				.valor {
					font-weight: 600;
					color: ${({ theme }) => theme.text};
					text-align: right;

					&.ingreso {
						color: #10b981;
					}

					&.gasto {
						color: #ef4444;
					}
				}
			}
		}
	}
`;

export const MovimientosCuentaModal = ({ cuenta, onClose }: MovimientosCuentaModalProps) => {
	const { usuario } = useUsuariosStore();
	const queryClient = useQueryClient();
	const [movimientosFiltrados, setMovimientosFiltrados] = useState<MovimientoDetalleCuenta[]>([]);
	const [openRegistro, setOpenRegistro] = useState(false);
	const [dataSelect, setDataSelect] = useState<Movimiento | undefined>(undefined);
	const [isLoadingEdit, setIsLoadingEdit] = useState(false);
	const now = dayjs();
	const [date, setDate] = useState(now);
	const fechaInicio = date.startOf("month").format("YYYY-MM-DD");
	const fechaFin = date.endOf("month").format("YYYY-MM-DD");
	const anio = date.year();
	const mes = date.month() + 1;

	const mapMovimientoDetalle = (movimiento: MovimientosMesAnioAll[number]): MovimientoDetalleCuenta => ({
		id: movimiento.id,
		descripcion: movimiento.descripcion,
		valor: Number(movimiento.monto ?? 0),
		fecha: movimiento.fecha,
		estado: movimiento.estado,
		idcategoria: null,
		idcuenta: movimiento.tipocategoria === "t" ? null : cuenta.id,
		idcuenta_origen: movimiento.idcuenta_origen ?? null,
		idcuenta_destino: movimiento.idcuenta_destino ?? null,
		tipo: movimiento.tipocategoria,
		cuenta: movimiento.cuenta,
		categoria: movimiento.categoria,
		cuenta_origen: movimiento.cuenta_origen,
		cuenta_destino: movimiento.cuenta_destino,
	});

	const movimientoPerteneceACuenta = (movimiento: MovimientosMesAnioAll[number]) => {
		const cuentaId = Number(cuenta.id);

		if (movimiento.tipocategoria === "t") {
			return movimiento.idcuenta_origen === cuentaId || movimiento.idcuenta_destino === cuentaId;
		}

		return movimiento.cuenta === cuenta.descripcion;
	};

	// Obtener movimientos del mes (incluyendo transferencias)
	const { data: movimientos, isLoading: isLoadingMovs, isFetching: isFetchingMovs } = useQuery<MovimientoDetalleCuenta[], Error>({
		queryKey: ["movimientos-cuenta", cuenta.id, usuario?.id, anio, mes],
		queryFn: async () => {
			try {
				const cuentaId = Number(cuenta.id);
				const iduser = Number(usuario?.id);

				if (!Number.isInteger(cuentaId) || cuentaId <= 0 || !Number.isInteger(iduser) || iduser <= 0) {
					return [];
				}

				const data = await MostrarMovimientosPorMesAñoAll({ anio, mes, iduser, p_idcuenta: cuentaId });

				return (data ?? [])
					.filter((movimiento) => movimiento.estado)
					.filter(movimientoPerteneceACuenta)
					.map(mapMovimientoDetalle);
			} catch (error) {
				console.error("Error al cargar movimientos:", error);
				return [];
			}
		},
		enabled: !!cuenta.id && !!usuario?.id,
	});

	const { data: saldoAnterior, isLoading: isLoadingSaldo, isFetching: isFetchingSaldo } = useQuery({
		queryKey: ["saldo-anterior", cuenta.id, fechaInicio],
		queryFn: () => ObtenerSaldoCuentaAFecha(cuenta.id, fechaInicio),
		enabled: !!cuenta.id,
	});

	useEffect(() => {
		if (movimientos) {
			setMovimientosFiltrados(movimientos);
		}
	}, [movimientos]);

	const totalIngresos = movimientosFiltrados
		.filter((m) => m.tipo === "i")
		.reduce((sum, m) => sum + (m.valor || 0), 0);

	const totalGastos = movimientosFiltrados
		.filter((m) => m.tipo === "g")
		.reduce((sum, m) => sum + (m.valor || 0), 0);

	const totalTransferenciasEntrantes = movimientosFiltrados
		.filter((m) => m.tipo === "t" && m.idcuenta_destino === cuenta.id)
		.reduce((sum, m) => sum + (m.valor || 0), 0);

	const totalTransferenciasSalientes = movimientosFiltrados
		.filter((m) => m.tipo === "t" && m.idcuenta_origen === cuenta.id)
		.reduce((sum, m) => sum + (m.valor || 0), 0);

	const handleClose = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const editarMovimiento = async (movimiento: MovimientoDetalleCuenta): Promise<void> => {
		setIsLoadingEdit(true);

		try {
			const { data, error } = await supabase
				.from("movimientos")
				.select("*")
				.eq("id", movimiento.id)
				.single();

			if (error) throw error;
			setDataSelect((data as Movimiento) || movimiento);
			setOpenRegistro(true);
		} catch (error) {
			console.error("Error al cargar movimiento para edición:", error);
			setDataSelect(movimiento);
			setOpenRegistro(true);
		} finally {
			setIsLoadingEdit(false);
		}
	};

	const cerrarRegistro = (): void => {
		setOpenRegistro(false);
		void queryClient.invalidateQueries({ queryKey: ["movimientos-cuenta", cuenta.id] });
		void queryClient.invalidateQueries({ queryKey: ["saldo-anterior", cuenta.id] });
	};

	// Componente de calendario lineal para navegación de meses
	const handlePrevMonth = () => setDate(date.subtract(1, 'month'));
	const handleNextMonth = () => setDate(date.add(1, 'month'));
	const handleSetToday = () => setDate(dayjs());

	const saldoInicial = saldoAnterior || 0;
	const saldoFinal = saldoInicial + totalIngresos - totalGastos + totalTransferenciasEntrantes - totalTransferenciasSalientes;
	const isModalLoading = isLoadingMovs || isFetchingMovs || isLoadingSaldo || isFetchingSaldo || isLoadingEdit;
	const buildDetalleMovimiento = (movimiento: MovimientoDetalleCuenta, esTransferencia: boolean) => {
		if (esTransferencia) {
			return `${movimiento.cuenta_origen || "Origen"} -> ${movimiento.cuenta_destino || "Destino"}`;
		}

		return [movimiento.categoria, movimiento.cuenta].filter(Boolean).join(" · ");
	};

	return (
		<ModalOverlay onClick={handleClose}>
			<RegistrarMovimientos
				accion="Editar"
				dataSelect={dataSelect}
				state={openRegistro}
				setState={cerrarRegistro}
			/>
			<ModalContent onClick={(e) => e.stopPropagation()}>
				{isModalLoading && <Spinner label="Cargando detalle..." />}

				<div className="modal-header">
					<h2>
						<span>{cuenta.icono}</span>
						{cuenta.descripcion}
					</h2>
					<button onClick={onClose} disabled={isModalLoading}>✕</button>
				</div>

				<div className="modal-body">

					<div style={{ marginBottom: 8 }}>
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<CalendarioLinealCustom
								date={date}
								onPrev={handlePrevMonth}
								onNext={handleNextMonth}
								onToday={handleSetToday}
								disabled={isModalLoading}
							/>
						</div>
					</div>

					<div className="resumen-totales">
						<div className="total-row">
							<span className="label">Saldo mes anterior</span>
							<span className="valor">
								{isLoadingSaldo ? "..." : `${usuario?.moneda} ${saldoInicial.toFixed(2)}`}
							</span>
						</div>
						<div className="total-row">
							<span className="label">(+) Ingresos</span>
							<span className="valor ingreso">+{usuario?.moneda} {totalIngresos.toFixed(2)}</span>
						</div>
						<div className="total-row">
							<span className="label">(-) Gastos</span>
							<span className="valor gasto">-{usuario?.moneda} {totalGastos.toFixed(2)}</span>
						</div>
						{totalTransferenciasEntrantes > 0 && (
							<div className="total-row">
								<span className="label">(+) Transferencias recibidas</span>
								<span className="valor ingreso">+{usuario?.moneda} {totalTransferenciasEntrantes.toFixed(2)}</span>
							</div>
						)}
						{totalTransferenciasSalientes > 0 && (
							<div className="total-row">
								<span className="label">(-) Transferencias enviadas</span>
								<span className="valor gasto">-{usuario?.moneda} {totalTransferenciasSalientes.toFixed(2)}</span>
							</div>
						)}
						<div className="total-row main-balance">
							<span className="label">Saldo final</span>
							<span className="valor">
								{isLoadingSaldo || isLoadingMovs ? "..." : `${usuario?.moneda} ${saldoFinal.toFixed(2)}`}
							</span>
						</div>
					</div>

					<div className="info-periodo">
						<p>Movimientos del período: {dayjs(fechaInicio).format("DD MMM")} - {dayjs(fechaFin).format("DD MMM YYYY")}</p>
					</div>

					{isLoadingMovs ? (
						<div style={{ textAlign: "center", padding: "2rem" }}>
							<p>Cargando movimientos...</p>
						</div>
					) : movimientosFiltrados.length > 0 ? (
						<>
							<div className="movimientos-list">
								{movimientosFiltrados.map((movimiento) => {
									const esTransferencia = movimiento.tipo === "t";
									const esEntrada = esTransferencia
										? movimiento.idcuenta_destino === cuenta.id
										: movimiento.tipo === "i";
									const claseTipo = esTransferencia ? "transferencia" : (movimiento.tipo === "i" ? "ingreso" : "gasto");
									return (
										<div
											key={movimiento.id}
											className={`movimiento-item ${claseTipo}`}
										>
											<div className="item-info">
												<div className="item-descripcion">
													{esTransferencia ? `💸 ${movimiento.descripcion || "Transferencia"}` : movimiento.descripcion}
												</div>
												<div className="item-fecha">
													{dayjs(movimiento.fecha).format("DD MMM YYYY")}
												</div>
												<div className="item-meta">
													{buildDetalleMovimiento(movimiento, esTransferencia)}
												</div>
											</div>
											<div className="item-actions">
												<div className={`item-valor ${esEntrada ? "ingreso" : "gasto"}`}>
													{esEntrada ? "+" : "-"} {usuario?.moneda} {Math.abs(movimiento.valor || 0).toFixed(2)}
												</div>
												<button
													type="button"
													className="edit-button"
													onClick={() => void editarMovimiento(movimiento)}
													disabled={isModalLoading}
													aria-label={`Editar movimiento ${movimiento.descripcion || "sin descripción"}`}
													title="Editar movimiento"
												>
													<Pencil size={17} strokeWidth={2.3} />
												</button>
											</div>
										</div>
									);
								})}
							</div>
						</>
					) : (
						<div className="sin-movimientos">
							<p>No hay movimientos en este período</p>
						</div>
					)}
				</div>
			</ModalContent>
		</ModalOverlay>
	);

};

// Componente CalendarioLinealCustom para reutilizar el estilo de CalendarioLineal pero con props controladas
import { MdOutlineNavigateNext, MdArrowBackIos } from "react-icons/md";
import { ConvertirCapitalize } from "../../index";
const CalendarButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	color: inherit;
	cursor: pointer;
	padding: 0;

	&:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}
`;

const CalendarCurrentButton = styled(CalendarButton)`
	border: 2px solid #667df4;
	border-radius: 30px;
	padding: 10px;
	font-weight: 500;
`;

const CalendarioLinealCustom = ({ date, onPrev, onNext, onToday, disabled }: { date: any, onPrev: () => void, onNext: () => void, onToday: () => void, disabled?: boolean }) => (
	<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
		<CalendarButton type="button" onClick={onPrev} disabled={disabled} style={{ marginLeft: 20 }} aria-label="Mes anterior">
			<MdArrowBackIos size={30} />
		</CalendarButton>
		<CalendarCurrentButton type="button" onClick={onToday} disabled={disabled}>
			{ConvertirCapitalize(date.format('MMMM YYYY'))}
		</CalendarCurrentButton>
		<CalendarButton type="button" onClick={onNext} disabled={disabled} style={{ marginRight: 20 }} aria-label="Mes siguiente">
			<MdOutlineNavigateNext size={45} />
		</CalendarButton>
	</div>
);
