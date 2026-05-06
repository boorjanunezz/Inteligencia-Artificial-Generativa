interface LogoProps {
  size?: number
  withText?: boolean
}

export default function Logo({ size = 22, withText = true }: LogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span className="logo-mark" style={{ width: size, height: size }} />
      {withText && (
        <span style={{
          fontWeight: 600,
          letterSpacing: '-0.02em',
          fontSize: size > 24 ? 22 : 16,
          color: 'var(--text-primary)',
        }}>
          Lumen
        </span>
      )}
    </div>
  )
}
