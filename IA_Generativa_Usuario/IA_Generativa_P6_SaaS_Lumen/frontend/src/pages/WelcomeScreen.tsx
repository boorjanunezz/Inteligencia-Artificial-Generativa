import { useState, useEffect } from 'react'
import i18n from '../i18n'
import Logo from '../components/Logo'

const LANGUAGES = [
  { code: 'es', greeting: 'Bienvenido', label: 'Español', choose: 'Elige tu idioma' },
  { code: 'en', greeting: 'Welcome',    label: 'English',  choose: 'Choose your language' },
  { code: 'fr', greeting: 'Bienvenue',  label: 'Français', choose: 'Choisissez votre langue' },
  { code: 'zh', greeting: '欢迎',        label: '中文',      choose: '选择你的语言' },
]

interface Props {
  onComplete: () => void
}

export default function WelcomeScreen({ onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [textVisible, setTextVisible] = useState(true)
  const [entered, setEntered] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTextVisible(false)
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % LANGUAGES.length)
        setTextVisible(true)
      }, 380)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setExiting(true)
    setTimeout(onComplete, 650)
  }

  const current = LANGUAGES[currentIdx]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : entered ? 1 : 0,
      transition: exiting ? 'opacity 0.65s ease' : 'opacity 0.9s ease',
    }}>

      {/* Logo */}
      <div style={{
        marginBottom: 80,
        transform: entered ? 'translateY(0)' : 'translateY(20px)',
        transition: 'transform 1.1s cubic-bezier(.16,1,.3,1)',
      }}>
        <Logo size={34} />
      </div>

      {/* Greeting word */}
      <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          fontSize: 'clamp(52px, 9vw, 80px)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          lineHeight: 1,
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.38s ease, transform 0.38s ease',
        }}>
          {current.greeting}
        </span>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 20, marginBottom: 52 }}>
        {LANGUAGES.map((_, i) => (
          <div key={i} style={{
            height: 5,
            width: i === currentIdx ? 22 : 5,
            borderRadius: 3,
            background: i === currentIdx ? 'var(--accent)' : 'var(--line-strong)',
            transition: 'width 0.4s cubic-bezier(.2,.7,.2,1), background 0.4s ease',
          }} />
        ))}
      </div>

      {/* Cycling instruction */}
      <p style={{
        fontSize: 12,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 20,
        opacity: textVisible ? 1 : 0,
        transition: 'opacity 0.38s ease',
      }}>
        {current.choose}
      </p>

      {/* Language buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        {LANGUAGES.map(({ code, label }) => (
          <LangButton key={code} label={label} onClick={() => handleSelect(code)} />
        ))}
      </div>

      {/* Bottom tagline */}
      <p style={{
        position: 'absolute', bottom: 36,
        color: 'var(--text-faint)',
        fontSize: 12,
        letterSpacing: '0.04em',
      }}>
        Lumen — AI Interview Coach
      </p>
    </div>
  )
}

function LangButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '13px 26px',
        borderRadius: 13,
        border: `1px solid ${hovered ? 'var(--accent-line)' : 'var(--line)'}`,
        background: hovered ? 'var(--accent-soft)' : 'var(--bg-card)',
        color: hovered ? 'var(--accent)' : 'var(--text-primary)',
        fontSize: 15,
        fontWeight: 500,
        cursor: 'pointer',
        letterSpacing: '-0.01em',
        transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
      }}
    >
      {label}
    </button>
  )
}
