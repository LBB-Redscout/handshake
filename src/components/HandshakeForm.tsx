'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

type HandshakeData = {
  accountName?: string; date?: string; duoPartnerEmail?: string; executiveSponsor?: string
  accountAmbition?: string; commitment1?: string; commitment2?: string; commitment3?: string
  esRole?: string; esInvolvement?: string; esComments?: string; esMeetings?: string; esRoles?: string; esRoleOther?: string; clientsExperience?: string; teamExperience?: string
  esExperience?: string; nonNegotiable?: string; decisionsJoint?: string; tensionAreas?: string
  csRole?: string; stratDesignRole?: string; clientPushResponse?: string; clientDisagreement?: string
  csEnergy?: string; stratDesignEnergy?: string; csFeedback?: string; stratDesignFeedback?: string
  csWhenHard?: string; stratDesignWhenHard?: string; duoSyncTrigger?: string; esTrigger?: string
  earlyWarning?: string; growthOpportunity?: string; growthCadence?: string
}

type HistoryEntry = { id: string; action: string; note: string | null; createdAt: string; user?: { name?: string | null; email?: string | null } | null }

type Props = {
  initialData?: HandshakeData & { id?: string; duoPartner?: { email?: string | null } | null }
  mode: 'new' | 'edit'
  history?: HistoryEntry[]
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: 'none', borderBottom: '1px solid #ccc', outline: 'none',
  fontSize: 12, fontFamily: 'Arial, sans-serif', padding: '6px 0', resize: 'none',
  overflow: 'hidden', lineHeight: 1.6, background: 'transparent',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 4, marginTop: 16,
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 'bold', color: '#1a1a18', marginTop: 36, marginBottom: 4,
  textTransform: 'uppercase', letterSpacing: '0.04em',
}

const sectionSubtitleStyle: React.CSSProperties = {
  fontSize: 10, color: '#555', fontStyle: 'italic', marginBottom: 16,
}

function AutoTextarea({ name, placeholder, value, onChange }: {
  name: string; placeholder: string; value: string; onChange: (name: string, val: string) => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])
  useEffect(() => { resize() }, [value, resize])
  return (
    <textarea ref={ref} name={name} rows={1} placeholder={placeholder} value={value}
      onChange={e => { onChange(name, e.target.value); resize() }}
      style={{ ...inputStyle, color: value ? '#1a1a18' : '#aaa', fontStyle: value ? 'normal' : 'italic' }}
      onFocus={e => { if (!e.target.value) { e.target.style.color = '#1a1a18'; e.target.style.fontStyle = 'normal' } }}
      onBlur={e => { if (!e.target.value) { e.target.style.color = '#aaa'; e.target.style.fontStyle = 'italic' } }}
    />
  )
}

function Field({ label, name, placeholder, value, onChange }: {
  label: string; name: string; placeholder: string; value: string; onChange: (name: string, val: string) => void
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <AutoTextarea name={name} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  )
}

