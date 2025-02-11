import { useState, FormEvent } from 'react'
import { OldButton } from './buttons/OldButton'

interface PasswordProtectionProps {
  onCorrectPassword: () => void
}

function PasswordProtection({ onCorrectPassword }: PasswordProtectionProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (password === 'test123') {
      onCorrectPassword()
      setError('')
    } else {
      setError('Incorrect password, try again')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#2C2C2C]">
      <div className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Enter Password</h2>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1a1a1a] text-white border-2 border-gray-600 focus:border-[#FFA163] focus:outline-none"
              placeholder="Enter password"
            />
          </div>
          <OldButton onClick={(e) => handleSubmit(e)} fullWidth className="bg-[#FFA163] text-black">
            Submit
          </OldButton>
        </form>
      </div>
    </div>
  )
}

export default PasswordProtection
