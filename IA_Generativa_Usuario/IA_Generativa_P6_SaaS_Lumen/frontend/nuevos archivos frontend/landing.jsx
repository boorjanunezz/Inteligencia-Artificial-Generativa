/* === Lumen — Landing & Auth screens === */

const { useState: useStateLanding } = React;

function Nav() {
  const { go } = useRouter();
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'color-mix(in oklab, var(--bg-base) 80%, transparent)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => go('landing')} style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <Logo />
        </button>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14 }}>
          {[
            ['#features', 'Producto'],
            ['#how', 'Cómo funciona'],
            ['#pricing', 'Precios'],
            ['#manifesto', 'Manifiesto'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="link" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle />
          <button onClick={() => go('login')} className="btn btn-bare">Iniciar sesión</button>
          <button onClick={() => go('register')} className="btn btn-primary">Empezar gratis →</button>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  const { go } = useRouter();
  return (
    <div className="fade-in" style={{ paddingTop: 64 }}>
      <Nav />
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 32px 80px' }}>
        <div className="aurora" style={{ position: 'absolute', inset: 0 }}/>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}/>
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div className="fade-up" style={{ animationDelay: '0ms' }}>
            <span className="chip chip-accent" style={{ marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}/>
              GPT-4o · Disponible para Spring '26
            </span>
          </div>
          <h1 className="fade-up" style={{
            animationDelay: '80ms',
            margin: '0 auto 24px',
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 0.96,
            maxWidth: 1000,
          }}>
            La entrevista perfecta
            <br/>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>
              empieza antes
            </span>{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
              de la entrevista.
            </span>
          </h1>
          <p className="fade-up" style={{
            animationDelay: '160ms',
            maxWidth: 620, margin: '0 auto 40px',
            fontSize: 19, lineHeight: 1.5,
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em',
          }}>
            Lumen genera simulaciones a medida desde tu CV y la oferta real, evalúa cada respuesta con análisis cualitativo y semántico, y te entrega un plan de mejora accionable.
          </p>
          <div className="fade-up" style={{ animationDelay: '240ms', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => go('register')} className="btn btn-accent" style={{ padding: '14px 22px', fontSize: 15 }}>
              Empezar gratis <Icon name="arrow-right" size={15}/>
            </button>
            <button onClick={() => go('interview', { sessionId: 1, demo: true })} className="btn btn-ghost" style={{ padding: '14px 22px', fontSize: 15 }}>
              Ver demo en vivo
            </button>
          </div>

          {/* Trust strip */}
          <div className="fade-up" style={{ animationDelay: '320ms', marginTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap', color: 'var(--text-faint)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            <span>Usado para preparar entrevistas en</span>
            {['Stripe', 'Linear', 'Vercel', 'Anthropic', 'Notion'].map(n => (
              <span key={n} style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{n}</span>
            ))}
          </div>
        </div>

        {/* Floating preview card */}
        <div className="fade-up" style={{ animationDelay: '400ms', position: 'relative', maxWidth: 980, margin: '80px auto 0', perspective: 1200 }}>
          <PreviewCard />
        </div>
      </section>

      {/* FEATURES — Comparison piece */}
      <ProductSection/>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '120px 32px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-elevated)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="section-rule" style={{ marginBottom: 24 }}>—— 02 · Proceso</p>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05, maxWidth: 720, margin: '0 0 64px' }}>
            Tres pasos.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Sin fricción.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { n: '01', title: 'Sube tu CV', desc: 'Arrastra el PDF. La IA lo lee y extrae tus puntos fuertes y áreas de duda.' },
              { n: '02', title: 'Pega la oferta', desc: 'Copia el texto del puesto al que aplicas. Cuanto más detallada, más precisa la simulación.' },
              { n: '03', title: 'Practica y mejora', desc: 'Responde 8 preguntas, recibe feedback y un plan personalizado de 30 días.' },
            ].map(s => (
              <div key={s.n} style={{ background: 'var(--bg-card)', padding: 40 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 24 }}>{s.n}</div>
                <h3 style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 12px' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, fontSize: 15 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section id="manifesto" style={{ padding: '160px 32px', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <p className="section-rule" style={{ marginBottom: 32 }}>—— 03 · Manifiesto</p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            lineHeight: 1.25,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
            margin: 0,
            fontWeight: 400,
          }}>
            Las entrevistas no son sobre saber respuestas. Son sobre{' '}
            <em style={{ color: 'var(--accent)' }}>pensar bajo presión</em>, comunicar con claridad, y conectar tu historia con la de la empresa. Lumen no te da las respuestas. Te entrena para encontrarlas.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '120px 32px', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <p className="section-rule" style={{ marginBottom: 24 }}>—— 04 · Precios</p>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 64px' }}>
            Simple. Transparente.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { name: 'Free', price: '0€', period: 'siempre', features: ['3 sesiones / mes', '8 preguntas por sesión', 'Feedback completo', 'Plan de mejora'], cta: 'Empezar gratis', accent: false },
              { name: 'Pro', price: '12€', period: 'mes', features: ['Sesiones ilimitadas', 'Historial completo', 'Plan de mejora avanzado', 'Export PDF del informe', 'Modo voz (próx.)'], cta: 'Probar 7 días gratis', accent: true },
              { name: 'Equipo', price: 'A medida', period: '', features: ['Para bootcamps y career coaches', 'Dashboard de estudiantes', 'Branding personalizado', 'Soporte dedicado'], cta: 'Hablar con ventas', accent: false },
            ].map(plan => (
              <PricingCard key={plan.name} {...plan} go={go}/>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: '48px 32px', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
          <Logo size={18}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em' }}>© 2026 · LUMEN LABS</span>
        </div>
      </footer>
    </div>
  );
}

function ProductSection() {
  const generic = [
    'Háblame de ti',
    '¿Cuál es tu mayor debilidad?',
    '¿Por qué quieres este trabajo?',
    'Describe un momento difícil en el trabajo',
  ];
  const tailored = [
    'Tu CV menciona React Server Components. ¿Cuándo eliges Server sobre Client en una app de e-commerce a escala?',
    'Llevas 3 años en startups Series-A. ¿Qué te atrae específicamente del problema de pagos que resuelve Stripe?',
    'Mencionas haber liderado la migración a TypeScript en Glovo. Cuéntame el RFC y cómo gestionaste la resistencia del equipo.',
    'Stripe Checkout pesa 2.4MB. Tu primer sprint: ¿por dónde empezarías y qué métricas seguirías?',
  ];

  return (
    <section id="features" style={{ padding: '140px 32px', borderTop: '1px solid var(--line-soft)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p className="section-rule" style={{ marginBottom: 24, justifyContent: 'flex-start' }}>
          <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
          01 · La diferencia
        </p>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.0, maxWidth: 880, margin: '0 0 12px' }}>
          Otras apps te dan{' '}
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>las mismas preguntas</span>{' '}
          que a todos.
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 0 64px', lineHeight: 1.5 }}>
          Lumen lee tu CV línea por línea, cruza tu experiencia con la oferta concreta, y construye preguntas que solo a <em style={{ fontFamily: 'var(--font-serif)' }}>ti</em> te harían.
        </p>

        {/* Side-by-side comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--line-soft)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)' }}>
          {/* GENERIC */}
          <div style={{ padding: 36, borderRight: '1px solid var(--line-soft)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Otras apps
              </span>
              <span className="chip" style={{ fontSize: 10, opacity: 0.6 }}>GENÉRICO</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
              {generic.map((q, i) => (
                <li key={i} style={{
                  fontSize: 15, lineHeight: 1.5, color: 'var(--text-faint)',
                  padding: '14px 0',
                  borderBottom: i < generic.length - 1 ? '1px solid var(--line-soft)' : 'none',
                  display: 'flex', gap: 14,
                  textDecoration: 'line-through', textDecorationColor: 'var(--line)', textDecorationThickness: '1px',
                }}>
                  <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', flexShrink: 0, paddingTop: 3 }}>
                    {String(i+1).padStart(2,'0')}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* TAILORED */}
          <div style={{ padding: 36, position: 'relative', overflow: 'hidden' }}>
            <div className="aurora" style={{ opacity: 0.35 }}/>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Lumen — para Carla, Senior FE @ Stripe
                </span>
                <span className="chip chip-accent" style={{ fontSize: 10 }}>HECHAS PARA TI</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
                {tailored.map((q, i) => (
                  <li key={i} style={{
                    fontSize: 15, lineHeight: 1.5, color: 'var(--text-primary)',
                    padding: '14px 0',
                    borderBottom: i < tailored.length - 1 ? '1px solid var(--line-soft)' : 'none',
                    display: 'flex', gap: 14,
                  }}>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', flexShrink: 0, paddingTop: 3 }}>
                      {String(i+1).padStart(2,'0')}
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Three capability rows — editorial, no card-grid feel */}
        <div style={{ marginTop: 96 }}>
          {[
            { n: '02', kicker: 'Evaluación dual', title: <>Análisis cualitativo de GPT-4o + similitud semántica por embeddings.</>, desc: 'Cada respuesta recibe dos puntuaciones que se cruzan: una mide cómo de bien razonas, la otra cómo de cerca estás del contenido ideal. Una métrica única engaña; dos te dicen qué falta.' },
            { n: '03', kicker: 'Feedback en tiempo real', title: <>Streaming inmediato. <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Sin espera, sin opacidad.</span></>, desc: 'Envías. Lees el feedback aparecer línea a línea, en menos de 5 segundos. Ves los puntos fuertes, las mejoras concretas, y la respuesta ideal antes de pasar a la siguiente pregunta.' },
            { n: '04', kicker: 'Plan de 30 días', title: <>No te dejamos solo con un score.</>, desc: 'Al cerrar la sesión, Lumen genera un plan personalizado de cuatro semanas: qué practicar primero, qué leer, con quién hacer mocks, y cuáles de tus respuestas vale la pena reintentar.' },
          ].map((row, i) => (
            <div key={row.n} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 1.4fr',
              gap: 48,
              padding: '44px 0',
              borderTop: '1px solid var(--line-soft)',
              alignItems: 'flex-start',
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', margin: '0 0 8px' }}>
                  {row.n}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                  {row.kicker}
                </p>
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
                {row.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                {row.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, kicker, title, desc, index }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--line-soft)',
        borderRadius: 14,
        padding: 28,
        transition: 'border-color .3s var(--ease), transform .3s var(--ease)',
        borderColor: hover ? 'var(--line-strong)' : 'var(--line-soft)',
        transform: hover ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--accent-line)',
        }}>
          <Icon name={icon} size={18}/>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em' }}>0{index}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>{kicker}</p>
      <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.015em', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, fontSize: 14 }}>{desc}</p>
    </div>
  );
}

function PricingCard({ name, price, period, features, cta, accent, go }) {
  return (
    <div style={{
      position: 'relative',
      background: accent ? 'var(--bg-card)' : 'var(--bg-card)',
      border: accent ? '1px solid var(--accent-line)' : '1px solid var(--line-soft)',
      borderRadius: 14,
      padding: 32,
      overflow: 'hidden',
    }}>
      {accent && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--accent-soft), transparent 60%)', pointerEvents: 'none' }}/>}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontWeight: 500, fontSize: 16 }}>{name}</span>
          {accent && <span className="chip chip-accent" style={{ fontSize: 10, padding: '2px 8px' }}>POPULAR</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
          <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em' }}>{price}</span>
          {period && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/ {period}</span>}
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
              <Icon name="check" size={14} className="" /> <span>{f}</span>
            </li>
          ))}
        </ul>
        <button onClick={() => go('register')} className={accent ? 'btn btn-accent' : 'btn btn-ghost'} style={{ width: '100%' }}>
          {cta}
        </button>
      </div>
    </div>
  );
}

// Mini preview card on the hero — shows a faux interview state
function PreviewCard() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--line-soft)',
      borderRadius: 16,
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
      transform: 'rotateX(2deg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--line-soft)', background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <span key={c} style={{ width: 11, height: 11, borderRadius: 99, background: c, opacity: 0.7 }}/>)}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>lumen.app/interview/stripe-senior-fe</span>
        <div style={{ width: 33 }}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 380 }}>
        <div style={{ padding: 32, borderRight: '1px solid var(--line-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span className="chip" style={{ fontSize: 11 }}>Pregunta 3 / 8</span>
            <span className="chip chip-accent" style={{ fontSize: 11 }}>Situacional</span>
          </div>
          <p style={{ fontSize: 18, lineHeight: 1.5, margin: '0 0 24px', letterSpacing: '-0.01em' }}>
            Llegas a Stripe y descubres que el bundle del checkout pesa 2.4MB. Tu manager te pide reducirlo a la mitad en una semana. <span style={{ color: 'var(--text-muted)' }}>¿Por dónde empezarías?</span>
          </p>
          <div style={{
            background: 'var(--bg-inset)',
            border: '1px solid var(--line-soft)',
            borderRadius: 10,
            padding: 16,
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            fontFamily: 'var(--font-mono)',
            minHeight: 100,
          }}>
            Empezaría por medir antes de optimizar. Primero un bundle analyzer<span style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--accent)', verticalAlign: 'middle', marginLeft: 2, animation: 'pulse-soft 1s ease infinite' }}/>
          </div>
        </div>
        <div style={{ padding: 24, background: 'var(--bg-inset)' }}>
          <p className="section-rule" style={{ fontSize: 10, marginBottom: 20 }}>FEEDBACK EN VIVO</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
            <span className="tabular" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--accent)' }}>84</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>/100</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', fontFamily: 'var(--font-mono)' }}>Verdict</p>
          <p style={{ fontSize: 14, color: 'oklch(0.72 0.16 230)', fontWeight: 500, margin: '0 0 24px' }}>Buena · Necesita ejemplos concretos</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', fontFamily: 'var(--font-mono)' }}>Mejoras</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--warn)' }}>→</span> Falta ejemplo de e-commerce</li>
            <li style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--warn)' }}>→</span> No mencionas SEO</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------- Auth ----------
