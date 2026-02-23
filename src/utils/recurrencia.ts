import dayjs from 'dayjs';

export type ModoRecurrencia = 'intervalo' | 'mensual';
export type PoliticaInicioMensual = 'este_mes' | 'proximo_mes';

/**
 * Generates dates separated by a fixed number of days.
 * @param fechaBase  Start date in YYYY-MM-DD format
 * @param intervaloDias  Number of days between occurrences
 * @param repeticiones  Total number of occurrences to generate
 */
export function generarFechasIntervalo(
  fechaBase: string,
  intervaloDias: number,
  repeticiones: number
): string[] {
  const base = dayjs(fechaBase);
  const fechas: string[] = [];
  for (let i = 0; i < repeticiones; i++) {
    fechas.push(base.add(i * intervaloDias, 'day').format('YYYY-MM-DD'));
  }
  return fechas;
}

/**
 * Generates dates for day X of each month.
 * If the day doesn't exist in a month (e.g. 31 in April) the last day of the
 * month is used instead.
 *
 * @param diaMes       Target day of month (1-31)
 * @param repeticiones Total number of occurrences to generate
 * @param politica     'este_mes' | 'proximo_mes'
 *                      - 'este_mes':   start from the current month; if the
 *                        target day has already passed, move to next month.
 *                      - 'proximo_mes': always start from next month.
 */
export function generarFechasMensual(
  diaMes: number,
  repeticiones: number,
  politica: PoliticaInicioMensual
): string[] {
  const hoy = dayjs();
  let mesInicio: dayjs.Dayjs;

  if (politica === 'proximo_mes') {
    mesInicio = hoy.add(1, 'month').startOf('month');
  } else {
    // 'este_mes': use this month, but if target day already passed go to next
    const candidato = hoy.date(Math.min(diaMes, hoy.daysInMonth()));
    mesInicio = candidato.isBefore(hoy, 'day')
      ? hoy.add(1, 'month').startOf('month')
      : hoy.startOf('month');
  }

  const fechas: string[] = [];
  for (let i = 0; i < repeticiones; i++) {
    const mes = mesInicio.add(i, 'month');
    const dia = Math.min(diaMes, mes.daysInMonth());
    fechas.push(mes.date(dia).format('YYYY-MM-DD'));
  }
  return fechas;
}
