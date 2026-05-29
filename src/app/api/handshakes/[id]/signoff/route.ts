import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const handshake = await prisma.handshake.findUnique({ where: { id: params.id } })
  if (!handshake) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isCreator = handshake.duoCreatorId === user.id
  const isPartner = handshake.duoPartnerId === user.id
  if (!isCreator && !isPartner) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const now = new Date()
  let updateData: any = {}
  let action = ''
  let note = ''

  if (isCreator && !handshake.creatorSignedAt) {
    updateData.creatorSignedAt = now
    action = 'creator_signed'
    note = `Signed by ${user.name || user.email}`
  } else if (isPartner && !handshake.partnerSignedAt) {
    updateData.partnerSignedAt = now
    action = 'partner_signed'
    note = `Signed by ${user.name || user.email}`
  } else {
    return NextResponse.json({ error: 'Already signed' }, { status: 400 })
  }

  const creatorSigned = updateData.creatorSignedAt || handshake.creatorSignedAt
  const partnerSigned = updateData.partnerSignedAt || handshake.partnerSignedAt
  if (creatorSigned && partnerSigned) {
    updateData.status = 'signed'
  } else {
    updateData.status = 'pending'
  }

  const updated = await prisma.handshake.update({ where: { id: params.id }, data: updateData })
  await prisma.handshakeHistory.create({
    data: { handshakeId: params.id, userId: user.id, action, note }
  })
  return NextResponse.json(updated)
}
