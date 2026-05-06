import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { getSession, retryAnswer } from '../services/api'
import type { SessionDetail, Question, RetryAnswer } from '../types'

function parseBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

function PlanMarkdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      nodes.push(<h2 key={i}>{parseBold(line.slice(3))}</h2>)
      i++
    } else if (line.startsWith('### ')) {
      nodes.push(<h3 key={i}>{parseBold(line.slice(4))}</h3>)
      i++
    } else if (/^(\s*)-\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^(\s*)-\s/.test(lines[i])) {
        const match = lines[i].match(/^(\s*)-\s(.*)$/)
        const indent = match?.[1]?.length ?? 0
        const content = match?.[2] ?? ''
        items.push(
          <li key={i} style={{ marginLeft: indent > 0 ? 20 : 0 }}>
            {parseBold(content)}
          </li>
        )
        i++
      }
      nodes.push(<ul key={`ul-${i}`}>{items}</ul>)
    } else if (line.trim()) {
      nodes.push(<p key={i}>{parseBold(line)}</p>)
      i++
    } else {
      i++
    }
  }
  return <>{nodes}</>
}

function ScoreCircle({ score, size = 96 }: { score: number; size?: number }) {
  const r = size / 2 - 6
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? 'var(--good)' : score >= 60 ? 'oklch(0.72 0.16 230)' : score >= 40 ? 'var(--warn)' : 'var(--bad)'
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: 'stroke-dasharray .8s var(--ease)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="tabular" style={{ fontSize: size * 0.3, fontWeight: 500, letterSpacing: '-0.03em', color, lineHeight: 1 }}>
          {Math.round(score)}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>/ 100</span>
      </div>
    </div>
  )
}

function ScoreDelta({ original, retry }: { original: number; retry: number }) {
  const diff = Math.round(retry - original)
  if (diff > 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, color: 'var(--good)', fontWeight: 500 }}>
      <Icon name="arrow-up" size={10} />+{diff}
    </span>
  )
  if (diff < 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, color: 'var(--bad)', fontWeight: 500 }}>
      <Icon name="arrow-down" size={10} />{diff}
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, color: 'var(--text-faint)' }}>
      <Icon name="minus" size={10} />0
    </span>
  )
}

