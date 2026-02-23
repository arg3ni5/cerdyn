import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cuenta, Movimiento, useMovimientosStore, useUsuariosStore, CalendarioLineal } from "../../index";
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
			margin-bottom: 1.5rem;
			font-size: 0.9rem;
			color: ${({ theme }) => theme.text};
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
			margin-top: 2rem;
			padding-top: 1.5rem;
			border-top: 1px solid ${({ theme }) => theme.border || 'rgba(0,0,0,0.1)'};
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1rem;

			.total-item {
				text-align: center;

				.label {
					font-size: 0.85rem;
					color: ${({ theme }) => theme.textSecondary || 'rgba(0,0,0,0.6)'};
					margin-bottom: 0.25rem;
					background: ${({ theme }) => theme.colorSubtitle || 'rgba(0,0,0,0.05)'};
					padding: 0.25rem 0.5rem;
					border-radius: 4px;
				}

				.valor {
					font-size: 1.3rem;
					font-weight: 700;

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

	// Obtener movimientos del mes
	const { data: movimientos, isLoading } = useQuery<Movimiento[], Error>({
		queryKey: ["movimientos-cuenta", cuenta.id, fechaInicio, fechaFin],
		queryFn: async () => {
			try {
				const { data, error } = await supabase
					.from("movimientos")
					.select("*")
					.eq("idcuenta", cuenta.id)
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

	const handleClose = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	// Componente de calendario lineal para navegación de meses
	const handlePrevMonth = () => setDate(date.subtract(1, 'month'));
	const handleNextMonth = () => setDate(date.add(1, 'month'));
	const handleSetToday = () => setDate(dayjs());

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
					<div className="info-periodo" style={{ paddingBottom: 0 }}>
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
						<div style={{ marginTop: 8 }}>
							Movimientos del período: {dayjs(fechaInicio).format("DD MMM")} - {dayjs(fechaFin).format("DD MMM YYYY")}
						</div>
					</div>

					{isLoading ? (
						<div style={{ textAlign: "center", padding: "2rem" }}>
							<p>Cargando movimientos...</p>
						</div>
					) : movimientosFiltrados.length > 0 ? (
						<>
							<div className="movimientos-list">
								{movimientosFiltrados.map((movimiento) => (
									<div
										key={movimiento.id}
										className={`movimiento-item ${movimiento.tipo === "i" ? "ingreso" : "gasto"}`}
									>
										<div className="item-info">
											<div className="item-descripcion">{movimiento.descripcion}</div>
											<div className="item-fecha">
												{dayjs(movimiento.fecha).format("DD MMM YYYY")}
											</div>
										</div>
										<div className={`item-valor ${movimiento.tipo === "i" ? "ingreso" : "gasto"}`}>
											{movimiento.tipo === "i" ? "+" : "-"} {usuario?.moneda} {Math.abs(movimiento.valor || 0).toFixed(2)}
										</div>
									</div>
								))}
							</div>

							<div className="resumen-totales">
								<div className="total-item">
									<div className="label">Ingresos</div>
									<div className="valor ingreso">
										+{usuario?.moneda} {totalIngresos.toFixed(2)}
									</div>
								</div>
								<div className="total-item">
									<div className="label">Gastos</div>
									<div className="valor gasto">
										-{usuario?.moneda} {totalGastos.toFixed(2)}
									</div>
								</div>
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
