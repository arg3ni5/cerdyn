import { Plus } from 'lucide-react';
import { styled } from 'styled-components';
import { useLocation } from 'react-router-dom';
import { useQuickAddStore } from '../store/useQuickAddStore';

export default function FloatingAddButton() {
  const openQuickAdd = useQuickAddStore((state) => state.openQuickAdd);
  const { pathname } = useLocation();

  if (pathname === '/movimientos') return null;

  return (
    <FabButton onClick={openQuickAdd}>
      <Plus size={28} strokeWidth={2.5} />
    </FabButton>
  );
}

const FabButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 50;
  background-color: #e14e19; /* Tu color principal */
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(225, 78, 25, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    background-color: #c44214;
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 768px) {
    bottom: 32px;
    right: 32px;
  }
`;
