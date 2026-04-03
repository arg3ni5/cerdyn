import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cuenta, Movimiento, useUsuariosStore, ObtenerSaldoCuentaAFecha } from "../../index";
import { supabase } from "../../supabase/supabase.config";
import dayjs from "dayjs";
import styled from "styled-components";

interface MovimientosCuentaModalProps {
	cuenta: Cuenta;
	onClose: () => void;
}

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

				&.ingreso {
					border-left-color: #10b981;
					background: rgba(16, 185, 129, 0.05);
				}

				&.gasto {
					border-left-color: #ef4444;
					background: rgba(239, 68, 68, 0.05);
				}

				&.transferencia {
					border-left-color: #3b82f6;
					background: rgba(59, 130, 246, 0.05);
				}

				.item-info {
					flex: 1;

					.item-descripcion {
						font-weight: 500;
						margin-bottom: 0.25rem;
					}

					.item-fecha {
						font-size: 0.85rem;
						color: ${({ theme }) => theme.textSecondary};
					}
				}

				.item-valor {
					font-weight: 600;
					font-size: 1.1rem;

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
			color: ${({ theme }) => theme.textSecondary || 'rgba(0,0,0,0.6)'};

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

				&.main-balance {
					margin-top: 0.5rem;
					padding-top: 0.75rem;
					border-top: 2px solid ${({ theme }) => theme.border || 'rgba(0,0,0,0.1)'};
					font-weight: 700;
					font-size: 1.2rem;
				}

				.label {
					font-size: 0.95rem;
					color: ${({ theme }) => theme.textSecondary || 'rgba(0,0,0,0.6)'};
				}

				.valor {
					font-weight: 600;

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
	const [movimientosFiltrados, setMovimientosFiltrados] = useState<Movimiento[]>([]);
	const now = dayjs();
	const [date, setDate] = useState(now);
	const fechaInicio = date.startOf("month").format("YYYY-MM-DD");
	const fechaFin = date.endOf("month").format("YYYY-MM-DD");

	// Obtener movimientos del mes (incluyendo transferencias)
	const { data: movimientos, isLoading: isLoadingMovs } = useQuery<Movimiento[], Error>({
		queryKey: ["movimientos-cuenta", cuenta.id, fechaInicio, fechaFin],
		queryFn: async () => {
			try {
				const cuentaId = Number(cuenta.id);
				if (!Number.isInteger(cuentaId) || cuentaId <= 0) {
					return [];
				}
				const { data, error } = await supabase
					.from("movimientos")
					.select("*")
					.or(`idcuenta.eq.${cuentaId},idcuenta_origen.eq.${cuentaId},idcuenta_destino.eq.${cuentaId}`)
					.eq("estado", true)
					.gte("fecha", fechaInicio)
					.lte("fecha", fechaFin)
					.order("fecha", { ascending: false });

				if (error) throw error;
				return data as Movimiento[];
			} catch (error) {
				console.error("Error al cargar movimientos:", error);
				return [];
			}
		},
		enabled: !!cuenta.id,
	});

	const { data: saldoAnterior, isLoading: isLoadingSaldo } = useQuery({
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

	// Componente de calendario lineal para navegación de meses
	const handlePrevMonth = () => setDate(date.subtract(1, 'month'));
	const handleNextMonth = () => setDate(date.add(1, 'month'));
	const handleSetToday = () => setDate(dayjs());

	const saldoInicial = saldoAnterior || 0;
	const saldoFinal = saldoInicial + totalIngresos - totalGastos + totalTransferenciasEntrantes - totalTransferenciasSalientes;

	return (
		<ModalOverlay onClick={handleClose}>
			<ModalContent onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>
						<span>{cuenta.icono}</span>
						{cuenta.descripcion}
					</h2>
					<button onClick={onClose}>✕</button>
				</div>

				<div className="modal-body">

					<div style={{ marginBottom: 8 }}>
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<CalendarioLinealCustom
								date={date}
								onPrev={handlePrevMonth}
								onNext={handleNextMonth}
								onToday={handleSetToday}
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
											</div>
											<div className={`item-valor ${esEntrada ? "ingreso" : "gasto"}`}>
												{esEntrada ? "+" : "-"} {usuario?.moneda} {Math.abs(movimiento.valor || 0).toFixed(2)}
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
const CalendarioLinealCustom = ({ date, onPrev, onNext, onToday }: { date: any, onPrev: () => void, onNext: () => void, onToday: () => void }) => (
	<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
		<span onClick={onPrev} style={{ cursor: 'pointer', marginLeft: 20 }}>
			<MdArrowBackIos size={30} />
		</span>
		<section style={{ border: '2px solid #667df4', borderRadius: 30, textAlign: 'center', display: 'flex', alignItems: 'center', padding: 10 }}>
			<p onClick={onToday} style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>{ConvertirCapitalize(date.format('MMMM YYYY'))}</p>
		</section>
		<span onClick={onNext} style={{ cursor: 'pointer', marginRight: 20 }}>
			<MdOutlineNavigateNext size={45} />
		</span>
	</div>
);
