import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { login as apiLogin } from '../services/api'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import LangSwitcher from '../components/LangSwitcher'
import Icon from '../components/Icon'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError(t('auth.fillAll')); return }
    setLoading(true); setError('')
    try {
      const res = await apiLogin({ email, password })
      login(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (e: any) {
      const code = e.response?.data?.detail
      setError(t(`errors.${code}`, { defaultValue: t('auth.loginError') }))
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
            {t('auth.loginTitle')}.
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px', fontSize: 15 }}>{t('auth.loginSubtitle')}</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            {error && (
              <div style={{ fontSize: 13, color: 'var(--bad)', background: 'oklch(0.70 0.20 25 / 0.1)', border: '1px solid oklch(0.70 0.20 25 / 0.2)', borderRadius: 10, padding: '12px 14px' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn btn-accent" style={{ marginTop: 8, padding: '14px 18px', fontSize: 15 }}>
              {loading ? '…' : <><span>{t('auth.loginBtn')}</span><Icon name="arrow-right" size={14} /></>}
            </button>
          </form>

          <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{t('auth.register')}</Link>
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
            {t('landing.testimonialLabel')}
          </p>
          <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 32, lineHeight: 1.3, letterSpacing: '-0.01em', margin: '0 0 32px', fontWeight: 400 }}>
            "{t('landing.testimonialQuote')}"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 99, background: 'linear-gradient(135deg, var(--accent), oklch(0.7 0.14 220))' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>Marcus T.</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{t('landing.testimonialRole')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