function AuthShell({ title, subtitle, children, footer }) {
  const { go } = useRouter();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      {/* Left side — form */}
      <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', padding: '32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'auto' }}>
          <button onClick={() => go('landing')} style={{ background: 'transparent', border: 'none', padding: 0 }}>
            <Logo />
          </button>
          <ThemeToggle />
        </div>
        <div style={{ maxWidth: 380, width: '100%', margin: 'auto', padding: '60px 0' }} className="fade-up">
          <h1 style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 8px', lineHeight: 1.1 }}>{title}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px', fontSize: 15 }}>{subtitle}</p>
          {children}
          {footer}
        </div>
        <div style={{ marginTop: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-faint)' }}>
          © 2026 LUMEN LABS
        </div>
      </div>
      {/* Right side — editorial panel */}
      <div style={{
        flex: '1 1 50%',
        background: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--line-soft)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
      }} className="auth-side">
        <div className="aurora" style={{ opacity: 0.6 }}/>
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <p className="section-rule" style={{ marginBottom: 32, justifyContent: 'flex-start' }}><span style={{ flex: 'none', height: 1, width: 32, background: 'var(--line)' }}/>TESTIMONIO · 04 · 2026</p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 32,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            margin: '0 0 32px',
            fontWeight: 400,
          }}>
            "Hice 12 sesiones en Lumen antes de mi onsite en Stripe. Los <em style={{ color: 'var(--accent)' }}>patrones de feedback</em> que detecté me ayudaron más que cualquier libro de prep."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 99, background: 'linear-gradient(135deg, var(--accent), oklch(0.7 0.18 220))' }}/>
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>Marcus T.</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Senior FE Engineer · ex-Lumen user</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 880px) {
          .auth-side { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Login() {
  const { go } = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('carla@example.com');
  const [pw, setPw] = useState('••••••••');
  const submit = (e) => { e.preventDefault(); login({ name: 'Carla Mendez', email }); go('dashboard'); };
  return (
    <AuthShell
      title="Bienvenido."
      subtitle="Continúa donde lo dejaste."
      footer={
        <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
          ¿Aún no tienes cuenta?{' '}
          <button onClick={() => go('register')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: 14 }}>Regístrate gratis</button>
        </p>
      }
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"/>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contraseña</label>
          <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••"/>
        </div>
        <button type="submit" className="btn btn-accent" style={{ marginTop: 8, padding: '14px 18px', fontSize: 15 }}>
          Entrar <Icon name="arrow-right" size={14}/>
        </button>
      </form>
    </AuthShell>
  );
}

function Register() {
  const { go } = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const submit = (e) => { e.preventDefault(); login({ name: name || 'Carla Mendez', email: email || 'carla@example.com' }); go('dashboard'); };
  return (
    <AuthShell
      title="Crea tu cuenta."
      subtitle="Gratis para siempre. Sin tarjeta."
      footer={
        <p style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => go('login')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: 14 }}>Inicia sesión</button>
        </p>
      }
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Nombre</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"/>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"/>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contraseña</label>
          <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Mín. 6 caracteres"/>
        </div>
        <button type="submit" className="btn btn-accent" style={{ marginTop: 8, padding: '14px 18px', fontSize: 15 }}>
          Crear cuenta <Icon name="arrow-right" size={14}/>
        </button>
      </form>
    </AuthShell>
  );
}

Object.assign(window, { Landing, Login, Register, Nav });
