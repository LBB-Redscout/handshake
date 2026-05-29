import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const handshakes = await prisma.handshake.findMany({
    include: {
      duoCreator: { select: { id: true, name: true, email: true } },
      duoPartner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(handshakes)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const creator = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!creator) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { duoPartnerEmail, ...fields } = body

  let duoPartnerId: string | undefined
  if (duoPartnerEmail) {
    const partner = await prisma.user.findUnique({ where: { email: duoPartnerEmail } })
    duoPartnerId = partner?.id
  }

  const handshake = await prisma.handshake.create({
    data: {
      ...fields,
      duoCreatorId: creator.id,
      duoPartnerId: duoPartnerId ?? null,
    },
  })

  await prisma.handshakeHistory.create({
    data: { handshakeId: handshake.id, userId: creator.id, action: 'created', note: 'Handshake created' }
  })

  return NextResponse.json(handshake)
}
