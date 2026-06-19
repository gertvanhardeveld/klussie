import { useState } from 'react'

const ADMIN_PIN = '1234'

type Props = {
  onSuccess: () => void
  onBack: () => void
}

export default function AdminPin({ onSuccess, onBack }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function check() {
    if (pin === ADMIN_PIN) {
      onSuccess()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-6">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-xl font-bold text-purple-800 mb-2">Beheerpincode</h1>
      <p className="text-purple-500 mb-6 text-sm">Voer de pincode in</p>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={e => { setPin(e.target.value); setError(false) }}
        className="border-2 border-purple-300 rounded-xl p-3 text-center text-2xl tracking-widest w-32 mb-4"
        placeholder="····"
        autoFocus
      />
      {error && <p className="text-red-500 text-sm mb-3">Onjuiste pincode</p>}
      <button
        onClick={check}
        className="bg-purple-500 text-white rounded-xl px-8 py-3 font-semibold mb-3"
      >
        Verder
      </button>
      <button onClick={onBack} className="text-purple-400 text-sm">Annuleren</button>
    </div>
  )
}
