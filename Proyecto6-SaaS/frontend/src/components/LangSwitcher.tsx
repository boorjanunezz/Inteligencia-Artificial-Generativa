import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh', label: '中' },
]

export default function LangSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language

  const change = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  return (
    <div style={{ display: 'flex', gap: 2, padding: '3px', background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 99 }}>
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => change(lang.code)}
          style={{
            padding: '3px 8px',
            borderRadius: 99,
            border: 'none',
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            letterSpacing: '0.04em',
            background: current === lang.code ? 'var(--accent)' : 'transparent',
            color: current === lang.code ? 'white' : 'var(--text-muted)',
            transition: 'background .15s, color .15s',
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
