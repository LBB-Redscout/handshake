import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DeleteHandshakeButton from '@/components/DeleteHandshakeButton'

export default async function HandshakeDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  const userId = currentUser?.id || ''

  const handshakes = await prisma.handshake.findMany({
    where: userId ? { OR: [{ duoCreatorId: userId }, { duoPartnerId: userId }] } : { duoCreatorId: userId },
    include: {
      duoCreator: { select: { id: true, name: true, email: true } },
      duoPartner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const sidebar = (
    <aside style={{ width: 220, flexShrink: 0, background: '#ffffff', borderRight: '0.5px solid rgba(0,0,0,0.12)', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b6b68', letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: '1rem', borderBottom: '0.5px solid rgba(0,0,0,0.12)' }}>Redscout</div>
      <div>
        <div style={{ fontSize: 11, color: '#6b6b68', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Navigation</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 13, color: '#1a1a18', background: '#eef4fc', fontWeight: 500, marginTop: 2 }}>🤝 Duo Handshake</div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '0.5px solid rgba(0,0,0,0.12)' }}>
        <div style={{ fontSize: 12, color: '#6b6b68', marginBottom: 6 }}>{session.user.name}</div>
        <Link href="/login" style={{ fontSize: 12, color: '#6b6b68', textDecoration: 'none' }}>Sign out</Link>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
      {sidebar}
      <main style={{ flex: 1, padding: '40px 48px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <Link
          href="/new"
          style={{ background: '#1a1a18', color: '#fff', padding: '10px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 'bold' }}
        >
          + New Handshake
        </Link>
      </div>

      {handshakes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa', fontSize: 14 }}>
          No handshakes yet. Create the first one.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {handshakes.map(h => (
            <div key={h.id} style={{ border: '1px solid #e0e0e0', padding: '24px 28px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 16, color: '#1a1a18', marginBottom: 6 }}>
                  {(h as any).status === 'signed' ? '🤝' : '✍️'} {h.accountName || 'Untitled Account'}
                </div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>
                  {h.duoCreator?.name || h.duoCreator?.email || '—'}
                  {h.duoPartner ? ` + ${h.duoPartner.name || h.duoPartner.email}` : ''}
                </div>
                <div style={{ fontSize: 12, color: '#aaa' }}>
                  {h.date || 'No date'} · Updated {new Date(h.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {h.duoCreatorId === userId && (
                  <Link
                    href={`/${h.id}/edit`}
                    style={{ fontSize: 13, color: '#555', border: '1px solid #ccc', padding: '7px 16px', textDecoration: 'none' }}
                  >
                    Edit
                  </Link>
                )}
                <Link
                  href={`/${h.id}`}
                  style={{ fontSize: 13, color: '#fff', background: '#1a1a18', padding: '7px 16px', textDecoration: 'none' }}
                >
                  {(h as any).status === 'signed' ? 'View' : (h as any).status === 'pending' ? '⏳ Pending' : '✍️ Review & Sign'}
                </Link>
                {h.duoCreatorId === userId && (
                  <DeleteHandshakeButton id={h.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  )
}
