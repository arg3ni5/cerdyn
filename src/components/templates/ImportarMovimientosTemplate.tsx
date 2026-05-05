import { ChangeEvent, JSX, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, Download, FileSpreadsheet, Upload, Wrench } from 'lucide-react';
import { Header } from '../organismos/Header';
import { supabase } from '../../supabase/supabase.config';
import type { Database } from '../../types/supabase';
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
  normalizeTipo,
  parseMovimientosWorkbook,
  validateImportRows,
} from '../../utils/import/movimientosExcelImport';
import {
  ActionRow,
  Card,
  Container,
  ErrorList,
  GroupCard,
  HealthBadge,
  ImportHeroCard,
  PreviewTableWrap,
  ProgressBar,
  SectionHeader,
  StatCard,
  StatusPanel,
  StepList,
  SummaryGrid,
  TypeChip,
  UploadZone,
} from './ImportarMovimientosTemplate.styles';

interface ImportarMovimientosTemplateProps {
  userId: number;
  categorias: CategoriaImportRef[];
  cuentas: CuentaImportRef[];
}

type Step = 1 | 2 | 3;

const PREVIEW_LIMIT = 20;
const INSERT_CHUNK_SIZE = 200;
type MovimientoImportPayload = Database['public']['Tables']['movimientos']['Insert'];

