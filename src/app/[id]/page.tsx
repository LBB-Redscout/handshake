import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SignOffButton from '@/components/SignOffButton'
import CopyButton from '@/components/CopyButton'

type RowProps = { label: string; value?: string | null }

function Row({ label, value }: RowProps) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#1a1a18', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e8e8e8' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#378ADD', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: subtitle ? 4 : 16 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 16 }}>{subtitle}</div>}
      {children}
    </div>
  )
}

export default async function HandshakeViewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  const h = await prisma.handshake.findUnique({
    where: { id: params.id },
    include: {
      duoCreator: { select: { id: true, name: true, email: true } },
      duoPartner: { select: { id: true, name: true, email: true } },
      history: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!h) notFound()

  const userId = currentUser?.id || ''
  const isCreator = h.duoCreatorId === userId
  const isPartner = h.duoPartnerId === userId
  const creatorSigned = !!(h as any).creatorSignedAt
  const partnerSigned = !!(h as any).partnerSignedAt
  const alreadySigned = (isCreator && creatorSigned) || (isPartner && partnerSigned)
  const canSignOff = (isCreator || isPartner) && !alreadySigned

  const statusLabel = (h as any).status === 'signed' ? '🤝 Fully signed' : (h as any).status === 'pending' ? '⏳ Awaiting partner sign-off' : '✍️ Draft'

  const creatorDisplay = h.duoCreator?.name || h.duoCreator?.email || '—'
  const partnerDisplay = h.duoPartner ? (h.duoPartner.name || h.duoPartner.email || '—') : '—'

  function actionLabel(action: string, note: string | null) {
    if (action === 'creator_signed') return note || 'Signed'
    if (action === 'partner_signed') return note || 'Signed'
    if (action === 'edited') return 'Edited'
    if (action === 'created') return 'Created'
    return action
  }

  function actionEmoji(action: string) {
    if (action === 'creator_signed' || action === 'partner_signed') return '✍️'
    if (action === 'edited') return '💾'
    if (action === 'created') return '💾'
    return '📝'
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 760, margin: '0 auto', padding: '0 0 60px' }}>

      {/* Branded header */}
      <div style={{ background: '#378ADD', padding: '18px 32px', marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Redscout</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: '0.01em' }}>Duo Handshake</div>
      </div>

      <div style={{ padding: '0 32px' }}>

        {/* Nav + actions */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>← All Handshakes</Link>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CopyButton text={[
              `DUO HANDSHAKE — ${h.accountName || 'Untitled Account'}`,
              `${creatorDisplay} + ${partnerDisplay}${h.date ? ' · ' + h.date : ''}`,
              `Status: ${(h as any).status === 'signed' ? 'Fully signed' : (h as any).status === 'pending' ? 'Pending' : 'Draft'}`,
              '',
              'ACCOUNT AMBITION', h.accountAmbition || '',
              '',
              'OUR COMMITMENTS',
              h.commitment1 ? '1. ' + h.commitment1 : '',
              h.commitment2 ? '2. ' + h.commitment2 : '',
              h.commitment3 ? '3. ' + h.commitment3 : '',
              '',
              'WORKING WITH THE EXECUTIVE SPONSOR',
              h.esRole ? 'Role: ' + h.esRole : '',
              h.esInvolvement ? 'Involvement: ' + h.esInvolvement : '',
              h.esTrigger ? 'Escalate to ES when: ' + h.esTrigger : '',
              '',
              'GROWTH ACCOUNTABILITY',
              h.growthOpportunity ? 'White whale: ' + h.growthOpportunity : '',
              h.growthCadence ? 'Cadence: ' + h.growthCadence : '',
              '',
              'WHAT GREAT LOOKS LIKE',
              h.clientsExperience ? 'For clients: ' + h.clientsExperience : '',
              h.teamExperience ? 'For the team: ' + h.teamExperience : '',
              h.esExperience ? 'For the ES: ' + h.esExperience : '',
              h.nonNegotiable ? 'Non-negotiable: ' + h.nonNegotiable : '',
              h.earlyWarning ? 'Early warnings: ' + h.earlyWarning : '',
              '',
              'DECISION RIGHTS',
              h.decisionsJoint ? 'Joint decisions: ' + h.decisionsJoint : '',
              h.tensionAreas ? 'Tension areas: ' + h.tensionAreas : '',
              '',
              'HOW WE SHOW UP FOR THE CLIENT',
              h.csRole ? 'CS: ' + h.csRole : '',
              h.stratDesignRole ? 'Strategy/Design: ' + h.stratDesignRole : '',
              h.clientPushResponse ? 'When client pushes: ' + h.clientPushResponse : '',
              h.clientDisagreement ? 'Disagreements: ' + h.clientDisagreement : '',
              '',
              'HOW WE WORK TOGETHER',
              h.csEnergy ? 'CS energy/drain: ' + h.csEnergy : '',
              h.stratDesignEnergy ? 'Strategy/Design energy/drain: ' + h.stratDesignEnergy : '',
              h.csFeedback ? 'CS feedback: ' + h.csFeedback : '',
              h.stratDesignFeedback ? 'Strategy/Design feedback: ' + h.stratDesignFeedback : '',
              h.csWhenHard ? 'CS when hard: ' + h.csWhenHard : '',
              h.stratDesignWhenHard ? 'Strategy/Design when hard: ' + h.stratDesignWhenHard : '',
            ].filter(Boolean).join('\n')} />
            {canSignOff && <SignOffButton handshakeId={h.id} />}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px 16px', fontSize: 13, marginBottom: 8, lineHeight: 1.6 }}>
          <span style={{ color: '#888', fontWeight: 500 }}>Account</span><span style={{ color: '#1a1a18', fontWeight: 600 }}>{h.accountName || '—'}</span>
          <span style={{ color: '#888', fontWeight: 500 }}>Duo</span><span style={{ color: '#1a1a18' }}>{creatorDisplay} + {partnerDisplay}</span>
          {h.executiveSponsor && <><span style={{ color: '#888', fontWeight: 500 }}>Executive Sponsor</span><span style={{ color: '#1a1a18' }}>{h.executiveSponsor}</span></>}
          {h.date && <><span style={{ color: '#888', fontWeight: 500 }}>Date</span><span style={{ color: '#1a1a18' }}>{h.date}</span></>}
          <span className="no-print" style={{ color: '#888', fontWeight: 500 }}>Status</span><span className="no-print" style={{ color: '#1a1a18' }}>{statusLabel}</span>
        </div>

        {/* Sections — matching form order */}
        <Section title="Account Ambition" subtitle="Where are we trying to take this account — and what does winning look like?">
          <Row label="In one sentence, what is our ambition for this account?" value={h.accountAmbition} />
        </Section>

        <Section title="Our Commitments" subtitle="Two or three things you're holding each other to.">
          <Row label="Commitment 1" value={h.commitment1} />
          <Row label="Commitment 2" value={h.commitment2} />
          <Row label="Commitment 3" value={h.commitment3} />
        </Section>

        <Section title="Working with the Executive Sponsor" subtitle="Set the terms of this relationship before you need them.">
          <Row label="What is the ES's role on this account?" value={h.esRole} />
          {(h as any).esConnectionMethods && JSON.parse((h as any).esConnectionMethods || '[]').length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>How the Duo and ES stay connected</div>
              <div style={{ fontSize: 13, color: '#1a1a18', lineHeight: 1.7 }}>{JSON.parse((h as any).esConnectionMethods).join(', ')}</div>
            </div>
          )}
          <Row label="How will we review the organic growth plan together?" value={(h as any).esGrowthReview} />
          {(h as any).esMeetings && JSON.parse((h as any).esMeetings || '[]').length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Client meetings the ES will attend</div>
              <div style={{ fontSize: 13, color: '#1a1a18', lineHeight: 1.7 }}>{JSON.parse((h as any).esMeetings).join(', ')}</div>
            </div>
          )}
          {(h as any).esRoles && JSON.parse((h as any).esRoles || '[]').length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>ES role in those meetings</div>
              <div style={{ fontSize: 13, color: '#1a1a18', lineHeight: 1.7 }}>
                {JSON.parse((h as any).esRoles).join(', ')}{(h as any).esRoleOther ? `, ${(h as any).esRoleOther}` : ''}
              </div>
            </div>
          )}
          <Row label="We escalate to the Executive Sponsor when:" value={h.esTrigger} />
          <Row label="Executive Sponsor comments" value={(h as any).esComments} />
        </Section>

        <Section title="Growth Accountability" subtitle="Growth is a Duo responsibility.">
          <Row label="The white whale — the big thing we're building toward on this account:" value={h.growthOpportunity} />
          <Row label="How we'll make sure growth doesn't get buried under delivery:" value={h.growthCadence} />
        </Section>

        <Section title="What Great Looks Like" subtitle="When this account is operating at its best, what is true? Be specific, not aspirational.">
          <Row label="For clients" value={h.clientsExperience} />
          <Row label="For the team" value={h.teamExperience} />
          <Row label="For the Executive Sponsor" value={h.esExperience} />
          <Row label="The one thing we cannot let slip" value={h.nonNegotiable} />
          <Row label="Early warning signs that this account is in trouble" value={h.earlyWarning} />
        </Section>

        <Section title="Decision Rights" subtitle="Ambiguity here is where Duos break down.">
          <Row label="What decisions require both of us in the room?" value={h.decisionsJoint} />
          <Row label="Where do we expect tension and how will we handle it?" value={h.tensionAreas} />
        </Section>

        <Section title="How We Show Up for the Client" subtitle="The client reads the dynamic between us.">
          <Row label="CS role in client meetings" value={h.csRole} />
          <Row label="Strategy/Design role in client meetings" value={h.stratDesignRole} />
          <Row label="When the client pushes scope or timelines, we:" value={h.clientPushResponse} />
          <Row label="How we disagree in front of a client:" value={h.clientDisagreement} />
        </Section>

        <Section title="How We Work Together" subtitle="This is the stuff that makes or breaks a Duo.">
          <Row label="What gives you energy vs. drains you fastest? (CS)" value={h.csEnergy} />
          <Row label="What gives you energy vs. drains you fastest? (Strategy/Design)" value={h.stratDesignEnergy} />
          <Row label="How do you like to receive feedback? (CS)" value={h.csFeedback} />
          <Row label="How do you like to receive feedback? (Strategy/Design)" value={h.stratDesignFeedback} />
          <Row label="What do you need from your Duo partner when things get hard? (CS)" value={h.csWhenHard} />
          <Row label="What do you need from your Duo partner when things get hard? (Strategy/Design)" value={h.stratDesignWhenHard} />
        </Section>

        {/* Activity — hidden on print */}
        {(h.history as any[]).length > 0 && (
          <div className="no-print" style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #e8e8e8' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(h.history as any[]).map((entry: any) => (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span>{actionEmoji(entry.action)} {actionLabel(entry.action, entry.note)}{entry.user ? ` — ${entry.user.name || entry.user.email}` : ''}</span>
                  <span style={{ color: '#aaa', fontSize: 12 }}>{new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
