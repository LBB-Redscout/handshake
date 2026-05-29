'use client'

export default function DeleteHandshakeButton({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        if (!window.confirm('Delete this handshake?')) return
        await fetch('/api/handshakes/' + id, { method: 'DELETE' })
        window.location.href = '/'
      }}
      style={{ fontSize: 20, color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', lineHeight: 1 }}
    >⋮</button>
  )
}
