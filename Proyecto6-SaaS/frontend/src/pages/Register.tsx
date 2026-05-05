import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { register as apiRegister } from '../services/api'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import LangSwitcher from '../components/LangSwitcher'
import Icon from '../components/Icon'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setError(t('auth.fillAll')); return }
    if (password.length < 6) { setError(t('auth.passwordLength')); return }
    setLoading(true); setError('')
    try {
      const res = await apiRegister({ name, email, password })
      login(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (e: any) {
      const code = e.response?.data?.detail
      setError(t(`errors.${code}`, { defaultValue: t('auth.registerError') }))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      {/* Form side */}
      <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', padding: '32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'auto' }}>
          <Link to="/" style={{ textDecoration: 'none' }}><Logo /></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="fade-up" style={{ maxWidth: 380, width: '100%', margin: 'auto', padding: '60px 0' }}>
          <h1 style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 8px', lineHeight: 1.1 }}>
            {t('auth.registerTitle')}.
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px', fontSize: 15 }}>{t('auth.registerSubtitle')}</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {t('auth.name')}
              </label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.namePlaceholder')} autoComplete="name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {t('auth.email')}
              </label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.emailPlaceholder')} autoComplete="email" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {t('auth.password')}
              </label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.passwordPlaceholder')} autoComplete="new-password" />
            </div>
            {error && (
              <div style={{ fontSize: 13, color: 'var(--bad)', background: 'oklch(0.70 0.20 25 / 0.1)', border: '1px solid oklch(0.70 0.20 25 / 0.2)', borderRadius: 10, padding: '12px 14px' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn btn-accent" style={{ marginTop: 8, padding: '14px 18px', fontSize: 15 }}>
              {loading ? '…' : <><span>{t('auth.registerBtn')}</span><Icon name="arrow-right" size={14} /></>}
            </button>
          </form>

          <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{t('auth.loginLink')}</Link>
          </p>
        </div>
        <div style={{ marginTop: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-faint)' }}>
          {t('landing.footer')}
        </div>
      </div>

      {/* Editorial side */}
      <div style={{ flex: '1 1 50%', background: 'var(--bg-elevated)', borderLeft: '1px solid var(--line-soft)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div className="aurora" style={{ opacity: 0.6 }} />
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <p className="section-rule" style={{ marginBottom: 32, justifyContent: 'flex-start' }}>
            <span style={{ flex: 'none', height: 1, width: 32, background: 'var(--line)' }} />
            {t('landing.whyLumen')}
          </p>
          <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 32, lineHeight: 1.3, letterSpacing: '-0.01em', margin: '0 0 32px', fontWeight: 400 }}>
            {t('landing.whyLumenQuote')} <em style={{ color: 'var(--accent)' }}>{t('landing.whyLumenItalic')}</em>{t('landing.whyLumenPost')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { n: '01', text: t('landing.whyLumen01') },
              { n: '02', text: t('landing.whyLumen02') },
              { n: '03', text: t('landing.whyLumen03') },
            ].map(item => (
              <div key={item.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', flexShrink: 0, paddingTop: 2 }}>{item.n}</span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
