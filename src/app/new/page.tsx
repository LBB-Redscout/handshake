export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import HandshakeForm from '@/components/HandshakeForm'

export default async function NewHandshakePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  return <HandshakeForm mode="new" />
}
