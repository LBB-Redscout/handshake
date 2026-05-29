import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, prompt, base64, mediaType } = await req.json()

  if (type === 'sowExtract') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: [
          { type: 'document', source: { type: 'base64', media_type: mediaType || 'application/pdf', data: base64 } },
          { type: 'text', text: 'Extract the key information from this SOW that would be useful for a brand consultancy duo filling out an account handshake. Include: project scope, deliverables, timeline, client goals, success metrics, key stakeholders. Be concise. Return as plain text.' }
        ]}]
      })
    })
    return NextResponse.json(await response.json())
  }

  if (type === 'handshake') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    return NextResponse.json(await response.json())
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
