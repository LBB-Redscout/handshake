'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: '#1a1a18', color: '#fff', border: 'none', padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
    >
      Print
    </button>
  )
}