function QuestionCard({ question, index, sessionId }: { question: Question; index: number; sessionId: number }) {
  const { t } = useTranslation()
  const TYPE_LABELS: Record<string, string> = {
    technical: t('interview.typeLabels.technical'),
    behavioral: t('interview.typeLabels.behavioral'),
    situational: t('interview.typeLabels.situational'),
    motivation: t('interview.typeLabels.motivation'),
  }
  const [open, setOpen] = useState(index === 0)
  const [retryMode, setRetryMode] = useState(false)
  const [retryText, setRetryText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [retryError, setRetryError] = useState('')
  const [latestRetry, setLatestRetry] = useState<RetryAnswer | null>(
    question.retries?.length > 0 ? question.retries[question.retries.length - 1] : null
  )

  const answer = question.answer
  if (!answer) return null

  const displaySrc = latestRetry || answer
  const scoreColor = (s: number) => s >= 80 ? 'var(--good)' : s >= 60 ? 'oklch(0.72 0.16 230)' : s >= 40 ? 'var(--warn)' : 'var(--bad)'

  let strengths: string[] = []
  let improvements: string[] = []
  try { strengths = JSON.parse(displaySrc.strengths) } catch {}
  try { improvements = JSON.parse(displaySrc.improvements) } catch {}

  const handleRetry = async () => {
    if (!retryText.trim()) return
    setSubmitting(true)
    setRetryError('')
    try {
      const res = await retryAnswer(sessionId, question.id, { answer_text: retryText.trim() })
      setLatestRetry(res.data)
      setRetryMode(false)
      setRetryText('')
    } catch (e: any) {
      const code = e.response?.data?.detail
      setRetryError(t(`errors.${code}`, { defaultValue: t('results.errorRetry') }))
    } finally {
      setSubmitting(false)
    }
  }

  const displayScore = latestRetry ? latestRetry.final_score : answer.final_score

  return (
    <div style={{ borderTop: index !== 0 ? '1px solid var(--line-soft)' : 'none' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'grid', gridTemplateColumns: '32px 80px 1fr auto auto', gap: 16, alignItems: 'center',
          padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)',
        }}
      >
        <span className="tabular" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-faint)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="chip" style={{ fontSize: 11, justifySelf: 'flex-start' }}>
          {TYPE_LABELS[question.question_type]}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {question.question_text}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {latestRetry && (
            <>
              <span className="tabular" style={{ fontSize: 13, color: 'var(--text-faint)', textDecoration: 'line-through' }}>{answer.final_score.toFixed(0)}</span>
              <ScoreDelta original={answer.final_score} retry={latestRetry.final_score} />
            </>
          )}
          <span className="tabular" style={{ fontSize: 18, fontWeight: 500, color: scoreColor(displayScore), letterSpacing: '-0.015em' }}>
            {displayScore.toFixed(0)}<span style={{ color: 'var(--text-faint)', fontSize: 11, fontWeight: 400 }}>/100</span>
          </span>
        </div>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} style={{ color: 'var(--text-faint)' }} />
      </button>

      {open && (
        <div className="fade-up" style={{ padding: '4px 22px 28px 22px' }}>
          <div style={{ paddingLeft: 48 }}>

            {/* Original answer */}
            <p style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '8px 0 8px' }}>
              {latestRetry ? t('results.originalAnswer') : t('results.yourAnswer')}
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 20px', padding: 16, background: 'var(--bg-inset)', borderRadius: 8 }}>
              {answer.answer_text}
            </p>

            {/* Latest retry answer */}
            {latestRetry && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 8px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>{t('results.lastRetry')}</p>
                  <ScoreDelta original={answer.final_score} retry={latestRetry.final_score} />
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 20px', padding: 16, background: 'var(--bg-inset)', borderRadius: 8 }}>
                  {latestRetry.answer_text}
                </p>
              </>
            )}

            {/* Feedback */}
            <p style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '8px 0 8px' }}>{t('results.aiFeedback')}</p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              {displaySrc.feedback_text}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--good)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>{t('interview.strengthsTitle')}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {strengths.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--good)' }}>+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--warn)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>{t('interview.improvementsTitle')}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {improvements.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--warn)' }}>→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {displaySrc.ideal_answer_hint && (
              <div style={{ padding: 14, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', borderRadius: 8, marginBottom: 16, display: 'flex', gap: 10 }}>
                <Icon name="lightbulb" size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{t('results.idealAnswerPrefix')}</span>
                  {displaySrc.ideal_answer_hint}
                </p>
              </div>
            )}

            {/* Retry */}
            {!retryMode ? (
              <button
                onClick={() => setRetryMode(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                  color: 'var(--text-muted)', padding: '8px 14px',
                  border: '1px solid var(--line-soft)', borderRadius: 8, cursor: 'pointer',
                  background: 'transparent', transition: 'all .15s var(--ease)', width: '100%', justifyContent: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-line)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--line-soft)' }}
              >
                <Icon name="refresh" size={13} />
                {t('interview.retryBtn')}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>{t('results.writeImproved')}</p>
                <textarea
                  value={retryText}
                  onChange={(e) => setRetryText(e.target.value)}
                  rows={5}
                  placeholder={t('results.improvedPlaceholder')}
                  className="input"
                  style={{ fontSize: 14, resize: 'vertical' }}
                  disabled={submitting}
                  autoFocus
                />
                {retryError && <p style={{ fontSize: 12, color: 'var(--bad)', margin: 0 }}>{retryError}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleRetry}
                    disabled={submitting || !retryText.trim()}
                    className="btn btn-accent"
                    style={{ flex: 1, opacity: (submitting || !retryText.trim()) ? 0.5 : 1 }}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: 99, animation: 'orbit .7s linear infinite' }} />
                        {t('results.evaluating')}
                      </>
                    ) : (
                      <><Icon name="send" size={13} /> {t('results.evaluateRetry')}</>
                    )}
                  </button>
                  <button
                    onClick={() => { setRetryMode(false); setRetryText(''); setRetryError('') }}
                    disabled={submitting}
                    className="btn btn-ghost"
                  >
                    {t('results.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { t, i18n } = useTranslation()
  const [session, setSession] = useState<SessionDetail | null>(null)

  useEffect(() => {
    getSession(Number(sessionId)).then((res) => setSession(res.data))
  }, [sessionId])

  if (!session) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ width: 32, height: 32, border: '2px solid var(--line-soft)', borderTopColor: 'var(--accent)', borderRadius: 99, animation: 'orbit .8s linear infinite' }} />
        </div>
      </Layout>
    )
  }

  const score = session.overall_score ?? 0
  const scoreLabel = score >= 80 ? t('interview.verdicts.excellent') : score >= 60 ? t('interview.verdicts.good') : score >= 40 ? t('interview.verdicts.needs_improvement') : t('interview.verdicts.poor')
  const locale = i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'en' ? 'en-GB' : 'es-ES'
  const date = new Date(session.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()

  const TYPE_LABELS: Record<string, string> = {
    technical: t('interview.typeLabels.technical'),
    behavioral: t('interview.typeLabels.behavioral'),
    situational: t('interview.typeLabels.situational'),
    motivation: t('interview.typeLabels.motivation'),
  }
  const byType = ['technical', 'behavioral', 'situational', 'motivation'].map((type) => {
    const qs = session.questions.filter((q) => q.question_type === type && q.answer)
    const avg = qs.length ? qs.reduce((a, q) => a + (q.answer?.final_score ?? 0), 0) / qs.length : null
    return { type, label: TYPE_LABELS[type], avg, count: qs.length }
  }).filter(item => item.avg !== null) as { type: string; label: string; avg: number; count: number }[]

  return (
    <Layout>
      <div className="fade-up" style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
        <Link
          to="/dashboard"
          className="btn btn-bare"
          style={{ padding: '4px 0', fontSize: 13, color: 'var(--text-muted)', marginBottom: 32, display: 'inline-flex', textDecoration: 'none' }}
        >
          <Icon name="chevron-left" size={14} /> {t('results.backBtn')}
        </Link>

        {/* Editorial masthead */}
        <header style={{ marginBottom: 56, paddingBottom: 32, borderBottom: '1px solid var(--line)' }}>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
            {t('results.reportHeader')}
            <span style={{ flex: 'none', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-faint)' }}>{date}</span>
          </p>
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.0, margin: '0 0 12px' }}>
            {session.job_title}
          </h1>
          <p style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 24, color: 'var(--text-muted)', margin: 0, fontWeight: 400 }}>
            {t('results.atCompany', { company: session.company })}
          </p>
        </header>

        {/* Big score */}
        <section style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '48px 56px', alignItems: 'center', marginBottom: 64 }}>
          <div>
            <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 12 }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
              {t('results.overallScore')}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="tabular" style={{
                fontSize: 'clamp(100px, 15vw, 160px)',
                fontWeight: 500, letterSpacing: '-0.06em', lineHeight: 0.85,
                background: 'linear-gradient(180deg, var(--accent), oklch(0.35 0.15 240))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {score.toFixed(0)}
              </span>
              <span className="tabular" style={{ fontSize: 28, color: 'var(--text-faint)', fontWeight: 400 }}>/100</span>
            </div>
          </div>
          <div style={{ alignSelf: 'flex-start', paddingTop: 24 }}>
            <p style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 24, lineHeight: 1.35, color: 'var(--text-primary)', margin: '0 0 16px', fontWeight: 400 }}>
              "{scoreLabel}."
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
              {t('results.lumenAnalysis')}
            </p>
          </div>
        </section>

        {/* By type */}
        {byType.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
              {t('results.byCategory')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${byType.length}, 1fr)`, gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)', borderRadius: 12, overflow: 'hidden' }}>
              {byType.map(item => {
                const c = item.avg >= 80 ? 'var(--good)' : item.avg >= 60 ? 'oklch(0.72 0.16 230)' : 'var(--warn)'
                return (
                  <div key={item.type} style={{ background: 'var(--bg-card)', padding: 22 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>{item.label}</p>
                    <div className="tabular" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', color: c }}>
                      {item.avg.toFixed(0)}
                    </div>
                    <div style={{ height: 2, background: 'var(--line-soft)', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.avg}%`, background: c }} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: '8px 0 0' }}>
                      {t('results.questionCount', { count: item.count })}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Question breakdown */}
        <section style={{ marginBottom: 64 }}>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
            {t('results.questionReview')}
          </p>
          <div style={{ border: '1px solid var(--line-soft)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
            {session.questions.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i} sessionId={session.id} />
            ))}
          </div>
        </section>

        {/* Improvement plan */}
        {session.improvement_plan && (
          <section style={{ marginBottom: 64 }}>
            <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
              {t('results.planTitle')}
            </p>
            <div className="surface" style={{ padding: 32 }}>
              <div style={{
                fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
              }}>
                <style>{`
                  .plan-content h2, .plan-content h3 { font-size: 17px; font-weight: 500; letter-spacing: -0.01em; color: var(--text-primary); margin: 24px 0 10px; }
                  .plan-content h2:first-child, .plan-content h3:first-child { margin-top: 0; }
                  .plan-content ul { padding-left: 0; list-style: none; margin: 0 0 16px; display: flex; flex-direction: column; gap: 6px; }
                  .plan-content li { display: flex; gap: 10px; }
                  .plan-content li::before { content: '—'; color: var(--text-faint); font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
                  .plan-content p { margin: 0 0 12px; }
                  .plan-content strong { color: var(--text-primary); font-weight: 500; }
                `}</style>
                <div className="plan-content">
                  <PlanMarkdown text={session.improvement_plan} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingTop: 24, borderTop: '1px solid var(--line-soft)' }}>
          <Link to="/new" className="btn btn-accent" style={{ padding: '14px 22px', textDecoration: 'none' }}>
            <Icon name="plus" size={14} /> {t('results.newSessionBtn')}
          </Link>
          <button className="btn btn-ghost" style={{ padding: '14px 22px' }}>
            <Icon name="arrow-up-right" size={14} /> {t('results.shareBtn')}
          </button>
        </div>
      </div>
    </Layout>
  )
}
