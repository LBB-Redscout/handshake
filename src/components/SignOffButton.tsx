'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignOffButton({ handshakeId }: { handshakeId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignOff = async () => {
    if (!confirm('Sign off on this handshake?')) return
    setLoading(true)
    await fetch(`/api/handshakes/${handshakeId}/signoff`, { method: 'POST' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={handleSignOff} disabled={loading}
      style={{ background: '#378ADD', color: '#fff', border: 'none', padding: '9px 18px', fontSize: 13, fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}>
      {loading ? 'Signing...' : '✍️ Sign Off'}
    </button>
  )
}