export const ImportarMovimientosTemplate = ({ userId, categorias, cuentas }: ImportarMovimientosTemplateProps): JSX.Element => {
  const [step, setStep] = useState<Step>(1);
  const [headerOpen, setHeaderOpen] = useState(false);
  const [rows, setRows] = useState<ParsedMovimientoRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFixes, setSelectedFixes] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validation = useMemo(() => validateImportRows(rows, categorias, cuentas, userId), [rows, categorias, cuentas, userId]);
  const categoryGroups = useMemo(() => groupCategoryIssues(validation.issues, rows), [validation.issues, rows]);
  const previewRows = rows.slice(0, PREVIEW_LIMIT);
  const blockingIssues = validation.issues.length > 0;
  const healthState = rows.length === 0 ? 'empty' : blockingIssues ? 'issues' : 'ready';
  const healthText = rows.length === 0 ? 'Sin archivo cargado' : blockingIssues ? 'Requiere revisión' : 'Listo para importar';

  const categoriesByType = useMemo(() => {
    const result: Record<'i' | 'g', CategoriaImportRef[]> = { i: [], g: [] };
    categorias.forEach((item) => {
      if (item.idusuario !== userId) return;
      const tipo = normalizeTipo(item.tipo).value;
      if (tipo === 'i') result.i.push(item);
      if (tipo === 'g') result.g.push(item);
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

    if (validation.rows.length === 0) {
      showErrorMessage('No hay filas válidas para importar.');
      return;
    }

    const payload: MovimientoImportPayload[] = validation.rows.map((row) => (
      row.tipo === 't'
        ? {
            fecha: row.fecha,
            descripcion: row.descripcion || null,
            tipo: 't',
            valor: row.valor,
            idcategoria: null,
            idcuenta: null,
            idcuenta_origen: row.idcuenta_origen,
            idcuenta_destino: row.idcuenta_destino,
            estado: false,
            idusuario: userId,
          }
        : {
            fecha: row.fecha,
            descripcion: row.descripcion || null,
            tipo: row.tipo as 'i' | 'g',
            valor: row.valor,
            idcategoria: row.idcategoria,
            idcuenta: row.idcuenta,
            idcuenta_origen: null,
            idcuenta_destino: null,
            estado: false,
            idusuario: userId,
          }
    ));

    const chunks = chunkRows(payload, INSERT_CHUNK_SIZE);
    let inserted = 0;
    setProgress({ done: 0, total: payload.length, failed: 0 });
    setIsImporting(true);

    for (const chunk of chunks) {
      const { error } = await supabase.from('movimientos').insert(chunk);
      if (error) {
        setProgress({ done: inserted, total: payload.length, failed: chunk.length });
        showErrorMessage(`Error al importar: ${error.message}`);
        break;
      }
      inserted += chunk.length;
      setProgress({ done: inserted, total: payload.length, failed: 0 });
    }

    setIsImporting(false);

    if (inserted !== payload.length) return;

    showSuccessMessage(`Importación completada. Se insertaron ${inserted} movimientos.`);
    setRows([]);
    setSelectedFixes({});
    setStep(1);
    setProgress({ done: 0, total: 0, failed: 0 });
  };

  return (
    <Container>
      <header className='header'>
        <Header
          stateConfig={{ state: headerOpen, setState: () => setHeaderOpen((prev) => !prev) }}
          eyebrow='Movimientos'
          title='Importar'
        />
      </header>

      <section className='hero'>
        <ImportHeroCard>
          <div className='hero-title'>
            <h1>Importar movimientos desde Excel</h1>
            <p>Subí ingresos, gastos y transferencias internas con validación previa antes de guardar.</p>
          </div>
          <StepList>
            <button type='button' className={step === 1 ? 'active' : ''} onClick={() => stepTo(1)}>
              <span className='step-index'>1</span>
              <span>Subir</span>
            </button>
            <button type='button' className={step === 2 ? 'active' : ''} onClick={() => stepTo(2)}>
              <span className='step-index'>2</span>
              <span>Previsualizar</span>
            </button>
            <button type='button' className={step === 3 ? 'active' : ''} onClick={() => stepTo(3)}>
              <span className='step-index'>3</span>
              <span>Resolver e importar</span>
            </button>
          </StepList>
          <UploadZone>
            <div className='upload-icon'>
              <FileSpreadsheet />
            </div>
            <div className='upload-copy'>
              <strong>{rows.length > 0 ? `${rows.length} filas cargadas` : 'Plantilla compatible con ingresos, gastos y transferencias'}</strong>
              <span>
                {rows.length > 0
                  ? `${validation.validCount} listas, ${validation.invalidCount} con detalle por resolver.`
                  : 'Usá las columnas de cuenta normal para ingresos/gastos y origen/destino para transferencias.'}
              </span>
            </div>
          </UploadZone>
          <ActionRow>
            <button
              type='button'
              className='secondary'
              onClick={async () => await downloadMovimientosImportTemplate(categorias, cuentas)}
            >
              <Download size={18} />
              Descargar plantilla oficial
            </button>
            <button
              type='button'
              className='primary'
              disabled={isParsing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              {isParsing ? 'Procesando archivo...' : 'Subir archivo XLSX'}
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='.xlsx'
              onChange={(event) => void onUploadFile(event)}
              style={{ display: 'none' }}
            />
          </ActionRow>
        </ImportHeroCard>
        <StatusPanel>
          <div className='status-heading'>
            <div>
              <span className='status-kicker'>Estado del import</span>
              <h2 className='status-title'>{healthText}</h2>
            </div>
            <div className='status-icon'>
              {healthState === 'ready' ? <CheckCircle2 /> : healthState === 'issues' ? <AlertTriangle /> : <ArrowRightLeft />}
            </div>
          </div>
          <HealthBadge $state={healthState}>
            {healthState === 'ready' ? <CheckCircle2 size={16} /> : healthState === 'issues' ? <AlertTriangle size={16} /> : <FileSpreadsheet size={16} />}
            {healthText}
          </HealthBadge>
          <p className='status-note'>
            {healthState === 'ready'
              ? 'Todo el lote puede guardarse. Las transferencias internas no afectan el balance global.'
              : healthState === 'issues'
                ? 'Resolvé los errores pendientes antes de importar el lote.'
                : 'Descargá la plantilla o subí un XLSX para iniciar la validación.'}
          </p>
          <SummaryGrid>
            <StatCard>
              <span>Total filas</span>
              <strong>{rows.length}</strong>
              <small>Registros leídos</small>
            </StatCard>
            <StatCard $tone='success'>
              <span>Válidas</span>
              <strong>{validation.validCount}</strong>
              <small>Sin bloqueos</small>
            </StatCard>
            <StatCard $tone='warning'>
              <span>Con error</span>
              <strong>{validation.invalidCount}</strong>
              <small>Necesitan ajuste</small>
            </StatCard>
            <StatCard $tone='transfer'>
              <span>Transferencias</span>
              <strong>{validation.transferCount}</strong>
              <small>Entre cuentas</small>
            </StatCard>
          </SummaryGrid>
          {validation.issues.length > 0 && (
            <ActionRow>
              <button type='button' className='secondary' onClick={() => setStep(3)}>
                <Wrench size={18} />
                Resolver errores
              </button>
              <button
                type='button'
                className='secondary'
                onClick={() => downloadJson(validation.issues, 'errores-importacion-movimientos.json')}
              >
                <Download size={18} />
                Descargar errores
              </button>
            </ActionRow>
          )}
        </StatusPanel>
      </section>

      <section className='main'>
        <Card>
          <SectionHeader>
            <div>
              <h2>Previsualización</h2>
              <p>{Math.min(rows.length, PREVIEW_LIMIT)} primeras filas del archivo cargado</p>
            </div>
            <HealthBadge $state={healthState}>{healthText}</HealthBadge>
          </SectionHeader>
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
                  <th>origen</th>
                  <th>destino</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td>{row.rowNumber}</td>
                    <td>{row.fecha}</td>
                    <td>{row.descripcion}</td>
                    <td>
                      <TypeChip $kind={row.tipo ?? 'unknown'}>{row.tipoRaw || 'Sin tipo'}</TypeChip>
                    </td>
                    <td>{row.valor ?? ''}</td>
                    <td>{row.idcategoria ?? ''}</td>
                    <td>{row.idcuenta ?? ''}</td>
                    <td>{row.idcuenta_origen ?? ''}</td>
                    <td>{row.idcuenta_destino ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PreviewTableWrap>
        </Card>

        {step === 3 && (
          <Card>
            <SectionHeader>
              <div>
                <h2>Resolver categorías en bloque</h2>
                <p>Aplicá una corrección a todas las filas con el mismo problema.</p>
              </div>
            </SectionHeader>
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
                      <Wrench size={18} />
                      Aplicar a todas ({group.count})
                    </button>
                  </ActionRow>
                </GroupCard>
              );
            })}

            <ActionRow>
              <button type='button' className='primary' disabled={isImporting || blockingIssues} onClick={() => void importRows()}>
                <Upload size={18} />
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
