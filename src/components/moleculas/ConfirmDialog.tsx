import styled from 'styled-components'
import { motion } from 'motion/react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

export function ConfirmDialog ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}: ConfirmDialogProps) {
  const accentColor =
    variant === 'danger' ? '#ef4444' : variant === 'warning' ? '#f59e0b' : '#3485eb'

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <Card
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <CloseBtn
          type="button"
          aria-label="Cerrar"
          onClick={onCancel}
        >
          <X size={18} />
        </CloseBtn>

        <IconCircle $color={accentColor}>
          <AlertTriangle size={28} />
        </IconCircle>

        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>

        <Actions>
          <CancelBtn type="button" onClick={onCancel}>
            {cancelText}
          </CancelBtn>
          <ConfirmBtn type="button" $color={accentColor} onClick={onConfirm}>
            {confirmText}
          </ConfirmBtn>
        </Actions>
      </Card>
    </Overlay>
  )
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.bgtotal};
  border-radius: 28px;
  padding: 40px 32px 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  position: relative;
  color: ${({ theme }) => theme.text};

  h2 {
    font-size: 20px;
    font-weight: 800;
    margin: 0;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${({ theme }) => theme.colorSubtitle};
    line-height: 1.5;
  }
`

interface ColorProps {
  $color: string
}

const IconCircle = styled.div<ColorProps>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ $color }) => $color}18;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`

const Actions = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`

const CancelBtn = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(156, 163, 175, 0.25);
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(156, 163, 175, 0.1);
  }
`

const ConfirmBtn = styled.button<ColorProps>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 14px;
  border: none;
  background: ${({ $color }) => $color};
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;

  &:hover {
    filter: brightness(1.1);
  }
`

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(156, 163, 175, 0.2);
  background: transparent;
  color: ${({ theme }) => theme.colorSubtitle};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
  }
`
