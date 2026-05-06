import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { getSessions, getJobMatches, prepareInterviewFromJob } from '../services/api'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import type { SessionListItem, JobMatch } from '../types'

function EvolutionChart({ sessions }: { sessions: SessionListItem[] }) {
  const { t } = useTranslation()
  if (sessions.length < 2) return null
  const W = 1000, H = 200, PAD = { l: 40, r: 40, t: 32, b: 40 }
  const scores = sessions.map(s => s.overall_score ?? 0)
  const min = Math.max(0, Math.min(...scores) - 10)
  const max = Math.min(100, Math.max(...scores) + 10)
  const xs = scores.map((_, i) => PAD.l + (i / (scores.length - 1)) * (W - PAD.l - PAD.r))
  const ys = scores.map(s => PAD.t + (1 - (s - min) / (max - min)) * (H - PAD.t - PAD.b))
  const pts = scores.map((_, i) => `${xs[i]},${ys[i]}`).join(' ')
  const areaPath = `M ${xs[0]} ${H - PAD.b} L ${pts.replace(/ /g, ' L ')} L ${xs[xs.length-1]} ${H - PAD.b} Z`
  const linePath = `M ${pts.replace(/ /g, ' L ')}`

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 14, padding: 24, overflow: 'hidden' }}>
      <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 16 }}>
        <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
        {t('dashboard.evolutionTitle')}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="evoArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[min, (min+max)/2, max].map(v => {
          const y = PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b)
          return (
            <g key={v}>
              <line x1={PAD.l} x2={W-PAD.r} y1={y} y2={y} stroke="var(--line-soft)" strokeDasharray="2 4" />
              <text x={PAD.l - 8} y={y + 3} fontSize="10" fontFamily="JetBrains Mono, monospace" fill="var(--text-faint)" textAnchor="end">{Math.round(v)}</text>
            </g>
          )
        })}
        <path d={areaPath} fill="url(#evoArea)" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {sessions.map((s, i) => (
          <g key={s.id}>
            <circle cx={xs[i]} cy={ys[i]} r="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2" />
            <text x={xs[i]} y={H - PAD.b + 18} fontSize="10" fontFamily="JetBrains Mono, monospace" fill="var(--text-faint)" textAnchor="middle">{s.company.slice(0, 8)}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function SessionRow({ session, isFirst }: { session: SessionListItem; isFirst: boolean }) {
  const { t, i18n } = useTranslation()
  const [hover, setHover] = useState(false)
  const score = session.overall_score
  const scoreColor = score == null ? 'var(--text-faint)' : score >= 80 ? 'var(--good)' : score >= 60 ? 'oklch(0.72 0.16 230)' : score >= 40 ? 'var(--warn)' : 'var(--bad)'
  const href = session.status === 'completed' ? `/results/${session.id}` : `/interview/${session.id}`
  const locale = i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'en' ? 'en-GB' : 'es-ES'
  const date = new Date(session.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short' })

  return (
    <Link
      to={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', display: 'grid', gridTemplateColumns: '40px 1fr auto auto auto',
        alignItems: 'center', gap: 24, padding: '20px 24px',
        background: hover ? 'var(--bg-hover)' : 'transparent',
        borderTop: !isFirst ? '1px solid var(--line-soft)' : 'none',
        textDecoration: 'none', color: 'inherit',
        transition: 'background .15s var(--ease)',
      }}
    >
      <span className="tabular" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-faint)' }}>
        {String(session.id).padStart(2, '0')}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 4 }}>{session.job_title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{session.company}</span>
          <span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--text-faint)' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{date}</span>
        </div>
      </div>
      <span className="chip" style={{ fontSize: 11, color: session.status === 'completed' ? 'var(--good)' : 'var(--warn)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} />
        {session.status === 'completed' ? t('dashboard.completed') : `${session.answered_count}/${session.question_count}`}
      </span>
      <div style={{ minWidth: 80, textAlign: 'right' }}>
        {score != null ? (
          <span className="tabular" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: scoreColor }}>
            {score.toFixed(0)}<span style={{ color: 'var(--text-faint)', fontSize: 12, fontWeight: 400 }}>/100</span>
          </span>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>{t('dashboard.inProgress')}</span>
        )}
      </div>
      <Icon name="chevron-right" size={16} style={{ color: 'var(--text-faint)' }} />
    </Link>
  )
}

