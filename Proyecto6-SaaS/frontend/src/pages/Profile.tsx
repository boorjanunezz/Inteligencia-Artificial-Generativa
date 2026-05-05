import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { getProfile, updateProfile, uploadProfileCv } from '../services/api'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import type { UserProfile } from '../types'

function TagInput({
  label, placeholder, values, onChange,
}: {
  label: string
  placeholder: string
  values: string[]
  onChange: (v: string[]) => void
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setInput('')
  }

  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {values.map(v => (
          <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg-hover)', border: '1px solid var(--line)', borderRadius: 99, fontSize: 13 }}>
            {v}
            <button
              onClick={() => onChange(values.filter(x => x !== v))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 0, lineHeight: 1, display: 'flex' }}
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          style={{
            flex: 1, padding: '10px 14px', background: 'var(--bg-input)',
            border: '1px solid var(--line-soft)', borderRadius: 10,
            color: 'var(--text-primary)', fontSize: 14, outline: 'none',
          }}
        />
        <button onClick={add} className="btn btn-bare" style={{ padding: '10px 14px', border: '1px solid var(--line-soft)', borderRadius: 10 }}>
          <Icon name="plus" size={14} />
        </button>
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 14, padding: '28px 32px', marginBottom: 20 }}>
      <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
        <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
        {title}
      </p>
      {children}
    </div>
  )
}

