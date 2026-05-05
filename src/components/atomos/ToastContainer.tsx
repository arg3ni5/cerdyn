import { AnimatePresence, motion } from 'motion/react'
import styled from 'styled-components'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'
import { useToastStore, type ToastItem, type ToastType } from '../../store/ToastStore'

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
}

const colors: Record<ToastType, string> = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
}

function ToastItem ({ toast }: { toast: ToastItem }) {
  const { removeToast } = useToastStore()
  const color = colors[toast.type]

  return (
    <ToastCard
      $color={color}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      role="alert"
    >
      <IconWrapper $color={color}>{icons[toast.type]}</IconWrapper>
      <Message>{toast.message}</Message>
      <DismissBtn
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => removeToast(toast.id)}
      >
        <X size={14} />
      </DismissBtn>
    </ToastCard>
  )
}

export function ToastContainer () {
  const { toasts } = useToastStore()

  return (
    <Wrapper>
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;

  @media (max-width: 640px) {
    bottom: 80px;
    right: 12px;
    left: 12px;
  }
`

interface CardProps {
  $color: string
}

const ToastCard = styled(motion.div)<CardProps>`
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.bgtotal};
  border: 1px solid ${({ $color }) => $color}33;
  border-left: 4px solid ${({ $color }) => $color};
  border-radius: 14px;
  padding: 12px 14px;
  min-width: 260px;
  max-width: 360px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  color: ${({ theme }) => theme.text};

  @media (max-width: 640px) {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }
`

const IconWrapper = styled.span<CardProps>`
  color: ${({ $color }) => $color};
  display: flex;
  flex-shrink: 0;
`

const Message = styled.span`
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  line-height: 1.4;
`

const DismissBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: ${({ theme }) => theme.colorSubtitle};
  display: flex;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`
