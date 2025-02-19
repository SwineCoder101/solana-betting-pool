import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TeleswapContainer } from '../teleswap/TeleswapContainer'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function TokenSwapModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return createPortal(<TeleswapContainer />, document.body)
}
