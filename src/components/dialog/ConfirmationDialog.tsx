interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({ isOpen, title, description, onConfirm, onCancel }: ConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-[#2C2C2C] rounded-lg p-6 w-full max-w-sm mx-4 text-white">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-300 mb-6">{description}</p>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-transparent border border-gray-600 hover:bg-gray-700 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors cursor-pointer">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
