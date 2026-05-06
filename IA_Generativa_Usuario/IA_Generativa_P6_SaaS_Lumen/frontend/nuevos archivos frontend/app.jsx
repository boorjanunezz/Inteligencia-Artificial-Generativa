/* === Lumen — App layout (post-auth) + Dashboard + New Session === */

function AppShell({ children, active }) {
  const { go } = useRouter();
  const { user, logout } = useAuth();
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
            <button onClick={() => go('dashboard')} style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <Logo size={20}/>
            </button>
            <nav style={{ display: 'flex', gap: 4 }}>
              {[
                { id: 'dashboard', label: 'Sesiones' },
                { id: 'new', label: 'Nueva' },
              ].map(t => (
                <button key={t.id} onClick={() => go(t.id)} className="btn btn-bare" style={{
                  fontSize: 14,
                  color: active === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: active === t.id ? 'var(--bg-hover)' : 'transparent',
                  borderRadius: 8,
                }}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 4px 4px', borderRadius: 99, border: '1px solid var(--line-soft)' }}>
              <div style={{ width: 26, height: 26, borderRadius: 99, background: 'linear-gradient(135deg, var(--accent), oklch(0.7 0.18 220))', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                {user?.name?.[0] || 'C'}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.name?.split(' ')[0]}</span>
            </div>
            <button onClick={() => { logout(); go('landing'); }} className="btn btn-bare" title="Salir" style={{ padding: 8 }}>
              <Icon name="logout" size={15}/>
            </button>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '40px 32px 80px' }}>
        {children}
      </main>
    </div>
  );
}

// ---------- DASHBOARD ----------
function Dashboard() {
  const { go } = useRouter();
  const { user } = useAuth();
  const sessions = MOCK_SESSIONS;
  const completed = sessions.filter(s => s.status === 'completed');
  const avg = completed.length ? completed.reduce((a, s) => a + s.overall_score, 0) / completed.length : 0;
  const trend = completed[0].overall_score - completed[completed.length - 1].overall_score;

  return (
    <AppShell active="dashboard">
      <div className="fade-up">
        {/* Headline */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
          <div>
            <p className="section-rule" style={{ marginBottom: 16, justifyContent: 'flex-start' }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
              28 ABR · 2026
            </p>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.0, margin: 0 }}>
              Buenos días,{' '}
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>{user?.name?.split(' ')[0]}.</span>
            </h1>
          </div>
          <button onClick={() => go('new')} className="btn btn-accent" style={{ padding: '14px 22px', fontSize: 15 }}>
            <Icon name="plus" size={15}/> Nueva sesión
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)', borderRadius: 16, overflow: 'hidden', marginBottom: 56 }}>
          {[
            { label: 'Sesiones totales', value: sessions.length, suffix: '', kicker: '' },
            { label: 'Puntuación media', value: avg.toFixed(0), suffix: '/100', kicker: trend > 0 ? `+${trend} vs primera` : '' },
            { label: 'Mejor sesión', value: Math.max(...completed.map(s => s.overall_score)), suffix: '/100', kicker: 'Vercel · 12 abr' },
            { label: 'Racha', value: 5, suffix: ' días', kicker: 'Sigue así' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'var(--bg-card)', padding: 28 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="tabular" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em' }}>{stat.value}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>{stat.suffix}</span>
              </div>
              {stat.kicker && <p style={{ fontSize: 12, color: 'var(--good)', margin: '8px 0 0' }}>{stat.kicker}</p>}
            </div>
          ))}
        </div>

        {/* Evolution chart */}
        <EvolutionChart sessions={completed.slice().reverse()} />

        {/* Sessions list */}
        <div style={{ marginTop: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <p className="section-rule" style={{ justifyContent: 'flex-start' }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
              Historial · {sessions.length} sesiones
            </p>
          </div>
          <div style={{ border: '1px solid var(--line-soft)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
            {sessions.map((s, i) => (
              <SessionRow key={s.id} session={s} isFirst={i === 0} go={go}/>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SessionRow({ session, isFirst, go }) {
  const [hover, setHover] = useState(false);
  const score = session.overall_score;
  const scoreColor = score == null ? 'var(--text-faint)'
    : score >= 80 ? 'var(--good)'
    : score >= 60 ? 'oklch(0.72 0.16 230)'
    : score >= 40 ? 'var(--warn)'
    : 'var(--bad)';

  return (
    <button
      onClick={() => go(session.status === 'completed' ? 'results' : 'interview', { sessionId: session.id })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '40px 1fr auto auto auto',
        alignItems: 'center',
        gap: 24,
        padding: '20px 24px',
        background: hover ? 'var(--bg-hover)' : 'transparent',
        border: 'none',
        borderTop: !isFirst ? '1px solid var(--line-soft)' : 'none',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background .15s var(--ease)',
      }}
    >
      <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
        {String(session.id).padStart(2, '0')}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 4 }}>
          {session.job_title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{session.company}</span>
          <span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--text-faint)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{session.created_at}</span>
        </div>
      </div>
      <span className="chip" style={{ fontSize: 11, color: session.status === 'completed' ? 'var(--good)' : 'var(--warn)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }}/>
        {session.status === 'completed' ? 'Completada' : `${session.answered_count}/${session.question_count}`}
      </span>
      <div style={{ minWidth: 80, textAlign: 'right' }}>
        {score != null ? (
          <span className="tabular" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: scoreColor }}>
            {score}<span style={{ color: 'var(--text-faint)', fontSize: 12, fontWeight: 400 }}>/100</span>
          </span>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>En curso</span>
        )}
      </div>
      <Icon name="chevron-right" size={16} className="" />
    </button>
  );
}

function EvolutionChart({ sessions }) {
  const W = 1136, H = 220, PAD = { l: 40, r: 40, t: 40, b: 40 };
  const max = 100, min = 40;
  const xs = sessions.map((_, i) => PAD.l + (i / (sessions.length - 1)) * (W - PAD.l - PAD.r));
  const ys = sessions.map(s => PAD.t + (1 - (s.overall_score - min) / (max - min)) * (H - PAD.t - PAD.b));
  const points = sessions.map((s, i) => `${xs[i]},${ys[i]}`).join(' ');
  const areaPath = `M ${xs[0]} ${H - PAD.b} L ${points.split(' ').join(' L ')} L ${xs[xs.length-1]} ${H - PAD.b} Z`;
  const linePath = `M ${points.replace(/ /g, ' L ')}`;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 14, padding: 24, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 8 }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
            Evolución
          </p>
          <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
            Tu trayectoria, sesión a sesión
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 2, background: 'var(--accent)' }}/> Score
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="evoArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[40, 60, 80, 100].map(v => {
          const y = PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
          return (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="var(--line-soft)" strokeDasharray="2 4"/>
              <text x={PAD.l - 8} y={y + 3} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)" textAnchor="end">{v}</text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#evoArea)"/>
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        {sessions.map((s, i) => (
          <g key={s.id}>
            <circle cx={xs[i]} cy={ys[i]} r="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2"/>
            <text x={xs[i]} y={H - PAD.b + 18} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)" textAnchor="middle">{s.company}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---------- NEW SESSION ----------
function NewSession() {
  const { go } = useRouter();
  const [step, setStep] = useState(1);
  const [job, setJob] = useState({ title: 'Senior Frontend Engineer', company: 'Stripe', desc: '' });
  const [cv, setCv] = useState({ uploaded: false, name: '' });
  const [generating, setGenerating] = useState(false);

  const sampleJD = `We're looking for a Senior Frontend Engineer to join the Checkout team at Stripe. You'll lead initiatives to improve performance and conversion across our most critical surfaces. Strong React + TypeScript experience required. Experience with bundle optimization, performance metrics (CWV), and design systems is a plus. Remote-first.`;

  if (generating) {
    return (
      <AppShell active="new">
        <GeneratingScreen onDone={() => go('interview', { sessionId: 1 })}/>
      </AppShell>
    );
  }

  const canNext = (step === 1 && job.title && job.company && (job.desc || '').length >= 50)
    || (step === 2 && cv.uploaded);

  return (
    <AppShell active="new">
      <div className="fade-up" style={{ maxWidth: 760, margin: '0 auto' }}>
        <p className="section-rule" style={{ marginBottom: 16, justifyContent: 'flex-start' }}>
          <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
          Nueva simulación · {step}/3
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 12px' }}>
          {step === 1 && <>El puesto al que <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>aspiras</span>.</>}
          {step === 2 && <>Cuéntanos quién <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>eres</span>.</>}
          {step === 3 && <>Listos para <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>empezar</span>.</>}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '0 0 40px' }}>
          {step === 1 && 'La precisión de la simulación depende del detalle que nos des aquí.'}
          {step === 2 && 'Lumen leerá tu CV para hacer preguntas que conecten con tu experiencia.'}
          {step === 3 && 'Revisa los datos. La IA generará 8 preguntas a medida.'}
        </p>

        {/* Stepper rail */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              flex: 1, height: 3, borderRadius: 99,
              background: n <= step ? 'var(--accent)' : 'var(--line-soft)',
              transition: 'background .4s var(--ease)',
            }}/>
          ))}
        </div>

        {step === 1 && (
          <div className="surface fade-up" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Título del puesto">
                <input className="input" value={job.title} onChange={e => setJob({...job, title: e.target.value})}/>
              </Field>
              <Field label="Empresa">
                <input className="input" value={job.company} onChange={e => setJob({...job, company: e.target.value})}/>
              </Field>
            </div>
            <Field label="Descripción del puesto" hint="Pega el texto completo de la oferta — cuanto más, mejor.">
              <textarea className="input" rows={8} value={job.desc} onChange={e => setJob({...job, desc: e.target.value})} placeholder="Pega aquí la descripción completa del puesto..."/>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-faint)' }}>
                <button type="button" onClick={() => setJob({...job, desc: sampleJD})} className="btn btn-bare" style={{ padding: 0, fontSize: 12, color: 'var(--accent)' }}>
                  Usar ejemplo de prueba
                </button>
                <span className="tabular">{(job.desc || '').length} caracteres</span>
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="surface fade-up" style={{ padding: 32 }}>
            {!cv.uploaded ? (
              <div
                onClick={() => setCv({ uploaded: true, name: 'CV_Carla_Mendez_2026.pdf', pages: 2 })}
                style={{
                  border: '1.5px dashed var(--line)',
                  borderRadius: 12,
                  padding: 56,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .2s var(--ease)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-line)'; e.currentTarget.style.background = 'var(--accent-soft)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: 56, height: 56, margin: '0 auto 20px', borderRadius: 14, background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <Icon name="upload" size={22}/>
                </div>
                <p style={{ margin: '0 0 6px', fontWeight: 500, fontSize: 16 }}>Arrastra tu CV o haz clic para seleccionar</p>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PDF · máx 10 MB</p>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: 20,
                border: '1px solid var(--accent-line)',
                background: 'var(--accent-soft)',
                borderRadius: 12,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <Icon name="file" size={20}/>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>{cv.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>2 páginas extraídas · Listo para analizar</p>
                </div>
                <button onClick={() => setCv({ uploaded: false, name: '' })} className="btn btn-bare" style={{ padding: 6 }}>
                  <Icon name="x" size={15}/>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="surface fade-up" style={{ padding: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px 24px', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 4 }}>Puesto</span>
              <span style={{ fontWeight: 500 }}>{job.title}</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 4 }}>Empresa</span>
              <span style={{ fontWeight: 500 }}>{job.company}</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 4 }}>JD</span>
              <span style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>{(job.desc || '').slice(0, 240) || '—'}{(job.desc || '').length > 240 ? '…' : ''}</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 4 }}>CV</span>
              <span style={{ fontWeight: 500 }}>{cv.name || '—'}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button onClick={() => step > 1 ? setStep(step - 1) : go('dashboard')} className="btn btn-ghost">
            <Icon name="chevron-left" size={14}/> Atrás
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext} className="btn btn-accent">
              Siguiente <Icon name="arrow-right" size={14}/>
            </button>
          ) : (
            <button onClick={() => setGenerating(true)} className="btn btn-accent">
              <Icon name="sparkles" size={14}/> Generar 8 preguntas
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      {children}
      {hint && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  );
}

function GeneratingScreen({ onDone }) {
  const phases = [
    'Leyendo tu CV',
    'Analizando la oferta',
    'Identificando gaps',
    'Generando preguntas',
    'Calibrando dificultad',
  ];
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (phase >= phases.length) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase(p => p + 1), 700);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div className="aurora" style={{ opacity: 0.5 }}/>
      <div style={{ position: 'relative', maxWidth: 480 }}>
        <div style={{ width: 96, height: 96, margin: '0 auto 32px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 0deg, var(--accent), oklch(0.7 0.18 220), var(--accent))', animation: 'orbit 3s linear infinite', filter: 'blur(2px)' }}/>
          <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkles" size={32} className=""/>
          </div>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 16px' }}>
          Construyendo tu simulación
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px', fontSize: 15 }}>
          GPT-4o está estudiando tu perfil. Esto suele tardar 10-15 segundos.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
          {phases.map((p, i) => (
            <li key={p} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              fontSize: 14,
              color: i < phase ? 'var(--text-primary)' : i === phase ? 'var(--accent)' : 'var(--text-faint)',
              transition: 'color .3s var(--ease)',
              fontFamily: 'var(--font-mono)',
            }}>
              <span style={{ width: 16, display: 'inline-flex', justifyContent: 'center' }}>
                {i < phase ? <Icon name="check" size={14}/> : i === phase ? <span style={{ width: 8, height: 8, borderRadius: 99, background: 'currentColor', animation: 'pulse-soft 1s ease infinite' }}/> : <span style={{ width: 4, height: 4, borderRadius: 99, background: 'currentColor' }}/>}
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

Object.assign(window, { AppShell, Dashboard, NewSession });
