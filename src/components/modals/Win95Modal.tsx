interface Win95ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

export function Win95Modal({ onClose, children, maxWidth = '600px' }: Win95ModalProps) {
  return (
    <div style={{ maxWidth }} className="w-screen flex flex-col h-[calc(100dvh_-_48px)] md:h-[90vh]">
      {/* Windows 95 Title Bar */}
      <div className="bg-gradient-to-r from-[#07009E] to-[#0090FF] flex items-center justify-end px-1 h-[24px] border-t-2 border-l-2 border-[#FFFFFF] border-b-2 border-r-2">
        <button onClick={onClose}>
          <img src={'/assets/svg/win95-menu-icons.svg'} alt="Modal navigation icons" className="h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="grow overflow-hidden">{children}</div>
    </div>
  )
}