export default function HandshakeForm({ initialData, mode, history = [] }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string | null }[]>([])
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [sowText, setSowText] = useState('')
  const [sowLoading, setSowLoading] = useState(false)

  const handleSowUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSowLoading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1]
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'sowExtract', base64, mediaType: file.type })
        })
        const data = await res.json()
        const text = data.content?.[0]?.text || ''
        if (text) setSowText(text)
      } catch (e) { console.error(e) }
      setSowLoading(false)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(data => { if (Array.isArray(data)) setUsers(data) })
  }, [])

  const [form, setForm] = useState<HandshakeData>({
    accountName: initialData?.accountName || '',
    date: initialData?.date || '',
    duoPartnerEmail: initialData?.duoPartner?.email || initialData?.duoPartnerEmail || '',
    executiveSponsor: initialData?.executiveSponsor || '',
    accountAmbition: initialData?.accountAmbition || '',
    commitment1: initialData?.commitment1 || '',
    commitment2: initialData?.commitment2 || '',
    commitment3: initialData?.commitment3 || '',
    esRole: initialData?.esRole || '',
    esInvolvement: initialData?.esInvolvement || '',
    esComments: initialData?.esComments || '',
    esMeetings: initialData?.esMeetings || '[]',
    esRoles: initialData?.esRoles || '[]',
    esRoleOther: initialData?.esRoleOther || '',
    clientsExperience: initialData?.clientsExperience || '',
    teamExperience: initialData?.teamExperience || '',
    esExperience: initialData?.esExperience || '',
    nonNegotiable: initialData?.nonNegotiable || '',
    decisionsJoint: initialData?.decisionsJoint || '',
    tensionAreas: initialData?.tensionAreas || '',
    csRole: initialData?.csRole || '',
    stratDesignRole: initialData?.stratDesignRole || '',
    clientPushResponse: initialData?.clientPushResponse || '',
    clientDisagreement: initialData?.clientDisagreement || '',
    csEnergy: initialData?.csEnergy || '',
    stratDesignEnergy: initialData?.stratDesignEnergy || '',
    csFeedback: initialData?.csFeedback || '',
    stratDesignFeedback: initialData?.stratDesignFeedback || '',
    csWhenHard: initialData?.csWhenHard || '',
    stratDesignWhenHard: initialData?.stratDesignWhenHard || '',
    duoSyncTrigger: initialData?.duoSyncTrigger || '',
    esTrigger: initialData?.esTrigger || '',
    earlyWarning: initialData?.earlyWarning || '',
    growthOpportunity: initialData?.growthOpportunity || '',
    growthCadence: initialData?.growthCadence || '',
  })

  const set = (name: string, val: string) => setForm(prev => ({ ...prev, [name]: val }))

  const PROMPTS: Record<string, string> = {
    ambition: 'You are a strategic advisor at Redscout. Write one sharp ambitious sentence capturing what winning looks like for this account over 1-2 years. Return only the sentence.',
    commitments: 'You are a strategic advisor at Redscout. Draft 3 sharp commitments a client services and strategy duo would make to a client account. Start each with We commit to. Return as 3 lines, one per commitment, no numbers or bullets.',
    esSponsor: 'You are a strategic advisor at Redscout. Draft the Executive Sponsor role and involvement plan for a client account duo. Return as 2 lines: first the ES role, then how the duo will keep them informed.',
    greatLooks: 'You are a strategic advisor at Redscout. Draft what great looks like on a well-run account. Return exactly 3 lines starting with: For clients: then For the team: then For the ES:',
    decisions: 'You are a strategic advisor at Redscout. Draft decision rights for a duo: what requires both in the room, and where tension is likely. Return as 2 lines.',
    showUp: 'You are a strategic advisor at Redscout. Draft the CS and Strategy/Design roles in client meetings. Return as 2 lines starting with CS: then Strategy/Design:',
    workTogether: 'You are a strategic advisor at Redscout. Draft working style reflections for a duo covering energy and drain, feedback preferences, and needs when things get hard. Return as 6 lines alternating CS and Strategy/Design.',
    escalation: 'You are a strategic advisor at Redscout. Draft escalation rules for a duo: emergency sync trigger, ES escalation trigger, early warning signs. Return as 3 lines.',
    growth: 'You are a strategic advisor at Redscout. Draft a growth accountability statement: most likely expansion opportunity and how the duo will protect growth conversations. Return as 2 lines.',
  }

  const callAI = async (key: string, field: string) => {
    setAiLoading(prev => ({ ...prev, [key]: true }))
    try {
      const prompt = key === 'ambition'
        ? PROMPTS.ambition + ' Account: ' + (form.accountName || 'this account') + '. Current: ' + (form.accountAmbition || 'none')
        : PROMPTS[key]
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'handshake', prompt: sowText ? prompt + ' Use this SOW for context: ' + sowText.slice(0, 3000) : prompt, account: form.accountName || 'this account' })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      if (!text) return
      const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean)
      if (field === 'commitment1') { set('commitment1', lines[0]||''); if(lines[1]) set('commitment2', lines[1]); if(lines[2]) set('commitment3', lines[2]) }
      else if (field === 'esRole') { set('esRole', lines[0]||''); if(lines[1]) set('esInvolvement', lines[1]) }
      else if (field === 'clientsExperience') { set('clientsExperience', lines[0]?.replace(/^For clients:\s*/i,'')||''); if(lines[1]) set('teamExperience', lines[1]?.replace(/^For the team:\s*/i,'')||''); if(lines[2]) set('esExperience', lines[2]?.replace(/^For the ES:\s*/i,'')||'') }
      else if (field === 'decisionsJoint') { set('decisionsJoint', lines[0]||''); if(lines[1]) set('tensionAreas', lines[1]) }
      else if (field === 'csRole') { set('csRole', lines[0]?.replace(/^CS:\s*/i,'')||''); if(lines[1]) set('stratDesignRole', lines[1]?.replace(/^Strategy\/Design:\s*/i,'')||'') }
      else if (field === 'csEnergy') { set('csEnergy', lines[0]||''); if(lines[1]) set('stratDesignEnergy', lines[1]); if(lines[2]) set('csFeedback', lines[2]); if(lines[3]) set('stratDesignFeedback', lines[3]); if(lines[4]) set('csWhenHard', lines[4]); if(lines[5]) set('stratDesignWhenHard', lines[5]) }
      else if (field === 'duoSyncTrigger') { set('duoSyncTrigger', lines[0]||''); if(lines[1]) set('esTrigger', lines[1]); if(lines[2]) set('earlyWarning', lines[2]) }
      else if (field === 'growthOpportunity') { set('growthOpportunity', lines[0]||''); if(lines[1]) set('growthCadence', lines[1]) }
      else set(field, text)
    } catch (e) { console.error(e) }
    setAiLoading(prev => ({ ...prev, [key]: false }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = mode === 'new' ? '/api/handshakes' : `/api/handshakes/${initialData?.id}`
      const method = mode === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { }
      if (res.ok && data.id) router.push('/')
      else { setSaving(false); alert('Error: ' + (data.error || text || res.status)) }
    } catch (err: any) {
      setSaving(false)
      alert('Save failed: ' + (err?.message || 'unknown error'))
    }
  }

  const dividerStyle: React.CSSProperties = { borderTop: '1px solid #e0e0e0', marginTop: 36 }
  const btnStyle: React.CSSProperties = { fontSize: 11, color: '#378ADD', border: '0.5px solid #378ADD', borderRadius: 6, padding: '3px 8px', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }

  const SectionHeader = ({ title, aiKey, field }: { title: string; aiKey: string; field: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36, marginBottom: 4 }}>
      <div style={sectionTitleStyle}>{title}</div>
      <button type="button" disabled={!!aiLoading[aiKey]} onClick={() => callAI(aiKey, field)} style={btnStyle}>
        {aiLoading[aiKey] ? '...' : !!(form as any)[field] ? '✦ Sharpen' : '✦ Write'}
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
      <aside style={{ width: 220, flexShrink: 0, background: '#ffffff', borderRight: '0.5px solid rgba(0,0,0,0.12)', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b6b68', letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: '1rem', borderBottom: '0.5px solid rgba(0,0,0,0.12)' }}>Redscout</div>
        <div>
          <div style={{ fontSize: 11, color: '#6b6b68', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Navigation</div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none', background: '#eef4fc', textAlign: 'left', width: '100%', fontFamily: 'inherit', color: '#1a1a18', fontWeight: 500, marginTop: 2 }} onClick={() => router.push('/')}>🤝 Duo Handshake</button>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '0.5px solid rgba(0,0,0,0.12)' }}>
          <button style={{ fontSize: 12, color: '#6b6b68', border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'block', marginBottom: 8 }} onClick={() => router.push('/')}>← All handshakes</button>
          <button style={{ fontSize: 12, color: '#6b6b68', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} onClick={() => signOut({ callbackUrl: '/login' })}>Sign out</button>
        </div>
      </aside>

      <form onSubmit={handleSubmit} style={{ fontFamily: 'Arial, sans-serif', maxWidth: 760, flex: 1, padding: '40px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 'bold', color: '#1a1a18', marginBottom: 2 }}>{mode === 'new' ? 'New Duo Handshake' : 'Edit Duo Handshake'}</h1>
            <p style={{ fontSize: 13, color: '#888' }}>Redscout Duo Account Agreement</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => router.back()} style={{ background: 'none', border: '1px solid #ccc', padding: '9px 18px', fontSize: 13, cursor: 'pointer', color: '#555' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ background: '#1a1a18', color: '#fff', border: 'none', padding: '9px 22px', fontSize: 13, fontWeight: 'bold', cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Saving...' : '✍️ Save Draft'}</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Account Name</label>
            <input type="text" value={form.accountName} onChange={e => set('accountName', e.target.value)} placeholder="Client or account name" style={{ ...inputStyle, color: form.accountName ? '#1a1a18' : '#aaa', fontStyle: form.accountName ? 'normal' : 'italic' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', marginTop: 8 }}>
          <div>
            <label style={labelStyle}>Partner</label>
            <select value={form.duoPartnerEmail || ''} onChange={e => set('duoPartnerEmail', e.target.value)} style={{ ...inputStyle, color: form.duoPartnerEmail ? '#1a1a18' : '#aaa' }}>
              <option value="">Select partner...</option>
              {users.map(u => <option key={u.id} value={u.email || ''}>{u.name || u.email}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Executive Sponsor</label>
            <input type="text" value={form.executiveSponsor} onChange={e => set('executiveSponsor', e.target.value)} placeholder="Name of executive sponsor" style={{ ...inputStyle, color: form.executiveSponsor ? '#1a1a18' : '#aaa', fontStyle: form.executiveSponsor ? 'normal' : 'italic' }} />
          </div>
        </div>

        <div style={{ marginTop: 24, padding: '12px 16px', background: '#f8f8f8', border: '0.5px solid #e0e0e0', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#555', flex: 1 }}>
            <span style={{ fontWeight: 600 }}>Upload SOW</span> <span style={{ color: '#999' }}>(optional — AI will use it to help draft sections)</span>
            {sowText && <span style={{ color: '#2a7a2a', marginLeft: 8 }}>✓ SOW loaded</span>}
          </div>
          <label style={{ fontSize: 12, color: '#378ADD', border: '0.5px solid #378ADD', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {sowLoading ? 'Reading...' : sowText ? 'Replace SOW' : 'Choose PDF'}
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleSowUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={dividerStyle} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36, marginBottom: 4 }}>
          <div style={sectionTitleStyle}>Account Ambition</div>
          <button type="button" disabled={!!aiLoading['ambition']} onClick={() => callAI('ambition', 'accountAmbition')} style={btnStyle}>{aiLoading['ambition'] ? '...' : form.accountAmbition ? '✦ Sharpen' : '✦ Write'}</button>
        </div>
        <label style={labelStyle}>In one sentence, what is our ambition for this account?</label>
        <AutoTextarea name="accountAmbition" placeholder="e.g., Become their primary strategic partner / Double the scope / Own a new capability area" value={form.accountAmbition!} onChange={set} />

        <div style={dividerStyle} />
        <SectionHeader title="Our Commitments" aiKey="commitments" field="commitment1" />
        <div style={sectionSubtitleStyle}>The three things we commit to delivering for this account</div>
        <Field label="Commitment 1" name="commitment1" placeholder="We commit to..." value={form.commitment1!} onChange={set} />
        <Field label="Commitment 2" name="commitment2" placeholder="We commit to..." value={form.commitment2!} onChange={set} />
        <Field label="Commitment 3" name="commitment3" placeholder="We commit to..." value={form.commitment3!} onChange={set} />

        <div style={dividerStyle} />
        <SectionHeader title="Working with the Executive Sponsor" aiKey="esSponsor" field="esRole" />
        <Field label="What is the ES's role on this account?" name="esRole" placeholder="e.g., Builds senior relationships and unlocks growth; does not redirect strategy or execution" value={form.esRole!} onChange={set} />
        <Field label="How will we keep them informed and involved?" name="esInvolvement" placeholder="e.g., Bi-weekly sync, recap after key client calls, attends Kickoff + Midpoint" value={form.esInvolvement!} onChange={set} />

        <div style={{ marginTop: 20 }}>
          <label style={labelStyle}>Which meetings will the ES attend?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {['Weekly status', 'Client status', 'Review meetings', 'Presentations', 'Feedback calls'].map(meeting => {
              const selected: string[] = (() => { try { return JSON.parse(form.esMeetings || '[]') } catch { return [] } })()
              const checked = selected.includes(meeting)
              return (
                <label key={meeting} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={checked} onChange={() => {
                    const next = checked ? selected.filter(m => m !== meeting) : [...selected, meeting]
                    set('esMeetings', JSON.stringify(next))
                  }} style={{ width: 14, height: 14, accentColor: '#378ADD', flexShrink: 0, cursor: 'pointer' }} />
                  {meeting}
                </label>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label style={labelStyle}>What role does the ES play in those meetings?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {[
              { value: 'Observer', desc: 'stays informed, reads the room' },
              { value: 'Presenter', desc: 'takes the lead on specific content' },
              { value: 'Connector', desc: 'opens doors, makes introductions' },
              { value: 'Validator', desc: 'lends seniority and credibility to the work' },
            ].map(({ value, desc }) => {
              const selected: string[] = (() => { try { return JSON.parse(form.esRoles || '[]') } catch { return [] } })()
              const checked = selected.includes(value)
              return (
                <label key={value} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={checked} onChange={() => {
                    const next = checked ? selected.filter(r => r !== value) : [...selected, value]
                    set('esRoles', JSON.stringify(next))
                  }} style={{ width: 14, height: 14, accentColor: '#378ADD', flexShrink: 0, marginTop: 2, cursor: 'pointer' }} />
                  <span style={{ fontSize: 13 }}>
                    <strong>{value}</strong> <span style={{ color: '#888', fontSize: 12 }}>— {desc}</span>
                  </span>
                </label>
              )
            })}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, flexShrink: 0, color: '#555' }}>Other:</span>
              <input type="text" value={form.esRoleOther || ''} onChange={e => set('esRoleOther', e.target.value)} placeholder="Describe..." style={{ ...inputStyle, fontSize: 13 }} />
            </div>
          </div>
        </div>

        <Field label="We escalate to the Executive Sponsor when:" name="esTrigger" placeholder="e.g., Client confidence is at risk / Scope has expanded beyond what we can absorb" value={form.esTrigger!} onChange={set} />
        <Field label="Any additional Executive Sponsor comments from Duo review (optional)" name="esComments" placeholder="ES notes and sign-off comments..." value={(form as any).esComments || ''} onChange={set} />

        <div style={dividerStyle} />
        <SectionHeader title="What Great Looks Like" aiKey="greatLooks" field="clientsExperience" />
        <Field label="For clients" name="clientsExperience" placeholder="e.g., Clear direction, no surprises, momentum they can feel" value={form.clientsExperience!} onChange={set} />
        <Field label="For the team" name="teamExperience" placeholder="e.g., They know what's expected and when" value={form.teamExperience!} onChange={set} />
        <Field label="For the Executive Sponsor" name="esExperience" placeholder="e.g., They know what is expected from them and when" value={form.esExperience!} onChange={set} />
        <Field label="The one thing we cannot let slip on this account" name="nonNegotiable" placeholder="e.g., What's the non-negotiable?" value={form.nonNegotiable!} onChange={set} />
        <Field label="The early warning signs that this account is in trouble:" name="earlyWarning" placeholder="Early warning signs include..." value={form.earlyWarning!} onChange={set} />

        <div style={dividerStyle} />
        <SectionHeader title="Decision Rights" aiKey="decisions" field="decisionsJoint" />
        <Field label="What decisions require both of us in the room?" name="decisionsJoint" placeholder="Both of us need to be present for..." value={form.decisionsJoint!} onChange={set} />
        <Field label="Where do we expect tension and how will we handle it?" name="tensionAreas" placeholder="e.g., Design ambition vs. scope reality / Client pressure vs. craft integrity" value={form.tensionAreas!} onChange={set} />
        <Field label="We call an emergency Duo sync when:" name="duoSyncTrigger" placeholder="e.g., One of us hears something from the client the other doesn't know" value={form.duoSyncTrigger!} onChange={set} />

        <div style={dividerStyle} />
        <SectionHeader title="How We Show Up for the Client" aiKey="showUp" field="csRole" />
        <Field label="CS role in client meetings" name="csRole" placeholder="e.g., Owner of process, expectation-setter, room-reader" value={form.csRole!} onChange={set} />
        <Field label="Strategy/Design role in client meetings" name="stratDesignRole" placeholder="e.g., Point of view, narrative driver, creative authority" value={form.stratDesignRole!} onChange={set} />
        <Field label="When the client pushes scope or timelines, we:" name="clientPushResponse" placeholder="e.g., Agree to discuss offline" value={form.clientPushResponse!} onChange={set} />
        <Field label="How we disagree in front of a client:" name="clientDisagreement" placeholder="e.g., We don't. We park it and align offline." value={form.clientDisagreement!} onChange={set} />

        <div style={dividerStyle} />
        <SectionHeader title="How We Work Together" aiKey="workTogether" field="csEnergy" />
        <div style={sectionSubtitleStyle}>Understanding each other's working styles</div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b6b68', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CS</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b6b68', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strategy / Design</div>
        </div>

        {[
          { question: 'What gives you energy vs. drains you fastest?', left: 'csEnergy', right: 'stratDesignEnergy', placeholder: 'Energy: ... / Drain: ...' },
          { question: 'How do you like to receive feedback?', left: 'csFeedback', right: 'stratDesignFeedback', placeholder: 'I receive feedback best when...' },
          { question: 'What do you need from your Duo partner when things get hard?', left: 'csWhenHard', right: 'stratDesignWhenHard', placeholder: 'When things get hard, I need...' },
        ].map(({ question, left, right, placeholder }) => (
          <div key={left} style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 8 }}>{question}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              <AutoTextarea name={left} placeholder={placeholder} value={(form as any)[left] || ''} onChange={set} />
              <AutoTextarea name={right} placeholder={placeholder} value={(form as any)[right] || ''} onChange={set} />
            </div>
          </div>
        ))}

        <div style={dividerStyle} />
        <SectionHeader title="Growth Accountability" aiKey="growth" field="growthOpportunity" />
        <Field label="The most likely expansion opportunity on this account right now:" name="growthOpportunity" placeholder="The most likely expansion opportunity is..." value={form.growthOpportunity!} onChange={set} />
        <Field label="How we'll make sure growth doesn't get buried under delivery:" name="growthCadence" placeholder="e.g., It's a standing agenda item in our weekly Duo check-in" value={form.growthCadence!} onChange={set} />

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={() => router.back()} style={{ background: 'none', border: '1px solid #ccc', padding: '10px 20px', fontSize: 13, cursor: 'pointer', color: '#555' }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ background: '#1a1a18', color: '#fff', border: 'none', padding: '10px 24px', fontSize: 13, fontWeight: 'bold', cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Saving...' : '✍️ Save Draft'}</button>
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a18', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map(entry => (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span>
                    {entry.action === 'created' ? '💾' : entry.action.includes('signed') ? '✍️' : '💾'}{' '}
                    {entry.note || entry.action}
                    {entry.user ? ` — ${entry.user.name || entry.user.email}` : ''}
                  </span>
                  <span style={{ color: '#aaa', fontSize: 12 }}>
                    {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
