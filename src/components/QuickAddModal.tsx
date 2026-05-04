import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Loader2, X } from 'lucide-react';
import { styled } from 'styled-components';
import { useQuickAddStore } from '../store/useQuickAddStore';
import { useMovimientosStore, useCuentaStore, useCategoriasStore, useUsuariosStore, showErrorMessage, Categoria, Cuenta } from '../index';
import { MovimientoInsert } from '../supabase/crudMovimientos';

export default function QuickAddModal() {
  const { isOpen, closeQuickAdd } = useQuickAddStore();
  const { insertarMovimientos } = useMovimientosStore();
  const { mostrarCuentas } = useCuentaStore();
  const { mostrarCategorias } = useCategoriasStore();
  const { idusuario } = useUsuariosStore();

  const [isSaving, setIsSaving] = useState(false);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [cuentaTexto, setCuentaTexto] = useState('');
  const [categoriaTexto, setCategoriaTexto] = useState('');

  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Cargar cuentas y categorías al abrir
  useEffect(() => {
    const loadData = async () => {
      try {
        if (idusuario && isOpen) {
          const cuentasData = await mostrarCuentas({ idusuario } as Cuenta);
          setCuentas(cuentasData);
          if (cuentasData.length > 0 && !cuentaSeleccionada) {
            setCuentaSeleccionada(cuentasData[0]);
            setCuentaTexto(cuentasData[0].descripcion ?? '');
          }

          const categoriasData = await mostrarCategorias({ tipo: 'g', idusuario });
          setCategorias(categoriasData);
          if (categoriasData.length > 0 && !categoriaSeleccionada) {
            setCategoriaSeleccionada(categoriasData[0]);
            setCategoriaTexto(categoriasData[0].descripcion ?? '');
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        showErrorMessage('Error al cargar datos');
      }
    };

    loadData();
  }, [idusuario, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!monto || parseFloat(monto) <= 0) {
        showErrorMessage('Por favor ingresa un monto válido');
        setIsSaving(false);
        return;
      }

      if (!cuentaSeleccionada) {
        showErrorMessage('Por favor selecciona una cuenta');
        setIsSaving(false);
        return;
      }

      if (!categoriaSeleccionada) {
        showErrorMessage('Por favor selecciona una categoría');
        setIsSaving(false);
        return;
      }

      const movimiento: MovimientoInsert = {
        descripcion: descripcion || categoriaSeleccionada.descripcion,
        estado: true,
        fecha: new Date().toISOString().slice(0, 10),
        idcategoria: categoriaSeleccionada.id,
        idcuenta: cuentaSeleccionada.id,
        tipo: 'g',
        valor: parseFloat(monto),
      };

      await insertarMovimientos(movimiento);
      closeQuickAdd();
      setMonto('');
      setDescripcion('');
      setCuentaSeleccionada(cuentas.length > 0 ? cuentas[0] : null);
      setCategoriaSeleccionada(categorias.length > 0 ? categorias[0] : null);
      setCuentaTexto(cuentas.length > 0 ? (cuentas[0].descripcion ?? '') : '');
      setCategoriaTexto(categorias.length > 0 ? (categorias[0].descripcion ?? '') : '');
    } catch (err) {
      console.error(err);
      showErrorMessage('Error al guardar el movimiento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay>
          <ModalContainer
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <CloseButton onClick={closeQuickAdd} type="button">
              <X size={24} />
            </CloseButton>

            <Content>
              <Title>Nuevo Gasto</Title>

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Monto</Label>
                  <InputWrapper>
                    <CurrencySymbol>₡</CurrencySymbol>
                    <InputMonto
                      required
                      autoFocus
                      inputMode="decimal"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>Descripción</Label>
                  <InputDescripcion
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej: Almuerzo, gasolina..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Cuenta</Label>
                  <FilterInput
                    list="cuentas-list"
                    value={cuentaTexto}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCuentaTexto(value);
                      const cuenta = cuentas.find((c) => (c.descripcion ?? '').toLowerCase() === value.toLowerCase());
                      setCuentaSeleccionada(cuenta || null);
                    }}
                    placeholder="Escribe para filtrar cuentas..."
                  />
                  <datalist id="cuentas-list">
                    {cuentas.map((cuenta) => (
                      <option key={cuenta.id} value={cuenta.descripcion ?? ''} />
                    ))}
                  </datalist>
                </FormGroup>

                <FormGroup>
                  <Label>Categoría</Label>
                  <FilterInput
                    list="categorias-list"
                    value={categoriaTexto}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCategoriaTexto(value);
                      const categoria = categorias.find((c) => (c.descripcion ?? '').toLowerCase() === value.toLowerCase());
                      setCategoriaSeleccionada(categoria || null);
                    }}
                    placeholder="Escribe para filtrar categorías..."
                  />
                  <datalist id="categorias-list">
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.descripcion ?? ''} />
                    ))}
                  </datalist>
                </FormGroup>

                <SubmitButton type="submit" disabled={isSaving || !monto}>
                  {isSaving ? <Loader2 className="spin" size={20} /> : <Save size={20} />}
                  {isSaving ? 'Registrando...' : 'Registrar Gasto'}
                </SubmitButton>
              </form>
            </Content>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

// --- Estilos con styled-components ---

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 24px;
  }
`;

const ModalContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.bgtotal};
  width: 100%;
  max-width: 500px;
  border-radius: 32px 32px 0 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  color: ${({ theme }) => theme.text || '#1f2937'};

  @media (min-width: 640px) {
    border-radius: 40px;
    height: auto;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s;

  &:hover {
    color: #e14e19;
    background-color: rgba(225, 78, 25, 0.05);
  }
`;

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
  margin-top: 16px;

  @media (min-width: 640px) {
    padding: 40px;
    margin-top: 0;
  }
`;

const Title = styled.h3`
  font-size: 24px;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 32px;
  line-height: 1.2;

  @media (min-width: 640px) {
    font-size: 30px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
  padding-left: 4px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-weight: 700;
  font-size: 20px;
`;

const InputMonto = styled.input`
  width: 100%;
  background-color: transparent;
  border: 1px solid rgba(156, 163, 175, 0.2);
  padding: 16px 24px 16px 48px;
  border-radius: 16px;
  outline: none;
  font-weight: 900;
  font-size: 24px;
  color: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #e14e19;
  }
`;

const InputDescripcion = styled.input`
  width: 100%;
  background-color: transparent;
  border: 1px solid rgba(156, 163, 175, 0.2);
  padding: 12px 16px;
  border-radius: 12px;
  outline: none;
  font-weight: 500;
  font-size: 14px;
  color: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #e14e19;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const FilterInput = styled.input`
  width: 100%;
  background-color: transparent;
  border: 1px solid rgba(156, 163, 175, 0.2);
  padding: 12px 16px;
  border-radius: 12px;
  outline: none;
  font-weight: 500;
  font-size: 14px;
  color: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    border-color: #e14e19;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: #e14e19;
  color: white;
  padding: 16px;
  border-radius: 16px;
  font-weight: 900;
  font-size: 16px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    transform: scale(0.98);
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;