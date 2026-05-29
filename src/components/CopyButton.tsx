'use client'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy}
      style={{ background: 'none', border: '1px solid #ccc', padding: '9px 18px', fontSize: 13, cursor: 'pointer', color: '#555' }}>
      {copied ? '✓ Copied!' : 'Copy Text'}
    </button>
  )
}
