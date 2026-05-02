import { ChangeEvent, JSX, useMemo, useState } from 'react';
import { Header } from '../organismos/Header';
import { supabase } from '../../supabase/supabase.config';
import { showErrorMessage, showSuccessMessage } from '../../utils/messages';
import { downloadJson } from '../../utils/export/downloadUtils';
import {
  applyCategoryCorrection,
  CategoriaImportRef,
  CategoryIssueGroup,
  chunkRows,
  CuentaImportRef,
  downloadMovimientosImportTemplate,
  groupCategoryIssues,
  ParsedMovimientoRow,
  parseMovimientosWorkbook,
  validateImportRows,
} from '../../utils/import/movimientosExcelImport';
import {
  ActionRow,
  Card,
  Container,
  ErrorList,
  GroupCard,
  PreviewTableWrap,
  ProgressBar,
  StepList,
  SummaryGrid,
} from './ImportarMovimientosTemplate.styles';

interface ImportarMovimientosTemplateProps {
  userId: number;
  categorias: CategoriaImportRef[];
  cuentas: CuentaImportRef[];
}

type Step = 1 | 2 | 3;

const PREVIEW_LIMIT = 20;
const INSERT_CHUNK_SIZE = 200;

export const ImportarMovimientosTemplate = ({ userId, categorias, cuentas }: ImportarMovimientosTemplateProps): JSX.Element => {
  const [step, setStep] = useState<Step>(1);
  const [headerOpen, setHeaderOpen] = useState(false);
  const [rows, setRows] = useState<ParsedMovimientoRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFixes, setSelectedFixes] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });

  const validation = useMemo(() => validateImportRows(rows, categorias, cuentas, userId), [rows, categorias, cuentas, userId]);
  const categoryGroups = useMemo(() => groupCategoryIssues(validation.issues, rows), [validation.issues, rows]);
  const previewRows = rows.slice(0, PREVIEW_LIMIT);
  const blockingIssues = validation.issues.length > 0;

  const categoriesByType = useMemo(() => {
    const result: Record<'i' | 'g', CategoriaImportRef[]> = { i: [], g: [] };
    categorias.forEach((item) => {
      if (item.idusuario !== userId) return;
      if (item.tipo === 'i' || item.tipo === 'ingreso') result.i.push(item);
      if (item.tipo === 'g' || item.tipo === 'gasto') result.g.push(item);
    });
    return result;
  }, [categorias, userId]);

  const stepTo = (next: Step): void => {
    if (next === 2 && rows.length === 0) return;
    if (next === 3 && rows.length === 0) return;
    setStep(next);
  };

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsParsing(true);
      const buffer = await file.arrayBuffer();
      const parsedRows = await parseMovimientosWorkbook(buffer);
      setRows(parsedRows);
      setSelectedFixes({});
      setStep(2);
    } catch (error) {
      showErrorMessage((error as Error).message || 'No se pudo leer el archivo Excel.');
    } finally {
      setIsParsing(false);
      event.target.value = '';
    }
  };

  const applyFix = (group: CategoryIssueGroup): void => {
    const selectedCategory = selectedFixes[group.key];
    if (!selectedCategory) {
      showErrorMessage('Selecciona una categoría antes de aplicar el cambio.');
      return;
    }
    setRows((prev) => applyCategoryCorrection(prev, group, selectedCategory));
  };

  const importRows = async (): Promise<void> => {
    if (blockingIssues) {
      showErrorMessage('Aún hay errores por resolver antes de importar.');
      return;
    }

    const payload = validation.rows.map((row) => ({
      fecha: row.fecha,
      descripcion: row.descripcion || null,
      tipo: row.tipo as 'i' | 'g',
      valor: row.valor,
      idcategoria: row.idcategoria,
      idcuenta: row.idcuenta,
      estado: false,
      idusuario: userId,
    }));

    const chunks = chunkRows(payload, INSERT_CHUNK_SIZE);
    let inserted = 0;
    setProgress({ done: 0, total: payload.length, failed: 0 });
    setIsImporting(true);

    for (const chunk of chunks) {
      const { error } = await supabase.from('movimientos').insert(chunk as never);
      if (error) {
        setIsImporting(false);
        setProgress({ done: inserted, total: payload.length, failed: chunk.length });
        showErrorMessage(`Error al importar: ${error.message}`);
        return;
      }
      inserted += chunk.length;
      setProgress({ done: inserted, total: payload.length, failed: 0 });
    }

    setIsImporting(false);
    showSuccessMessage(`Importación completada. Se insertaron ${inserted} movimientos.`);
    setRows([]);
    setSelectedFixes({});
    setStep(1);
    setProgress({ done: 0, total: 0, failed: 0 });
  };

  return (
    <Container>
      <header className='header'>
        <Header stateConfig={{ state: headerOpen, setState: () => setHeaderOpen((prev) => !prev) }} />
      </header>

      <section className='hero'>
        <Card>
          <h1>Importar movimientos desde Excel</h1>
          <p>Flujo guiado: Subir archivo, validar datos y resolver errores antes de importar.</p>
          <StepList>
            <button type='button' className={step === 1 ? 'active' : ''} onClick={() => stepTo(1)}>1. Subir</button>
            <button type='button' className={step === 2 ? 'active' : ''} onClick={() => stepTo(2)}>2. Previsualizar</button>
            <button type='button' className={step === 3 ? 'active' : ''} onClick={() => stepTo(3)}>3. Resolver e importar</button>
          </StepList>
          <ActionRow>
            <button
              type='button'
              className='secondary'
              onClick={async () => await downloadMovimientosImportTemplate(categorias, cuentas)}
            >
              Descargar plantilla oficial
            </button>
            <label>
              <button type='button' className='primary' disabled={isParsing}>
                {isParsing ? 'Procesando archivo...' : 'Subir archivo XLSX'}
              </button>
              <input
                type='file'
                accept='.xlsx'
                onChange={(event) => void onUploadFile(event)}
                style={{ display: 'none' }}
              />
            </label>
          </ActionRow>
        </Card>
      </section>

      <section className='panel'>
        <Card>
          <h2>Resumen de validación</h2>
          <SummaryGrid>
            <div>
              <span>Total filas</span>
              <strong>{rows.length}</strong>
            </div>
            <div>
              <span>Válidas</span>
              <strong>{validation.validCount}</strong>
            </div>
            <div>
              <span>Con error</span>
              <strong>{validation.invalidCount}</strong>
            </div>
            <div>
              <span>Transferencias detectadas</span>
              <strong>{validation.transferCount}</strong>
            </div>
          </SummaryGrid>
          {validation.transferCount > 0 && (
            <ErrorList>
              <li>Se detectaron transferencias. Este import solo permite ingreso y gasto.</li>
            </ErrorList>
          )}
          {validation.issues.length > 0 && (
            <ActionRow>
              <button type='button' className='secondary' onClick={() => setStep(3)}>Resolver errores</button>
              <button
                type='button'
                className='secondary'
                onClick={() => downloadJson(validation.issues, 'errores-importacion-movimientos.json')}
              >
                Descargar errores
              </button>
            </ActionRow>
          )}
        </Card>
      </section>

      <section className='main'>
        <Card>
          <h2>Previsualización ({Math.min(rows.length, PREVIEW_LIMIT)} primeras filas)</h2>
          <PreviewTableWrap>
            <table>
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>idcategoria</th>
                  <th>idcuenta</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td>{row.rowNumber}</td>
                    <td>{row.fecha}</td>
                    <td>{row.descripcion}</td>
                    <td>{row.tipoRaw}</td>
                    <td>{row.valor ?? ''}</td>
                    <td>{row.idcategoria ?? ''}</td>
                    <td>{row.idcuenta ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PreviewTableWrap>
        </Card>

        {step === 3 && (
          <Card>
            <h2>Resolver categorías en bloque</h2>
            {categoryGroups.length === 0 && <p>No hay errores agrupables de categoría.</p>}
            {categoryGroups.map((group) => {
              const options = group.tipo ? categoriesByType[group.tipo] : [];
              return (
                <GroupCard key={group.key}>
                  <div>
                    <strong>{group.label}</strong>
                    <p>Afecta {group.count} fila(s): {group.rowNumbers.join(', ')}</p>
                  </div>
                  <select
                    value={selectedFixes[group.key] ?? ''}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setSelectedFixes((prev) => ({ ...prev, [group.key]: Number.isFinite(value) ? value : 0 }));
                    }}
                  >
                    <option value=''>Seleccionar categoría</option>
                    {options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.id} - {option.descripcion ?? 'Sin descripción'}
                      </option>
                    ))}
                  </select>
                  <ActionRow>
                    <button type='button' className='secondary' onClick={() => applyFix(group)}>
                      Aplicar a todas ({group.count})
                    </button>
                  </ActionRow>
                </GroupCard>
              );
            })}

            <ActionRow>
              <button type='button' className='primary' disabled={isImporting || blockingIssues} onClick={() => void importRows()}>
                {isImporting ? 'Importando...' : 'Importar movimientos'}
              </button>
              <button type='button' className='secondary' onClick={() => setStep(2)}>
                Volver a previsualización
              </button>
            </ActionRow>

            {progress.total > 0 && (
              <>
                <p>
                  Progreso: {progress.done}/{progress.total} {progress.failed > 0 ? `(fallidos: ${progress.failed})` : ''}
                </p>
                <ProgressBar>
                  <div style={{ width: `${Math.min((progress.done / progress.total) * 100, 100)}%` }} />
                </ProgressBar>
              </>
            )}

            {validation.issues.length > 0 && (
              <>
                <h3>Errores pendientes</h3>
                <ErrorList>
                  {validation.issues.slice(0, 30).map((issue) => (
                    <li key={`${issue.rowNumber}-${issue.code}-${issue.message}`}>{issue.message}</li>
                  ))}
                </ErrorList>
              </>
            )}
          </Card>
        )}
      </section>
    </Container>
  );
};