export default function Profile() {
  const { user, login } = useAuth()
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cvUploading, setCvUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [level, setLevel] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [modality, setModality] = useState('any')
  const [industries, setIndustries] = useState<string[]>([])
  const [language, setLanguage] = useState<'es' | 'en'>('es')

  const EXPERIENCE_LEVELS = [
    { value: 'junior', label: t('profile.levels.junior'), desc: t('profile.levelDesc.junior') },
    { value: 'mid', label: t('profile.levels.mid'), desc: t('profile.levelDesc.mid') },
    { value: 'senior', label: t('profile.levels.senior'), desc: t('profile.levelDesc.senior') },
    { value: 'lead', label: t('profile.levels.lead'), desc: t('profile.levelDesc.lead') },
  ]

  const MODALITIES = [
    { value: 'any', label: t('profile.modalities.any') },
    { value: 'remote', label: t('profile.modalities.remote') },
    { value: 'hybrid', label: t('profile.modalities.hybrid') },
    { value: 'onsite', label: t('profile.modalities.onsite') },
  ]

  useEffect(() => {
    getProfile()
      .then(res => {
        const p: UserProfile = res.data
        setProfile(p)
        setName(p.name)
        setLevel(p.experience_level || '')
        setRoles(p.target_roles || [])
        setLocations(p.target_locations || [])
        setModality(p.target_modality || 'any')
        setIndustries(p.target_industries || [])
        setLanguage(p.practice_language || 'es')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await updateProfile({
        name,
        experience_level: level || undefined,
        target_roles: roles,
        target_locations: locations,
        target_modality: modality,
        target_industries: industries,
        practice_language: language,
      })
      setProfile(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError(t('profile.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvUploading(true)
    setError('')
    try {
      const res = await uploadProfileCv(file)
      setProfile(res.data)
    } catch {
      setError(t('profile.cvError'))
    } finally {
      setCvUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 140, background: 'var(--bg-card)', borderRadius: 14 }} />)}
        </div>
      </Layout>
    )
  }

  const cvParsed = profile?.cv_parsed

  return (
    <Layout>
      <div className="fade-up">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
          <div>
            <p className="section-rule" style={{ marginBottom: 16, justifyContent: 'flex-start' }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
              {t('profile.subtitle')}
            </p>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.0, margin: 0 }}>
              {t('profile.title')}{' '}
              <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>
                {user?.name?.split(' ')[0]}.
              </span>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {error && <span style={{ fontSize: 13, color: 'var(--bad)' }}>{error}</span>}
            {saved && <span style={{ fontSize: 13, color: 'var(--good)' }}>{t('profile.saveSuccess')}</span>}
            <button onClick={handleSave} disabled={saving} className="btn btn-accent" style={{ padding: '12px 20px' }}>
              {saving ? t('profile.saving') : t('profile.saveBtn')}
            </button>
          </div>
        </div>

        {/* Completion banner */}
        {!profile?.profile_complete && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'oklch(0.25 0.06 50 / 0.4)', border: '1px solid oklch(0.55 0.14 50 / 0.4)', borderRadius: 12, marginBottom: 24, fontSize: 14 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('profile.incompleteHint')}</span>
          </div>
        )}

        {/* Personal info */}
        <SectionCard title={t('profile.sectionProfile')}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                {t('profile.nameLabel')}
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--line-soft)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                {t('profile.emailLabel')}
              </label>
              <input
                value={profile?.email || ''}
                disabled
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-hover)', border: '1px solid var(--line-soft)', borderRadius: 10, color: 'var(--text-faint)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Experience level */}
          <div style={{ marginTop: 24 }}>
            <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              {t('profile.levelLabel')}
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {EXPERIENCE_LEVELS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLevel(opt.value)}
                  style={{
                    padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
                    border: `1px solid ${level === opt.value ? 'var(--accent)' : 'var(--line-soft)'}`,
                    background: level === opt.value ? 'oklch(from var(--accent) l c h / 0.12)' : 'var(--bg-input)',
                    color: level === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                    transition: 'all .15s var(--ease)',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{opt.label}</span>
                  <span style={{ color: 'var(--text-faint)', fontSize: 12, marginLeft: 6 }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Practice language */}
          <div style={{ marginTop: 24 }}>
            <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              {t('profile.practiceLanguageLabel')}
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['es', 'en'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    border: `1px solid ${language === lang ? 'var(--accent)' : 'var(--line-soft)'}`,
                    background: language === lang ? 'oklch(from var(--accent) l c h / 0.12)' : 'var(--bg-input)',
                    color: language === lang ? 'var(--accent)' : 'var(--text-secondary)',
                    transition: 'all .15s var(--ease)',
                  }}
                >
                  {lang === 'es' ? `🇪🇸 ${t('profile.practiceLanguageEs')}` : `🇬🇧 ${t('profile.practiceLanguageEn')}`}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Job search preferences */}
        <SectionCard title={t('profile.sectionSearch')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <TagInput
              label={t('profile.rolesLabel')}
              placeholder={t('profile.rolesPlaceholder')}
              values={roles}
              onChange={setRoles}
            />
            <TagInput
              label={t('profile.locationsLabel')}
              placeholder={t('profile.locationsPlaceholder')}
              values={locations}
              onChange={setLocations}
            />

            <div>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                {t('profile.modalityLabel')}
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {MODALITIES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setModality(opt.value)}
                    style={{
                      padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
                      border: `1px solid ${modality === opt.value ? 'var(--accent)' : 'var(--line-soft)'}`,
                      background: modality === opt.value ? 'oklch(from var(--accent) l c h / 0.12)' : 'var(--bg-input)',
                      color: modality === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'all .15s var(--ease)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <TagInput
              label={t('profile.industriesLabel')}
              placeholder={t('profile.industriesPlaceholder')}
              values={industries}
              onChange={setIndustries}
            />
          </div>
        </SectionCard>

        {/* CV */}
        <SectionCard title={t('profile.sectionCV')}>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleCvUpload} style={{ display: 'none' }} />

          {profile?.cv_filename ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--bg-hover)', border: '1px solid var(--line-soft)', borderRadius: 10, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon name="file" size={16} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 14 }}>{profile.cv_filename}</span>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={cvUploading}
                  className="btn btn-bare"
                  style={{ fontSize: 13, padding: '6px 12px', border: '1px solid var(--line-soft)', borderRadius: 8 }}
                >
                  {cvUploading ? '…' : t('profile.cvUploadBtn')}
                </button>
              </div>

              {cvParsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {cvParsed.resumen && (
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                        {t('profile.cvParsedTitle')}
                      </p>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{cvParsed.resumen}</p>
                    </div>
                  )}

                  {cvParsed.skills && cvParsed.skills.length > 0 && (
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                        {t('profile.cvSkillsTitle')} ({cvParsed.skills.length})
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {cvParsed.skills.map(s => (
                          <span key={s} style={{ padding: '3px 10px', background: 'var(--bg-hover)', border: '1px solid var(--line-soft)', borderRadius: 99, fontSize: 12, color: 'var(--text-secondary)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvParsed.experiencia && cvParsed.experiencia.length > 0 && (
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                        {t('profile.cvExperienceTitle')}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {cvParsed.experiencia.map((exp, i) => (
                          <div key={i} style={{ padding: '12px 16px', border: '1px solid var(--line-soft)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div>
                              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500 }}>{exp.rol}</p>
                              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{exp.empresa}</p>
                            </div>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {exp.inicio}{exp.fin ? ` → ${exp.fin}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvParsed.educacion && cvParsed.educacion.length > 0 && (
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                        {t('profile.cvEducationTitle')}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {cvParsed.educacion.map((edu, i) => (
                          <div key={i} style={{ padding: '12px 16px', border: '1px solid var(--line-soft)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div>
                              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500 }}>{edu.titulo}</p>
                              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{edu.institucion}{edu.area ? ` · ${edu.area}` : ''}</p>
                            </div>
                            {edu.año_fin && (
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {edu.año_fin}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvParsed.idiomas && cvParsed.idiomas.length > 0 && (
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                        {t('profile.cvLanguagesTitle')}
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {cvParsed.idiomas.map((l, i) => (
                          <span key={i} style={{ padding: '4px 12px', background: 'var(--bg-hover)', border: '1px solid var(--line-soft)', borderRadius: 99, fontSize: 13 }}>
                            {l.idioma} · <span style={{ color: 'var(--accent)' }}>{l.nivel}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => !cvUploading && fileRef.current?.click()}
              style={{
                border: '2px dashed var(--line-soft)', borderRadius: 12, padding: '40px 24px',
                textAlign: 'center', cursor: 'pointer',
                transition: 'border-color .15s var(--ease), background .15s var(--ease)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLDivElement).style.background = 'oklch(from var(--accent) l c h / 0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line-soft)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              {cvUploading ? (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 15 }}>…</p>
              ) : (
                <>
                  <Icon name="upload" size={24} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
                  <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 500 }}>{t('profile.cvUploadTitle')}</p>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-faint)' }}>{t('profile.cvNoFile')}</p>
                </>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </Layout>
  )
}
