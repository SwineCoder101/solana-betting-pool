import { useModalStore } from '@/stores/modalStore'
import { Win95Modal } from './Win95Modal'

export function MoreInfoModal() {
  const { closeModal } = useModalStore()
  return (
    <div className='relative '>
       <img
          src="/images/phone.png"
          alt="Motorola Flip Phone"
          width={199}
          height={470}
          className="absolute -left-28 -top-24"
        />
    <Win95Modal title="LEADERBOARDS"  onClose={closeModal}>
    <div className="w-screen md:max-w-[600px] mx-auto bg-[#2C2C2C] overflow-hidden">
      <div className='flex items-center '>
        <h4 className='text-2xl pl-16 py-10 pr-4'>
          One tap trading at it's finest. Predict where a chart is heading,
          tap to bet for a chance to win bananas.
          <br />
          Lots of bananas.
        </h4>
        </div>
    </div>
    </Win95Modal>
    </div>
  )
}