function JobsWidget() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [preparing, setPreparing] = useState<number | null>(null)

  useEffect(() => {
    getJobMatches({ status: 'new', limit: 4 })
      .then(res => setMatches(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handlePrepare = async (matchId: number) => {
    setPreparing(matchId)
    try {
      const res = await prepareInterviewFromJob(matchId)
      navigate(`/interview/${res.data.id}`)
    } catch {
      setPreparing(null)
    }
  }

  if (loading) return <div style={{ height: 80, background: 'var(--bg-card)', borderRadius: 14 }} />
  if (matches.length === 0) return null

  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p className="section-rule" style={{ justifyContent: 'flex-start', margin: 0 }}>
          <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
          {t('dashboard.jobsWidgetTitle')} ·{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{matches.length}</span>
        </p>
        <Link to="/jobs" className="btn btn-bare" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', padding: '4px 8px' }}>
          {t('dashboard.viewAllOffers')} <Icon name="chevron-right" size={13} />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {matches.map(m => (
          <div
            key={m.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              padding: '14px 20px', background: 'var(--bg-card)',
              border: '1px solid oklch(from var(--accent) l c h / 0.25)',
              borderRadius: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500 }}>{m.job_offer.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                {m.job_offer.company}
                {m.job_offer.location ? ` · ${m.job_offer.location}` : ''}
              </p>
            </div>
            <button
              onClick={() => handlePrepare(m.id)}
              disabled={preparing === m.id}
              className="btn btn-accent"
              style={{ padding: '7px 14px', fontSize: 12, flexShrink: 0 }}
            >
              {preparing === m.id ? '…' : t('dashboard.prepare')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessions().then(res => setSessions(res.data)).finally(() => setLoading(false))
  }, [])

  const completed = sessions.filter(s => s.status === 'completed')
  const avg = completed.length ? completed.reduce((a, s) => a + (s.overall_score ?? 0), 0) / completed.length : 0
  const best = completed.length ? Math.max(...completed.map(s => s.overall_score ?? 0)) : 0
  const today = new Date().toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()

  const chronological = [...completed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <Layout>
      <div className="fade-up">
        {/* Headline */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
          <div>
            <p className="section-rule" style={{ marginBottom: 16, justifyContent: 'flex-start' }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
              {today}
            </p>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.0, margin: 0 }}>
              {t('dashboard.welcome')}{' '}
              <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>
                {user?.name?.split(' ')[0]}.
              </span>
            </h1>
          </div>
          <Link to="/new" className="btn btn-accent" style={{ padding: '14px 22px', fontSize: 15, textDecoration: 'none' }}>
            <Icon name="plus" size={15} /> {t('nav.newSession')}
          </Link>
        </div>

        {/* Stats strip */}
        {loading ? (
          <div style={{ height: 120, background: 'var(--bg-card)', borderRadius: 16, marginBottom: 56 }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)', borderRadius: 16, overflow: 'hidden', marginBottom: 56 }}>
            {[
              { label: t('dashboard.recentSessions'), value: sessions.length, suffix: '', kicker: '' },
              { label: t('results.overallScore'), value: avg ? avg.toFixed(0) : '—', suffix: avg ? '/100' : '', kicker: '' },
              { label: t('results.title'), value: best ? best.toFixed(0) : '—', suffix: best ? '/100' : '', kicker: '' },
              { label: t('dashboard.completed'), value: completed.length, suffix: '', kicker: '' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg-card)', padding: 28 }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>{stat.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="tabular" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em' }}>{stat.value}</span>
                  <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>{stat.suffix}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job offers widget */}
        <JobsWidget />

        {/* Evolution chart */}
        {chronological.length >= 2 && (
          <div style={{ marginBottom: 56 }}>
            <EvolutionChart sessions={chronological} />
          </div>
        )}

        {/* Sessions list */}
        <div>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
            {t('dashboard.recentSessions')} · {sessions.length}
          </p>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 68, background: 'var(--bg-card)', borderRadius: 10 }} />)}
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 32px', background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 14 }}>
              <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: 'var(--text-muted)', margin: '0 0 24px', fontStyle: 'italic' }}>{t('dashboard.noSessions')}</p>
              <Link to="/new" className="btn btn-accent" style={{ textDecoration: 'none', padding: '14px 22px' }}>
                {t('dashboard.startNow')}
              </Link>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--line-soft)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
              {sessions.map((s, i) => <SessionRow key={s.id} session={s} isFirst={i === 0} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
