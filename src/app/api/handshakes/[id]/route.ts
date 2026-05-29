import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()
  const { status, creatorSignedAt, partnerSignedAt, duoCreatorId, duoPartnerId, id, createdAt, updatedAt, duoPartnerEmail, ...fields } = body

  let duoPartnerIdResolved: string | null | undefined = undefined
  if (duoPartnerEmail !== undefined) {
    if (duoPartnerEmail) {
      const partner = await prisma.user.findUnique({ where: { email: duoPartnerEmail } })
      duoPartnerIdResolved = partner?.id ?? null
    } else {
      duoPartnerIdResolved = null
    }
  }

  const updated = await prisma.handshake.update({
    where: { id: params.id },
    data: {
      ...fields,
      ...(duoPartnerIdResolved !== undefined ? { duoPartnerId: duoPartnerIdResolved } : {}),
    },
  })
  await prisma.handshakeHistory.create({
    data: { handshakeId: params.id, userId: user.id, action: 'edited' }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const handshake = await prisma.handshake.findUnique({ where: { id: params.id } })
  if (!handshake) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (handshake.duoCreatorId !== user.id) return NextResponse.json({ error: 'Only the creator can delete' }, { status: 403 })
  await prisma.handshake.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
