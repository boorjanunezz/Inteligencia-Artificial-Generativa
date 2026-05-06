import { useTheme } from '../context/ThemeContext'
import Icon from './Icon'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="toggle theme"
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: '1px solid var(--line-soft)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .2s var(--ease)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = 'var(--text-primary)'
        el.style.borderColor = 'var(--line-strong)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = 'var(--text-secondary)'
        el.style.borderColor = 'var(--line-soft)'
      }}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
    </button>
  )
}
