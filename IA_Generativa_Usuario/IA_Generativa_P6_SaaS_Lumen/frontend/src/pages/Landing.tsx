import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import LangSwitcher from '../components/LangSwitcher'
import Icon from '../components/Icon'

export default function Landing() {
  const { t } = useTranslation()

  const generic = [
    t('landing.genericQ1'),
    t('landing.genericQ2'),
    t('landing.genericQ3'),
    t('landing.genericQ4'),
  ]
  const tailored = [
    t('landing.tailoredQ1'),
    t('landing.tailoredQ2'),
    t('landing.tailoredQ3'),
    t('landing.tailoredQ4'),
  ]

  return (
    <div className="fade-in" style={{ paddingTop: 64 }}>
      {/* Nav */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'color-mix(in oklab, var(--bg-base) 80%, transparent)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14 }}>
            {([
              ['#features', t('landing.navProduct')],
              ['#how', t('landing.navHow')],
              ['#pricing', t('landing.navPricing')],
              ['#manifesto', t('landing.navManifesto')],
            ] as [string, string][]).map(([href, label]) => (
              <a key={href} href={href} className="link" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LangSwitcher />
            <ThemeToggle />
            <Link to="/login" className="btn btn-bare" style={{ textDecoration: 'none' }}>{t('landing.login')}</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>{t('landing.startFree')}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 32px 80px' }}>
        <div className="aurora" style={{ position: 'absolute', inset: 0 }} />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div className="fade-up" style={{ animationDelay: '0ms' }}>
            <span className="chip chip-accent" style={{ marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
              {t('landing.heroChip')}
            </span>
          </div>
          <h1 className="fade-up" style={{ animationDelay: '80ms', margin: '0 auto 24px', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 0.96, maxWidth: 1000 }}>
            {t('landing.heroTitle1')}
            <br />
            <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>{t('landing.heroTitle2italic')}</span>{' '}
            <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400 }}>{t('landing.heroTitle3')}</span>
          </h1>
          <p className="fade-up" style={{ animationDelay: '160ms', maxWidth: 620, margin: '0 auto 40px', fontSize: 19, lineHeight: 1.5, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
            {t('landing.heroSubtitle')}
          </p>
          <div className="fade-up" style={{ animationDelay: '240ms', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-accent" style={{ padding: '14px 22px', fontSize: 15, textDecoration: 'none' }}>
              {t('landing.heroCta1')} <Icon name="arrow-right" size={15} />
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '14px 22px', fontSize: 15, textDecoration: 'none' }}>
              {t('landing.login')}
            </Link>
          </div>
          <div className="fade-up" style={{ animationDelay: '320ms', marginTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap', color: 'var(--text-faint)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
            <span>{t('landing.heroPrep')}</span>
            {['Stripe', 'Google', 'Vercel', 'Anthropic', 'Notion'].map(n => (
              <span key={n} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features — comparison */}
      <section id="features" style={{ padding: '140px 32px', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="section-rule" style={{ marginBottom: 24, justifyContent: 'flex-start' }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
            {t('landing.featSection')}
          </p>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.0, maxWidth: 880, margin: '0 0 12px' }}>
            {t('landing.featTitle1')}{' '}
            <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>{t('landing.featTitle2italic')}</span>{' '}
            {t('landing.featTitle3')}
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 0 64px', lineHeight: 1.5 }}>
            {t('landing.featSubtitle')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--line-soft)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)' }}>
            <div style={{ padding: 36, borderRight: '1px solid var(--line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t('landing.colGeneric')}</span>
                <span className="chip" style={{ fontSize: 10, opacity: 0.6 }}>{t('landing.tagGeneric')}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {generic.map((q, i) => (
                  <li key={i} style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text-faint)', padding: '14px 0', borderBottom: i < generic.length - 1 ? '1px solid var(--line-soft)' : 'none', display: 'flex', gap: 14, textDecoration: 'line-through', textDecorationColor: 'var(--line)' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', flexShrink: 0, paddingTop: 3 }}>{String(i+1).padStart(2,'0')}</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: 36, position: 'relative', overflow: 'hidden' }}>
              <div className="aurora" style={{ opacity: 0.35 }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t('landing.colTailored')}</span>
                  <span className="chip chip-accent" style={{ fontSize: 10 }}>{t('landing.tagTailored')}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {tailored.map((q, i) => (
                    <li key={i} style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text-primary)', padding: '14px 0', borderBottom: i < tailored.length - 1 ? '1px solid var(--line-soft)' : 'none', display: 'flex', gap: 14 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', flexShrink: 0, paddingTop: 3 }}>{String(i+1).padStart(2,'0')}</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Capability rows */}
          <div style={{ marginTop: 96 }}>
            {[
              { n: '02', kicker: t('landing.feat02kicker'), title: <>{t('landing.feat02title')}</>, desc: t('landing.feat02desc') },
              { n: '03', kicker: t('landing.feat03kicker'), title: <>{t('landing.feat03title')} <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: 'var(--text-muted)' }}>{t('landing.feat03titleItalic')}</span></>, desc: t('landing.feat03desc') },
              { n: '04', kicker: t('landing.feat04kicker'), title: <>{t('landing.feat04title')}</>, desc: t('landing.feat04desc') },
            ].map(row => (
              <div key={row.n} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1.4fr', gap: 48, padding: '44px 0', borderTop: '1px solid var(--line-soft)', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', margin: '0 0 8px' }}>{row.n}</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>{row.kicker}</p>
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>{row.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{row.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '120px 32px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-elevated)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="section-rule" style={{ marginBottom: 24 }}>—— {t('landing.howSection')}</p>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05, maxWidth: 720, margin: '0 0 64px' }}>
            {t('landing.howTitle1')}{' '}
            <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: 'var(--text-muted)' }}>{t('landing.howTitle2italic')}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { n: '01', title: t('landing.step1title'), desc: t('landing.step1desc') },
              { n: '02', title: t('landing.step2title'), desc: t('landing.step2desc') },
              { n: '03', title: t('landing.step3title'), desc: t('landing.step3desc') },
            ].map(s => (
              <div key={s.n} style={{ background: 'var(--bg-card)', padding: 40 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 24 }}>{s.n}</div>
                <h3 style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 12px' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, fontSize: 15 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section id="manifesto" style={{ padding: '160px 32px', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <p className="section-rule" style={{ marginBottom: 32 }}>—— {t('landing.manifestoSection')}</p>
          <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: 1.25, letterSpacing: '-0.015em', color: 'var(--text-primary)', margin: 0, fontWeight: 400 }}>
            {t('landing.manifestoPre')}{' '}
            <em style={{ color: 'var(--accent)' }}>{t('landing.manifestoItalic')}</em>
            {t('landing.manifestoPost')}
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '120px 32px', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <p className="section-rule" style={{ marginBottom: 24 }}>—— {t('landing.pricingSection')}</p>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 64px' }}>{t('landing.pricingTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              {
                name: 'Free', price: '0€', period: t('landing.freePeriod'),
                features: [t('landing.freeF1'), t('landing.freeF2'), t('landing.freeF3'), t('landing.freeF4'), t('landing.freeF5')],
                cta: t('landing.freeCta'), accent: false, href: '/register',
              },
              {
                name: 'Pro', price: '12€', period: t('landing.proPeriod'),
                features: [t('landing.proF1'), t('landing.proF2'), t('landing.proF3'), t('landing.proF4'), t('landing.proF5')],
                cta: t('landing.proCta'), accent: true, href: '#',
              },
              {
                name: t('landing.teamName'), price: t('landing.teamPrice'), period: '',
                features: [t('landing.teamF1'), t('landing.teamF2'), t('landing.teamF3'), t('landing.teamF4')],
                cta: t('landing.teamCta'), accent: false, href: '#',
              },
            ].map(plan => (
              <div key={plan.name} style={{ position: 'relative', background: 'var(--bg-card)', border: plan.accent ? '1px solid var(--accent-line)' : '1px solid var(--line-soft)', borderRadius: 14, padding: 32, overflow: 'hidden' }}>
                {plan.accent && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--accent-soft), transparent 60%)', pointerEvents: 'none' }} />}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <span style={{ fontWeight: 500, fontSize: 16 }}>{plan.name}</span>
                    {plan.accent && <span className="chip chip-accent" style={{ fontSize: 10, padding: '2px 8px' }}>{t('landing.popularLabel')}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                    <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em' }}>{plan.price}</span>
                    {plan.period && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/ {plan.period}</span>}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                        <Icon name="check" size={14} /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.href} className={plan.accent ? 'btn btn-ghost' : 'btn btn-accent'} style={{ width: '100%', textDecoration: 'none', opacity: plan.href === '#' ? 0.5 : 1 }}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: '48px 32px', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
          <Logo size={18} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.08em' }}>{t('landing.footer')} — Master IA Generativa</span>
        </div>
      </footer>
    </div>
  )
}
