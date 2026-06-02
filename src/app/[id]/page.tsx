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
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1a1a18', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid #e0e0e0' }}>
      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: subtitle ? 4 : 16 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 10, color: '#555', fontStyle: 'italic', marginBottom: 16 }}>{subtitle}</div>}
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

  const statusLabel = (h as any).status === 'signed' ? '🤝 Fully signed' : (h as any).status === 'pending' ? '⏳ Pending' : '✍️ Draft'

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
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <Link href="/" style={{ fontSize: 12, color: '#888', textDecoration: 'none', display: 'block', marginBottom: 12 }}>← All Handshakes</Link>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1a1a18', marginBottom: 4 }}>{h.accountName || 'Untitled Account'}</h1>
          <div style={{ fontSize: 13, color: '#555' }}>
            {creatorDisplay} + {partnerDisplay}
            {h.date && <span style={{ color: '#aaa', marginLeft: 12 }}>{h.date}</span>}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>{statusLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <CopyButton text={[
            `DUO HANDSHAKE — ${h.accountName || 'Untitled Account'}`,
            `${creatorDisplay} + ${partnerDisplay}${h.date ? ' · ' + h.date : ''}`,
            `Status: ${(h as any).status === 'signed' ? 'Fully signed' : (h as any).status === 'pending' ? 'Pending' : 'Draft'}`,
            '',
            'ACCOUNT AMBITION',
            h.accountAmbition || '',
            '',
            'OUR COMMITMENTS',
            h.commitment1 ? '1. ' + h.commitment1 : '',
            h.commitment2 ? '2. ' + h.commitment2 : '',
            h.commitment3 ? '3. ' + h.commitment3 : '',
            '',
            'WORKING WITH THE EXECUTIVE SPONSOR',
            h.esRole ? 'Role: ' + h.esRole : '',
            h.esInvolvement ? 'Involvement: ' + h.esInvolvement : '',
            (h as any).esComments ? 'ES Comments: ' + (h as any).esComments : '',
            '',
            'WHAT GREAT LOOKS LIKE',
            h.clientsExperience ? 'For clients: ' + h.clientsExperience : '',
            h.teamExperience ? 'For the team: ' + h.teamExperience : '',
            h.esExperience ? 'For the ES: ' + h.esExperience : '',
            h.nonNegotiable ? 'Non-negotiable: ' + h.nonNegotiable : '',
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
            '',
            'ESCALATION RULES',
            h.duoSyncTrigger ? 'Duo sync when: ' + h.duoSyncTrigger : '',
            h.esTrigger ? 'Escalate to ES when: ' + h.esTrigger : '',
            h.earlyWarning ? 'Early warnings: ' + h.earlyWarning : '',
            '',
            'GROWTH ACCOUNTABILITY',
            h.growthOpportunity ? 'Opportunity: ' + h.growthOpportunity : '',
            h.growthCadence ? 'Cadence: ' + h.growthCadence : '',
          ].filter(Boolean).join('\n')} />

          {canSignOff && <SignOffButton handshakeId={h.id} />}
        </div>
      </div>

      {h.executiveSponsor && (
        <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>
          <span style={{ fontWeight: 'bold' }}>Executive Sponsor:</span> {h.executiveSponsor}
        </div>
      )}

      <Section title="Account Ambition">
        <Row label="In one sentence, what is our ambition for this account?" value={h.accountAmbition} />
      </Section>
      <Section title="Our Commitments" subtitle="The three things we commit to delivering for this account">
        <Row label="Commitment 1" value={h.commitment1} />
        <Row label="Commitment 2" value={h.commitment2} />
        <Row label="Commitment 3" value={h.commitment3} />
      </Section>
      <Section title="Working with the Executive Sponsor">
        <Row label="What is the ES's role on this account?" value={h.esRole} />
        {(h as any).esConnectionMethods && JSON.parse((h as any).esConnectionMethods || '[]').length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>How the Duo and ES stay connected</div>
            <div style={{ fontSize: 14, color: '#1a1a18', lineHeight: 1.7 }}>{JSON.parse((h as any).esConnectionMethods).join(', ')}</div>
          </div>
        )}
        <Row label="How will we review the organic growth plan together?" value={(h as any).esGrowthReview} />
        {(h as any).esMeetings && JSON.parse((h as any).esMeetings || '[]').length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Client meetings the ES will attend</div>
            <div style={{ fontSize: 14, color: '#1a1a18', lineHeight: 1.7 }}>{JSON.parse((h as any).esMeetings).join(', ')}</div>
          </div>
        )}
        {(h as any).esRoles && JSON.parse((h as any).esRoles || '[]').length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ES role in those meetings</div>
            <div style={{ fontSize: 14, color: '#1a1a18', lineHeight: 1.7 }}>
              {JSON.parse((h as any).esRoles).join(', ')}{(h as any).esRoleOther ? `, ${(h as any).esRoleOther}` : ''}
            </div>
          </div>
        )}
        <Row label="We escalate to the Executive Sponsor when:" value={h.esTrigger} />
        <Row label="Executive Sponsor comments" value={(h as any).esComments} />
      </Section>
      <Section title="Growth Accountability">
        <Row label="The white whale — the big thing we're building toward on this account:" value={h.growthOpportunity} />
        <Row label="How we'll make sure growth doesn't get buried under delivery:" value={h.growthCadence} />
      </Section>
      <Section title="What Great Looks Like">
        <Row label="For clients" value={h.clientsExperience} />
        <Row label="For the team" value={h.teamExperience} />
        <Row label="For the Executive Sponsor" value={h.esExperience} />
        <Row label="The one thing we cannot let slip" value={h.nonNegotiable} />
      </Section>
      <Section title="Decision Rights">
        <Row label="What decisions require both of us in the room?" value={h.decisionsJoint} />
        <Row label="Where do we expect tension and how will we handle it?" value={h.tensionAreas} />
      </Section>
      <Section title="How We Show Up for the Client">
        <Row label="CS role in client meetings" value={h.csRole} />
        <Row label="Strategy/Design role in client meetings" value={h.stratDesignRole} />
        <Row label="When the client pushes scope or timelines, we:" value={h.clientPushResponse} />
        <Row label="How we disagree in front of a client:" value={h.clientDisagreement} />
      </Section>
      <Section title="How We Work Together" subtitle="Understanding each other's working styles">
        <Row label="What gives you energy vs. drains you fastest? (CS)" value={h.csEnergy} />
        <Row label="What gives you energy vs. drains you fastest? (Strategy/Design)" value={h.stratDesignEnergy} />
        <Row label="What do you need from your Duo partner when things get hard? (CS)" value={h.csWhenHard} />
        <Row label="What do you need from your Duo partner when things get hard? (Strategy/Design)" value={h.stratDesignWhenHard} />
      </Section>
      <Section title="Feedback on this Account" subtitle="The Handshake is a shared, visible commitment to how this account will be run. When something feels off, anyone on the team can use it as the reference point.">
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 8, paddingBottom: 6, borderBottom: '1px solid #e0e0e0' }}>Between the Duo</div>
        <Row label="How will we give each other feedback in real time?" value={(h as any).feedbackDuoRealtime} />
        <Row label="How often will we check in with each other, separate from work reviews?" value={(h as any).feedbackDuoCheckin} />
        <Row label="What's our agreement when we disagree on direction, decisions, or how to show up?" value={(h as any).feedbackDuoDisagreement} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '1px solid #e0e0e0' }}>From the Team to the Duo</div>
        <Row label="How can anyone on the team raise concerns to us?" value={(h as any).feedbackTeamRaise} />
        <Row label="What's our commitment to receiving feedback without defensiveness?" value={(h as any).feedbackTeamReceive} />
        <Row label="How will we close the loop when something is raised?" value={(h as any).feedbackTeamLoop} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '1px solid #e0e0e0' }}>From the Duo to the Team</div>
        <Row label="How often will we give direct feedback to each team member?" value={(h as any).feedbackToTeamFreq} />
        <Row label="How will we balance reinforcement and redirection?" value={(h as any).feedbackToTeamBalance} />
        <Row label="When and how will we run retros?" value={(h as any).feedbackToTeamRetros} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '1px solid #e0e0e0' }}>With the Executive Sponsor</div>
        <Row label="How does the ES give us feedback, and on what cadence?" value={(h as any).feedbackEsReceive} />
        <Row label="How do we give the ES feedback when their involvement isn't working?" value={(h as any).feedbackEsGive} />
        <Row label="What triggers an escalation if ES involvement is causing more friction than help?" value={(h as any).feedbackEsEscalation} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '1px solid #e0e0e0' }}>With the Client</div>
        <Row label="How will we surface concerns from the client team back to us?" value={(h as any).feedbackClientSurface} />
        <Row label="How will we give the client feedback when it's needed?" value={(h as any).feedbackClientGive} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '1px solid #e0e0e0' }}>When Something Feels Off</div>
        <Row label="What's the trigger for revisiting this Handshake mid-project?" value={(h as any).feedbackOffTrigger} />
        <Row label="Who can call that meeting, and how do we make sure it happens?" value={(h as any).feedbackOffMeeting} />
        <Row label="How will changes to the Handshake be communicated back to the team?" value={(h as any).feedbackOffCommunicate} />
      </Section>

      <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>Activity</div>
        {(h.history as any[]).length === 0 ? (
          <div style={{ fontSize: 13, color: '#aaa' }}>No activity yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(h.history as any[]).map((entry: any) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span>{actionEmoji(entry.action)} {actionLabel(entry.action, entry.note)}{entry.user ? ` — ${entry.user.name || entry.user.email}` : ''}</span>
                <span style={{ color: '#aaa', fontSize: 12 }}>{new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
