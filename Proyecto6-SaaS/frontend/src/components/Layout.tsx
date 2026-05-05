import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Icon from './Icon'
import LangSwitcher from './LangSwitcher'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const handleLogout = () => { logout(); navigate('/') }

  const navItems = [
    { path: '/dashboard', label: t('nav.sessions') },
    { path: '/jobs',      label: t('nav.offers') },
    { path: '/new',       label: t('nav.newSession') },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'color-mix(in oklab, var(--bg-base) 80%, transparent)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Logo size={20} />
            </Link>
            <nav style={{ display: 'flex', gap: 4 }}>
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="btn btn-bare"
                  style={{
                    fontSize: 14, textDecoration: 'none',
                    color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: location.pathname === item.path ? 'var(--bg-hover)' : 'transparent',
                    borderRadius: 8,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LangSwitcher />
            <ThemeToggle />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 4px 4px', borderRadius: 99, border: '1px solid var(--line-soft)' }}>
              <div style={{ width: 26, height: 26, borderRadius: 99, background: 'linear-gradient(135deg, var(--accent), oklch(0.7 0.18 220))', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                {user?.name?.[0] || '?'}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.name?.split(' ')[0]}</span>
            </div>
            <Link to="/profile" className="btn btn-bare" title={t('nav.profile')} style={{ padding: 8, textDecoration: 'none', color: location.pathname === '/profile' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              <Icon name="user" size={15} />
            </Link>
            <button onClick={handleLogout} className="btn btn-bare" title={t('nav.logout')} style={{ padding: 8 }}>
              <Icon name="logout" size={15} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '40px 32px 80px' }}>
        {children}
      </main>
    </div>
  )
}
