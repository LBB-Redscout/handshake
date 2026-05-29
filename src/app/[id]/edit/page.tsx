import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import HandshakeForm from '@/components/HandshakeForm'

export default async function EditHandshakePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const h = await prisma.handshake.findUnique({
    where: { id: params.id },
    include: {
      duoPartner: { select: { id: true, name: true, email: true } },
      history: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!h) notFound()
  if (h.duoCreatorId !== session.user.id) redirect(`/${params.id}`)

  return <HandshakeForm mode="edit" initialData={h as any} history={JSON.parse(JSON.stringify(h.history))} />
}
