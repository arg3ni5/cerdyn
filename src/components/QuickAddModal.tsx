import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Loader2, X } from 'lucide-react';
import { styled } from 'styled-components';
import { useQuickAddStore } from '../store/useQuickAddStore';

export default function QuickAddModal() {
  const { isOpen, closeQuickAdd } = useQuickAddStore();
  const [isSaving, setIsSaving] = useState(false);
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Alimentación');

  const categorias = ['Alimentación', 'Transporte', 'Servicios', 'Ocio', 'Salud', 'Otros'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Tu lógica de inserción aquí
      await new Promise(resolve => setTimeout(resolve, 800));
      closeQuickAdd();
      setMonto('');
    } catch (err) {
      console.error(err);
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
                  <Label>Categoría</Label>
                  <GridCategorias>
                    {categorias.map((cat) => (
                      <CategoryLabel key={cat}>
                        <input
                          type="radio"
                          name="categoria"
                          checked={categoria === cat}
                          onChange={() => setCategoria(cat)}
                        />
                        <div className="radio-btn">{cat}</div>
                      </CategoryLabel>
                    ))}
                  </GridCategorias>
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

const GridCategorias = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const CategoryLabel = styled.label`
  position: relative;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .radio-btn {
    text-align: center;
    padding: 12px 8px;
    border-radius: 12px;
    border: 1px solid rgba(156, 163, 175, 0.2);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    transition: all 0.2s;
  }

  input:checked ~ .radio-btn {
    background-color: #e14e19;
    color: white;
    border-color: #e14e19;
  }

  &:hover .radio-btn {
    background-color: rgba(225, 78, 25, 0.05);
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