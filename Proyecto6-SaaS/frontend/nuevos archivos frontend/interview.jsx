/* === Lumen — Interview & Results === */

function Interview() {
  const { go, params } = useRouter();
  const sessionId = params.sessionId || 1;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // qid -> answer obj
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  const questions = MOCK_QUESTIONS;
  const q = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const currentAnswer = answers[q.id];

  // Timer
  useEffect(() => {
    if (paused || showFeedback) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [paused, showFeedback]);

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleSubmit = () => {
    if (!draft.trim() || streaming) return;
    setStreaming(true);
    setStreamText('');
    const fb = DEMO_FEEDBACK;
    const fullText = fb.feedback_text;
    let i = 0;
    const tick = () => {
      i += Math.max(2, Math.round(Math.random() * 6));
      if (i >= fullText.length) {
        setStreamText(fullText);
        setStreaming(false);
        setShowFeedback(true);
        setAnswers(prev => ({ ...prev, [q.id]: { ...fb, answer_text: draft } }));
      } else {
        setStreamText(fullText.slice(0, i));
        setTimeout(tick, 22);
      }
    };
    setTimeout(tick, 400);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setDraft('');
      setShowFeedback(false);
      setStreamText('');
    } else {
      go('results', { sessionId });
    }
  };

  const goToQ = (i) => {
    setCurrentIdx(i);
    setDraft(answers[questions[i].id]?.answer_text || '');
    setShowFeedback(!!answers[questions[i].id]);
    setStreamText(answers[questions[i].id] ? DEMO_FEEDBACK.feedback_text : '');
  };

  return (
    <AppShell active="">
      <div style={{ position: 'fixed', inset: '60px 0 0 0', display: 'grid', gridTemplateColumns: '260px 1fr 360px', pointerEvents: 'none', zIndex: 1 }}>
        <div className="aurora" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}/>
      </div>

      <div className="fade-up" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, marginTop: -16 }}>
        {/* Side rail — questions */}
        <aside style={{ position: 'sticky', top: 88, alignSelf: 'flex-start' }}>
          <button onClick={() => go('dashboard')} className="btn btn-bare" style={{ padding: '4px 0', fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
            <Icon name="chevron-left" size={13}/> Salir
          </button>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 16, fontSize: 10 }}>
            <span style={{ flex: 'none', height: 1, width: 20, background: 'var(--line)' }}/>
            Stripe · Senior FE
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions.map((qq, i) => {
              const a = answers[qq.id];
              const isCurrent = i === currentIdx;
              return (
                <li key={qq.id}>
                  <button onClick={() => goToQ(i)} style={{
                    width: '100%', textAlign: 'left',
                    padding: '8px 12px', borderRadius: 8,
                    border: '1px solid transparent',
                    background: isCurrent ? 'var(--bg-card)' : 'transparent',
                    borderColor: isCurrent ? 'var(--line-soft)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    transition: 'all .15s var(--ease)',
                  }}>
                    <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', width: 22 }}>
                      {String(i+1).padStart(2,'0')}
                    </span>
                    <span style={{
                      flex: 1, fontSize: 12,
                      color: a ? 'var(--text-primary)' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {TYPE_LABELS[qq.question_type]}
                    </span>
                    <span style={{
                      width: 6, height: 6, borderRadius: 99,
                      background: a ? 'var(--good)' : isCurrent ? 'var(--accent)' : 'var(--line-strong)',
                    }}/>
                  </button>
                </li>
              );
            })}
          </ul>
          <div style={{ marginTop: 24, padding: 16, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--line-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tiempo</span>
              <button onClick={() => setPaused(p => !p)} className="btn btn-bare" style={{ padding: 2 }}>
                <Icon name={paused ? 'play' : 'pause'} size={11}/>
              </button>
            </div>
            <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)' }}>
              {fmtTime(elapsed)}
            </div>
            <div style={{ height: 2, background: 'var(--line-soft)', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width .5s var(--ease)' }}/>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>
              {answeredCount} de {questions.length} respondidas
            </p>
          </div>
        </aside>

        {/* Main */}
        <div style={{ maxWidth: 760, position: 'relative' }}>
          {/* Question header */}
          <div className="fade-up" key={`hdr-${currentIdx}`} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span className="tabular" style={{
                fontFamily: 'var(--font-serif)', fontSize: 56, fontStyle: 'italic',
                color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em',
              }}>
                {String(currentIdx + 1).padStart(2, '0')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="chip chip-accent" style={{ width: 'fit-content' }}>
                  {TYPE_LABELS[q.question_type]}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  {currentIdx + 1} / {questions.length}
                </span>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 2.6vw, 30px)', lineHeight: 1.3, fontWeight: 400, letterSpacing: '-0.015em', margin: '0 0 16px' }}>
              {q.question_text}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              ↳ {q.focus}
            </p>
          </div>

          {/* Answer area */}
          {!showFeedback && !streaming && (
            <div className="surface fade-up" style={{ padding: 0, overflow: 'hidden' }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe tu respuesta. STAR funciona bien para preguntas de comportamiento…"
                style={{
                  width: '100%',
                  minHeight: 220,
                  padding: 24,
                  fontSize: 15,
                  lineHeight: 1.6,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-inset)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span className="tabular">{draft.split(/\s+/).filter(Boolean).length} palabras</span>
                  <span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--text-faint)' }}/>
                  <span>⌘ + ⏎ enviar</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" disabled>
                    <Icon name="mic" size={14}/> Voz
                  </button>
                  <button onClick={handleSubmit} disabled={!draft.trim()} className="btn btn-accent">
                    <Icon name="send" size={14}/> Evaluar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Streaming feedback */}
          {streaming && (
            <div className="surface fade-up" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite' }}/>
              <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 20, fontSize: 10, color: 'var(--accent)' }}>
                <span style={{ flex: 'none', height: 1, width: 20, background: 'var(--accent-line)' }}/>
                Lumen está evaluando…
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>
                {streamText}<span style={{ display: 'inline-block', width: 8, height: 16, background: 'var(--accent)', verticalAlign: 'middle', marginLeft: 2, animation: 'pulse-soft 1s ease infinite' }}/>
              </p>
            </div>
          )}

          {/* Full feedback */}
          {showFeedback && currentAnswer && (
            <FeedbackPanel
              answer={currentAnswer}
              onNext={handleNext}
              isLast={currentIdx === questions.length - 1}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function FeedbackPanel({ answer, onNext, isLast }) {
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Score hero */}
      <div className="surface" style={{ padding: 28, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'center' }}>
        <ScoreCircle score={answer.final_score}/>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'oklch(0.72 0.16 230)', fontWeight: 500, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Buena respuesta
            </span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
            {answer.feedback_text}
          </p>
          <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
            <span>LLM <span className="tabular" style={{ color: 'var(--text-secondary)' }}>{answer.llm_score}</span>/100</span>
            <span>SEMÁNTICA <span className="tabular" style={{ color: 'var(--text-secondary)' }}>{answer.embedding_score}</span>/100</span>
          </div>
        </div>
      </div>

      {/* Strengths + improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FeedbackList kicker="Lo que has hecho bien" items={answer.strengths} sign="+" color="var(--good)"/>
        <FeedbackList kicker="Cómo mejorar" items={answer.improvements} sign="→" color="var(--warn)"/>
      </div>

      {/* Ideal answer */}
      {answer.ideal_answer_hint && (
        <div className="surface" style={{ padding: 24, background: 'var(--accent-soft)', borderColor: 'var(--accent-line)' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <Icon name="lightbulb" size={18} className=""/>
            <div>
              <p style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Respuesta ideal
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                {answer.ideal_answer_hint}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onNext} className="btn btn-accent" style={{ padding: '14px 22px', fontSize: 15 }}>
          {isLast ? <>Ver informe completo <Icon name="arrow-right" size={14}/></> : <>Siguiente pregunta <Icon name="arrow-right" size={14}/></>}
        </button>
      </div>
    </div>
  );
}

function FeedbackList({ kicker, items, sign, color }) {
  return (
    <div className="surface" style={{ padding: 22 }}>
      <p style={{ fontSize: 11, color, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>
        {kicker}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((s, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ color, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{sign}</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreCircle({ score, size = 96 }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? 'var(--good)' : score >= 60 ? 'oklch(0.72 0.16 230)' : score >= 40 ? 'var(--warn)' : 'var(--bad)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth="3"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`} style={{ transition: 'stroke-dasharray .8s var(--ease)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="tabular" style={{ fontSize: size * 0.32, fontWeight: 500, letterSpacing: '-0.03em', color, lineHeight: 1 }}>
          {Math.round(score)}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>/ 100</span>
      </div>
    </div>
  );
}

// ---------- RESULTS ----------
function Results() {
  const { go } = useRouter();
  const score = 84;
  const session = { job_title: 'Senior Frontend Engineer', company: 'Stripe', date: '28 abr 2026' };

  const byType = [
    { type: 'technical', label: 'Técnica', score: 86, count: 3 },
    { type: 'behavioral', label: 'Comportamiento', score: 82, count: 2 },
    { type: 'situational', label: 'Situacional', score: 88, count: 2 },
    { type: 'motivation', label: 'Motivación', score: 78, count: 1 },
  ];

  return (
    <AppShell active="">
      <div className="fade-up" style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
        <button onClick={() => go('dashboard')} className="btn btn-bare" style={{ padding: '4px 0', fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>
          <Icon name="chevron-left" size={14}/> Volver al dashboard
        </button>

        {/* Editorial masthead */}
        <header style={{ marginBottom: 56, paddingBottom: 32, borderBottom: '1px solid var(--line)' }}>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
            INFORME DE ENTREVISTA · LUMEN
            <span style={{ flex: 'none', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>{session.date}</span>
          </p>
          <h1 style={{
            fontSize: 'clamp(40px, 5vw, 64px)',
            fontWeight: 500, letterSpacing: '-0.035em',
            lineHeight: 1.0,
            margin: '0 0 12px',
          }}>
            {session.job_title}
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 24, color: 'var(--text-muted)', margin: 0, fontWeight: 400 }}>
            en {session.company}
          </p>
        </header>

        {/* Big score */}
        <section style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 56, alignItems: 'center', marginBottom: 64 }}>
          <div>
            <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 12 }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
              Puntuación global
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="tabular" style={{
                fontSize: 'clamp(120px, 18vw, 200px)',
                fontWeight: 500, letterSpacing: '-0.06em',
                lineHeight: 0.85,
                color: 'var(--accent)',
                background: 'linear-gradient(180deg, var(--accent), oklch(0.55 0.22 280))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {score}
              </span>
              <span className="tabular" style={{ fontSize: 32, color: 'var(--text-faint)', fontWeight: 400 }}>
                /100
              </span>
            </div>
          </div>
          <div style={{ alignSelf: 'flex-start', paddingTop: 32 }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 28, lineHeight: 1.3, color: 'var(--text-primary)', margin: '0 0 24px', fontWeight: 400 }}>
              "Una entrevista <em style={{ color: 'var(--accent)' }}>fuerte</em>. Demuestras solidez técnica y buena estructura narrativa. Lo que te falta para un 90+ es densidad de ejemplos concretos."
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
              — Análisis de Lumen
            </p>
          </div>
        </section>

        {/* By type */}
        <section style={{ marginBottom: 64 }}>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
            Por categoría
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)', borderRadius: 12, overflow: 'hidden' }}>
            {byType.map(t => (
              <div key={t.type} style={{ background: 'var(--bg-card)', padding: 22 }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>{t.label}</p>
                <div className="tabular" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', color: t.score >= 80 ? 'var(--good)' : 'oklch(0.72 0.16 230)' }}>
                  {t.score}
                </div>
                <div style={{ height: 2, background: 'var(--line-soft)', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${t.score}%`, background: t.score >= 80 ? 'var(--good)' : 'oklch(0.72 0.16 230)' }}/>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: '8px 0 0' }}>{t.count} {t.count === 1 ? 'pregunta' : 'preguntas'}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Question breakdown */}
        <section style={{ marginBottom: 64 }}>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
            Pregunta por pregunta
          </p>
          <div style={{ border: '1px solid var(--line-soft)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
            {MOCK_QUESTIONS.map((q, i) => (
              <ResultQuestionRow key={q.id} q={q} index={i} isFirst={i === 0}/>
            ))}
          </div>
        </section>

        {/* Improvement plan */}
        <section style={{ marginBottom: 48 }}>
          <p className="section-rule" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
            <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }}/>
            Plan de mejora · 30 días
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {IMPROVEMENT_PLAN.map((w, i) => (
              <div key={w.week} className="surface" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{w.week}</span>
                  <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>0{i+1}/04</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.015em', margin: '0 0 14px' }}>{w.focus}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {w.actions.map((a, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>—</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingTop: 24, borderTop: '1px solid var(--line-soft)' }}>
          <button onClick={() => go('new')} className="btn btn-accent" style={{ padding: '14px 22px' }}>
            <Icon name="plus" size={14}/> Nueva sesión
          </button>
          <button className="btn btn-ghost" style={{ padding: '14px 22px' }}>
            <Icon name="arrow-up-right" size={14}/> Exportar PDF
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function ResultQuestionRow({ q, index, isFirst }) {
  const [open, setOpen] = useState(index === 0);
  // Fake per-question data
  const scores = [84, 76, 90, 78, 88, 82, 85, 78];
  const score = scores[index];
  const color = score >= 80 ? 'var(--good)' : score >= 60 ? 'oklch(0.72 0.16 230)' : 'var(--warn)';

  return (
    <div style={{ borderTop: !isFirst ? '1px solid var(--line-soft)' : 'none' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left',
        display: 'grid', gridTemplateColumns: '32px 80px 1fr auto auto', gap: 16, alignItems: 'center',
        padding: '18px 22px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--text-primary)',
      }}>
        <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
          {String(index+1).padStart(2,'0')}
        </span>
        <span className="chip" style={{ fontSize: 11, justifySelf: 'flex-start' }}>{TYPE_LABELS[q.question_type]}</span>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {q.question_text}
        </span>
        <span className="tabular" style={{ fontSize: 18, fontWeight: 500, color, letterSpacing: '-0.015em' }}>
          {score}<span style={{ color: 'var(--text-faint)', fontSize: 11, fontWeight: 400 }}>/100</span>
        </span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15}/>
      </button>
      {open && (
        <div className="fade-up" style={{ padding: '4px 22px 24px 22px' }}>
          <div style={{ paddingLeft: 48 }}>
            <p style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '8px 0 8px' }}>
              Tu respuesta
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 20px', padding: 16, background: 'var(--bg-inset)', borderRadius: 8 }}>
              Empezaría por medir antes de optimizar. Usaría webpack-bundle-analyzer para ver dónde está el peso, identificaría libs grandes que puedan reemplazarse por alternativas más ligeras, y aplicaría code splitting agresivo en las rutas de checkout. También revisaría el tree-shaking…
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--good)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>Fortalezas</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {DEMO_FEEDBACK.strengths.slice(0, 2).map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, padding: '3px 0' }}>
                      <span style={{ color: 'var(--good)' }}>+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--warn)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>Mejoras</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {DEMO_FEEDBACK.improvements.slice(0, 2).map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, padding: '3px 0' }}>
                      <span style={{ color: 'var(--warn)' }}>→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Interview, Results });
