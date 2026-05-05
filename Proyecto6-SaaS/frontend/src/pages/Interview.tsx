import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { getSession, submitAnswer, completeSession } from '../services/api'
import type { SessionDetail, Question, Answer } from '../types'

const VERDICT_COLORS: Record<string, string> = {
  excellent: 'var(--good)',
  good: 'oklch(0.72 0.16 230)',
  needs_improvement: 'var(--warn)',
  poor: 'var(--bad)',
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

function FeedbackPanel({ answer, onNext, isLast, isCompleting }: {
  answer: Answer; onNext: () => void; isLast: boolean; isCompleting: boolean
}) {
  const { t } = useTranslation()
  const verdictLabel = t(`interview.verdicts.${answer.verdict}`, { defaultValue: answer.verdict })
  const cfg = { label: verdictLabel, color: VERDICT_COLORS[answer.verdict] || 'var(--text-muted)' }
  let strengths: string[] = []
  let improvements: string[] = []
  try { strengths = JSON.parse(answer.strengths) } catch {}
  try { improvements = JSON.parse(answer.improvements) } catch {}

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Score hero */}
      <div className="surface" style={{ padding: 28, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'center' }}>
        <ScoreCircle score={answer.final_score} />
        <div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: cfg.color, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {cfg.label}
            </span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
            {answer.feedback_text}
          </p>
          <div style={{ display: 'flex', gap: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)' }}>
            <span>LLM <span className="tabular" style={{ color: 'var(--text-secondary)' }}>{answer.llm_score.toFixed(0)}</span>/100</span>
            {answer.embedding_score != null && (
              <span>{t('interview.semantics')} <span className="tabular" style={{ color: 'var(--text-secondary)' }}>{answer.embedding_score.toFixed(0)}</span>/100</span>
            )}
          </div>
        </div>
      </div>

      {/* Strengths + improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="surface" style={{ padding: 22 }}>
          <p style={{ fontSize: 11, color: 'var(--good)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>
            {t('interview.strengthsTitle')}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {strengths.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--good)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="surface" style={{ padding: 22 }}>
          <p style={{ fontSize: 11, color: 'var(--warn)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>
            {t('interview.improvementsTitle')}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {improvements.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--warn)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ideal answer */}
      {answer.ideal_answer_hint && (
        <div className="surface" style={{ padding: 24, background: 'var(--accent-soft)', borderColor: 'var(--accent-line)' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <Icon name="lightbulb" size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                {t('interview.idealTitle')}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                {answer.ideal_answer_hint}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onNext} disabled={isCompleting} className="btn btn-accent" style={{ padding: '14px 22px', fontSize: 15 }}>
          {isCompleting ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: 99, animation: 'orbit .7s linear infinite' }} />
              {t('interview.finishing')}
            </>
          ) : isLast ? (
            <>{t('interview.finishBtn')} <Icon name="arrow-right" size={14} /></>
          ) : (
            <>{t('interview.nextBtn')} <Icon name="arrow-right" size={14} /></>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Interview() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [latestAnswer, setLatestAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [timerPaused, setTimerPaused] = useState(false)

  useEffect(() => {
    getSession(Number(sessionId)).then((res) => {
      const s: SessionDetail = res.data
      setSession(s)
      if (s.status === 'completed') { navigate(`/results/${sessionId}`); return }
      const firstUnanswered = s.questions.findIndex((q) => !q.answer)
      setCurrentIndex(firstUnanswered === -1 ? s.questions.length - 1 : firstUnanswered)
    })
  }, [sessionId, navigate])

  useEffect(() => {
    if (timerPaused || submitting || completing) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [timerPaused, submitting, completing])

  if (!session) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ width: 32, height: 32, border: '2px solid var(--line-soft)', borderTopColor: 'var(--accent)', borderRadius: 99, animation: 'orbit .8s linear infinite' }} />
        </div>
      </Layout>
    )
  }

  const questions = session.questions
  const currentQuestion: Question = questions[currentIndex]
  const answeredCount = questions.filter((q) => q.answer).length
  const allAnswered = answeredCount === questions.length
  const progress = (answeredCount / questions.length) * 100
  const alreadyAnswered = !!currentQuestion?.answer
  const displayAnswer = latestAnswer || currentQuestion?.answer
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const TYPE_LABELS: Record<string, string> = {
    technical: t('interview.typeLabels.technical'),
    behavioral: t('interview.typeLabels.behavioral'),
    situational: t('interview.typeLabels.situational'),
    motivation: t('interview.typeLabels.motivation'),
  }

  const handleGoToQuestion = (i: number) => {
    setLatestAnswer(null)
    setAnswerText('')
    setError('')
    setCurrentIndex(i)
  }

  const handleSubmit = async () => {
    if (!answerText.trim() || !currentQuestion) return
    setSubmitting(true)
    setError('')
    try {
      const res = await submitAnswer(Number(sessionId), {
        question_id: currentQuestion.id,
        answer_text: answerText.trim(),
      })
      const answer: Answer = res.data
      setLatestAnswer(answer)
      setSession((prev) => {
        if (!prev) return prev
        return { ...prev, questions: prev.questions.map((q) => q.id === currentQuestion.id ? { ...q, answer } : q) }
      })
    } catch (e: any) {
      const code = e.response?.data?.detail
      setError(t(`errors.${code}`, { defaultValue: t('interview.errorSubmit') }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    setLatestAnswer(null)
    setAnswerText('')
    setError('')
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await completeSession(Number(sessionId))
      navigate(`/results/${sessionId}`)
    } catch (e: any) {
      const code = e.response?.data?.detail
      setError(t(`errors.${code}`, { defaultValue: t('interview.errorComplete') }))
      setCompleting(false)
    }
  }

  const onNextOrComplete = () => {
    if (currentIndex < questions.length - 1) {
      handleNext()
    } else if (allAnswered) {
      handleComplete()
    }
  }

  return (
    <Layout>
      <div className="fade-up" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, marginTop: -8 }}>
        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 88, alignSelf: 'flex-start' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-bare"
            style={{ padding: '4px 0', fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}
          >
            <Icon name="chevron-left" size={13} /> {t('results.backBtn')}
          </button>

          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 16, fontSize: 10 }}>
            <span style={{ flex: 'none', height: 1, width: 20, background: 'var(--line)' }} />
            {session.company} · {session.job_title.split(' ').slice(0, 2).join(' ')}
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions.map((q, i) => {
              const isCurrent = i === currentIndex
              return (
                <li key={q.id}>
                  <button
                    onClick={() => handleGoToQuestion(i)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '8px 12px', borderRadius: 8,
                      border: `1px solid ${isCurrent ? 'var(--line-soft)' : 'transparent'}`,
                      background: isCurrent ? 'var(--bg-card)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 10,
                      cursor: 'pointer', color: 'var(--text-primary)',
                      transition: 'all .15s var(--ease)',
                    }}
                  >
                    <span className="tabular" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', width: 22 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      flex: 1, fontSize: 12,
                      color: q.answer ? 'var(--text-primary)' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {TYPE_LABELS[q.question_type]}
                    </span>
                    <span style={{
                      width: 6, height: 6, borderRadius: 99, flexShrink: 0,
                      background: q.answer ? 'var(--good)' : isCurrent ? 'var(--accent)' : 'var(--line-strong)',
                    }} />
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Timer */}
          <div style={{ marginTop: 24, padding: 16, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--line-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('interview.time')}</span>
              <button
                onClick={() => setTimerPaused(p => !p)}
                className="btn btn-bare" style={{ padding: 2 }}
              >
                <Icon name={timerPaused ? 'play' : 'pause'} size={11} />
              </button>
            </div>
            <div className="tabular" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)' }}>
              {fmtTime(elapsed)}
            </div>
            <div style={{ height: 2, background: 'var(--line-soft)', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width .5s var(--ease)' }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>
              {t('interview.questionOf', { current: answeredCount, total: questions.length })}
            </p>
          </div>
        </aside>

        {/* Main */}
        <div style={{ maxWidth: 760 }}>
          {/* Question header */}
          <div className="fade-up" key={`hdr-${currentIndex}`} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span className="tabular" style={{
                fontFamily: 'Instrument Serif, serif', fontSize: 56, fontStyle: 'italic',
                color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em',
              }}>
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="chip" style={{ width: 'fit-content', color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-soft)', fontSize: 11 }}>
                  {TYPE_LABELS[currentQuestion.question_type]}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 2.6vw, 30px)', lineHeight: 1.3, fontWeight: 400, letterSpacing: '-0.015em', margin: '0 0 16px' }}>
              {currentQuestion.question_text}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>
              ↳ {currentQuestion.focus}
            </p>
          </div>

          {/* Answer area */}
          {!displayAnswer && !submitting && (
            <div className="surface fade-up" style={{ padding: 0, overflow: 'hidden' }}>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit() }}
                placeholder={t('interview.placeholder')}
                style={{
                  width: '100%', minHeight: 220, padding: 24,
                  fontSize: 15, lineHeight: 1.6,
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', resize: 'vertical',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-inset)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="tabular">{answerText.split(/\s+/).filter(Boolean).length} {t('interview.words')}</span>
                  <span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--text-faint)' }} />
                  <span>{t('interview.sendHint')}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!answerText.trim()}
                  className="btn btn-accent"
                  style={{ opacity: answerText.trim() ? 1 : 0.4 }}
                >
                  <Icon name="send" size={14} /> {t('interview.submitBtn')}
                </button>
              </div>
              {error && (
                <div style={{ fontSize: 13, color: 'var(--bad)', padding: '10px 18px', borderTop: '1px solid var(--line-soft)' }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Submitting animation */}
          {submitting && (
            <div className="surface fade-up" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite' }} />
              <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 20, fontSize: 10, color: 'var(--accent)' }}>
                <span style={{ flex: 'none', height: 1, width: 20, background: 'var(--accent-line)' }} />
                {t('interview.evaluating')}
              </p>
              <div style={{ display: 'flex', gap: 6, paddingLeft: 4 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: 99, background: 'var(--accent)',
                    animation: 'pulse-soft 1.2s ease infinite',
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {!submitting && displayAnswer && (
            <FeedbackPanel
              answer={displayAnswer}
              onNext={onNextOrComplete}
              isLast={currentIndex === questions.length - 1 && allAnswered}
              isCompleting={completing}
            />
          )}

          {/* Not all answered warning */}
          {!submitting && displayAnswer && currentIndex === questions.length - 1 && !allAnswered && (
            <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 10, background: 'oklch(0.68 0.16 60 / 0.08)', border: '1px solid oklch(0.68 0.16 60 / 0.2)', fontSize: 13, color: 'var(--warn)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor', flexShrink: 0 }} />
              {t('interview.answerAllFirst')}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
