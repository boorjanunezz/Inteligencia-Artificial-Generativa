import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { createSession, parseCv } from '../services/api'

interface FormData {
  job_title: string
  company: string
  job_description: string
  cv_text: string
}

type CvMode = 'upload' | 'paste'
type UploadState = 'idle' | 'loading' | 'done' | 'error'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  )
}

function GeneratingScreen() {
  const { t } = useTranslation()
  const [phase, setPhase] = useState(0)
  const PHASES = [
    t('newSession.phases.0'),
    t('newSession.phases.1'),
    t('newSession.phases.2'),
    t('newSession.phases.3'),
    t('newSession.phases.4'),
  ]

  useEffect(() => {
    const timer = setTimeout(() => setPhase(p => (p + 1) % PHASES.length), 900)
    return () => clearTimeout(timer)
  }, [phase])

  return (
    <div className="fade-up" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div className="aurora" style={{ opacity: 0.5 }} />
      <div style={{ position: 'relative', maxWidth: 480 }}>
        <div style={{ width: 96, height: 96, margin: '0 auto 32px', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, var(--accent), oklch(0.7 0.18 220), var(--accent))',
            animation: 'orbit 3s linear infinite', filter: 'blur(2px)',
          }} />
          <div style={{
            position: 'absolute', inset: 4, borderRadius: '50%',
            background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="zap" size={32} style={{ color: 'var(--accent)' }} />
          </div>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 16px' }}>
          {t('newSession.generating')}
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
          {PHASES.map((p, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', fontSize: 14,
              color: i < phase ? 'var(--text-primary)' : i === phase ? 'var(--accent)' : 'var(--text-faint)',
              transition: 'color .3s var(--ease)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <span style={{ width: 16, display: 'inline-flex', justifyContent: 'center' }}>
                {i < phase ? (
                  <Icon name="check" size={14} />
                ) : i === phase ? (
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: 'currentColor', animation: 'pulse-soft 1s ease infinite' }} />
                ) : (
                  <span style={{ width: 4, height: 4, borderRadius: 99, background: 'currentColor' }} />
                )}
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function NewSession() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [cvMode, setCvMode] = useState<CvMode>('upload')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadInfo, setUploadInfo] = useState<{ name: string; pages: number } | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>()
  const jobTitle = watch('job_title') || ''
  const company = watch('company') || ''
  const jobDescription = watch('job_description') || ''
  const cvText = watch('cv_text') || ''

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError(t('newSession.pdfOnly'))
      return
    }
    setUploadState('loading')
    setUploadError('')
    try {
      const res = await parseCv(file)
      setValue('cv_text', res.data.text, { shouldValidate: true })
      setUploadInfo({ name: file.name, pages: res.data.pages })
      setUploadState('done')
    } catch (e: any) {
      setUploadError(e.response?.data?.detail || t('newSession.pdfError'))
      setUploadState('error')
    }
  }

  const canNext =
    step === 1 ? (jobTitle.trim().length > 0 && company.trim().length > 0 && jobDescription.trim().length >= 50)
    : step === 2 ? (cvText.trim().length >= 100)
    : true

  const doGenerate = handleSubmit(async (data) => {
    setError('')
    setGenerating(true)
    try {
      const res = await createSession(data)
      navigate(`/interview/${res.data.id}`)
    } catch (e: any) {
      const code = e.response?.data?.detail
      setError(t(`errors.${code}`, { defaultValue: t('newSession.createError') }))
      setGenerating(false)
    }
  })

  if (generating) {
    return (
      <Layout>
        <GeneratingScreen />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="fade-up" style={{ maxWidth: 760, margin: '0 auto' }}>
        <p className="section-rule" style={{ marginBottom: 16, justifyContent: 'flex-start' }}>
          <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
          {t('nav.newSession')} · {step}/3
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 12px' }}>
          {t('newSession.title')}{' '}
          <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>
            {t('newSession.titleItalic')}
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '0 0 40px' }}>
          {t('newSession.subtitle')}
        </p>

        {/* Progress rail */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              flex: 1, height: 3, borderRadius: 99,
              background: n <= step ? 'var(--accent)' : 'var(--line-soft)',
              transition: 'background .4s var(--ease)',
            }} />
          ))}
        </div>

        {/* Step 1: Job info */}
        {step === 1 && (
          <div className="surface fade-up" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label={t('newSession.jobTitleLabel')}>
                <input
                  {...register('job_title', { required: t('newSession.required') })}
                  className="input"
                  placeholder={t('newSession.jobTitlePlaceholder')}
                />
                {errors.job_title && <p style={{ fontSize: 12, color: 'var(--bad)', marginTop: 4 }}>{errors.job_title.message}</p>}
              </Field>
              <Field label={t('newSession.companyLabel')}>
                <input
                  {...register('company', { required: t('newSession.required') })}
                  className="input"
                  placeholder={t('newSession.companyPlaceholder')}
                />
                {errors.company && <p style={{ fontSize: 12, color: 'var(--bad)', marginTop: 4 }}>{errors.company.message}</p>}
              </Field>
            </div>
            <Field label={t('newSession.descriptionLabel')} hint={t('newSession.descriptionHint')}>
              <textarea
                {...register('job_description', { required: t('newSession.required'), minLength: { value: 50, message: t('newSession.minChars50') } })}
                className="input"
                rows={8}
                placeholder={t('newSession.descriptionPlaceholder')}
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, fontSize: 12, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="tabular">{jobDescription.length}</span>
              </div>
              {errors.job_description && <p style={{ fontSize: 12, color: 'var(--bad)', marginTop: 4 }}>{errors.job_description.message}</p>}
            </Field>
          </div>
        )}

        {/* Step 2: CV */}
        {step === 2 && (
          <div className="surface fade-up" style={{ padding: 32 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-inset)', borderRadius: 10, padding: 4 }}>
              {(['upload', 'paste'] as CvMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCvMode(m)}
                  style={{
                    flex: 1, padding: '8px 16px', borderRadius: 8, fontSize: 13,
                    background: cvMode === m ? 'var(--bg-card)' : 'transparent',
                    border: cvMode === m ? '1px solid var(--line-soft)' : '1px solid transparent',
                    color: cvMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all .15s var(--ease)',
                  }}
                >
                  {m === 'upload' ? t('newSession.cvUpload') : t('newSession.cvPaste')}
                </button>
              ))}
            </div>

            {cvMode === 'upload' && (
              <>
                {uploadState !== 'done' ? (
                  <div
                    onClick={() => uploadState !== 'loading' && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault(); setDragging(false)
                      const file = e.dataTransfer.files[0]; if (file) handleFile(file)
                    }}
                    style={{
                      border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--line)'}`,
                      background: dragging ? 'var(--accent-soft)' : 'transparent',
                      borderRadius: 12, padding: 56, textAlign: 'center', cursor: 'pointer',
                      transition: 'all .2s var(--ease)',
                      opacity: uploadState === 'loading' ? 0.65 : 1,
                    }}
                  >
                    <input
                      ref={fileInputRef} type="file" accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />
                    <div style={{ width: 56, height: 56, margin: '0 auto 20px', borderRadius: 14, background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      {uploadState === 'loading' ? (
                        <div style={{ width: 22, height: 22, border: '2px solid var(--line-soft)', borderTopColor: 'var(--accent)', borderRadius: 99, animation: 'orbit .8s linear infinite' }} />
                      ) : (
                        <Icon name="upload" size={22} />
                      )}
                    </div>
                    <p style={{ margin: '0 0 6px', fontWeight: 500, fontSize: 16 }}>
                      {uploadState === 'loading' ? '…' : t('newSession.cvUploadHint')}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>PDF</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 20,
                    border: '1px solid var(--accent-line)', background: 'var(--accent-soft)', borderRadius: 12,
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <Icon name="file" size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>{uploadInfo?.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        {uploadInfo?.pages} p.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setUploadState('idle'); setUploadInfo(null); setValue('cv_text', '') }}
                      className="btn btn-bare" style={{ padding: 6 }}
                    >
                      <Icon name="x" size={15} />
                    </button>
                  </div>
                )}

                {uploadError && <p style={{ fontSize: 13, color: 'var(--bad)', marginTop: 8 }}>{uploadError}</p>}
                <textarea
                  {...register('cv_text', { required: true, minLength: 100 })}
                  style={{ display: 'none' }}
                />
                {errors.cv_text && <p style={{ fontSize: 13, color: 'var(--bad)', marginTop: 8 }}>{t('newSession.cvUpload')}</p>}

                {uploadState === 'done' && cvText && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {t('newSession.cvLabel')}
                    </p>
                    <textarea
                      value={cvText}
                      onChange={(e) => setValue('cv_text', e.target.value, { shouldValidate: true })}
                      rows={6}
                      className="input"
                      style={{ resize: 'vertical', fontSize: 13 }}
                    />
                  </div>
                )}
              </>
            )}

            {cvMode === 'paste' && (
              <Field label={t('newSession.cvLabel')}>
                <textarea
                  {...register('cv_text', { required: t('newSession.required'), minLength: { value: 100, message: t('newSession.minChars100') } })}
                  rows={10}
                  className="input"
                  placeholder={t('newSession.cvPastePlaceholder')}
                  style={{ resize: 'vertical' }}
                />
                {errors.cv_text && <p style={{ fontSize: 12, color: 'var(--bad)', marginTop: 4 }}>{errors.cv_text.message}</p>}
              </Field>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="surface fade-up" style={{ padding: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: t('newSession.jobTitleLabel'), value: jobTitle },
                { label: t('newSession.companyLabel'), value: company },
                { label: t('newSession.descriptionLabel'), value: jobDescription.length > 280 ? jobDescription.slice(0, 280) + '…' : jobDescription },
                { label: t('newSession.cvLabel'), value: cvText ? `${cvText.length.toLocaleString()} chars` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 3 }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{value || '—'}</span>
                </div>
              ))}
            </div>
            {error && (
              <div style={{ marginTop: 20, fontSize: 13, color: 'var(--bad)', background: 'oklch(0.70 0.20 25 / 0.1)', border: '1px solid oklch(0.70 0.20 25 / 0.2)', borderRadius: 10, padding: '12px 14px' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
            className="btn btn-ghost"
          >
            <Icon name="chevron-left" size={14} /> {t('newSession.backBtn')}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="btn btn-accent"
              style={{ opacity: canNext ? 1 : 0.4 }}
            >
              {t('newSession.nextBtn')} <Icon name="arrow-right" size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={doGenerate}
              className="btn btn-accent"
            >
              {t('newSession.generateBtn')}
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
