/* === Lumen — shared components & mock data === */

const { useState, useEffect, useRef, useMemo, useLayoutEffect, createContext, useContext } = React;

// ---------- Theme ----------
const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} });

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('lumen-theme') || 'dark'; } catch { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('lumen-theme', theme); } catch {}
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

// ---------- Router ----------
const RouterContext = createContext({ route: 'landing', go: () => {}, params: {} });

function RouterProvider({ children }) {
  const [route, setRoute] = useState('landing');
  const [params, setParams] = useState({});
  const go = (r, p = {}) => {
    setRoute(r);
    setParams(p);
    window.scrollTo({ top: 0 });
  };
  return <RouterContext.Provider value={{ route, go, params }}>{children}</RouterContext.Provider>;
}

const useRouter = () => useContext(RouterContext);

// ---------- Icons (inline SVG, hairline, no lucide dep) ----------
const Icon = ({ name, size = 16, className = '', strokeWidth = 1.6 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', className };
  switch(name) {
    case 'arrow-right': return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-up-right': return <svg {...props}><path d="M7 17 17 7M9 7h8v8"/></svg>;
    case 'check': return <svg {...props}><path d="M4 12l5 5L20 6"/></svg>;
    case 'plus': return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'sun': return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
    case 'moon': return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
    case 'sparkles': return <svg {...props}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM5 16l.7 1.5L7 18l-1.3.5L5 20l-.7-1.5L3 18l1.3-.5L5 16z"/></svg>;
    case 'mic': return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>;
    case 'send': return <svg {...props}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    case 'chevron-right': return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-down': return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'chevron-up': return <svg {...props}><path d="M6 15l6-6 6 6"/></svg>;
    case 'chevron-left': return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'logout': return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'upload': return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;
    case 'file': return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg>;
    case 'briefcase': return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    case 'x': return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case 'menu-grid': return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case 'trending': return <svg {...props}><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></svg>;
    case 'target': return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>;
    case 'zap': return <svg {...props}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>;
    case 'book': return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
    case 'refresh': return <svg {...props}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>;
    case 'pause': return <svg {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
    case 'play': return <svg {...props}><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>;
    case 'circle': return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>;
    case 'minus': return <svg {...props}><path d="M5 12h14"/></svg>;
    case 'lightbulb': return <svg {...props}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2v.3h6V17a3 3 0 0 1 1-2.3A7 7 0 0 0 12 2z"/></svg>;
    default: return null;
  }
};

// ---------- Logo ----------
function Logo({ size = 22, withText = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span className="logo-mark" style={{ width: size, height: size }}/>
      {withText && (
        <span style={{
          fontWeight: 600, letterSpacing: '-0.02em', fontSize: size > 24 ? 22 : 16,
          color: 'var(--text-primary)'
        }}>Lumen</span>
      )}
    </div>
  );
}

// ---------- Theme toggle ----------
function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="toggle theme"
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: '1px solid var(--line-soft)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .2s var(--ease)',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--line-strong)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--line-soft)'; }}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14}/>
    </button>
  );
}

// ---------- Mock auth ----------
const AuthContext = createContext({ user: null, login: () => {}, logout: () => {} });
function AuthProvider({ children }) {
  const [user, setUser] = useState({ name: 'Carla Mendez', email: 'carla@example.com' });
  const login = (u) => setUser(u);
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
const useAuth = () => useContext(AuthContext);

// ---------- Mock data ----------
const TYPE_LABELS = {
  technical: 'Técnica',
  behavioral: 'Comportamiento',
  situational: 'Situacional',
  motivation: 'Motivación',
};

const MOCK_SESSIONS = [
  { id: 1, job_title: 'Senior Frontend Engineer', company: 'Stripe', status: 'completed', overall_score: 87, created_at: '2026-04-22', question_count: 8, answered_count: 8 },
  { id: 2, job_title: 'Product Designer', company: 'Linear', status: 'completed', overall_score: 74, created_at: '2026-04-18', question_count: 8, answered_count: 8 },
  { id: 3, job_title: 'Staff Engineer, Platform', company: 'Vercel', status: 'completed', overall_score: 91, created_at: '2026-04-12', question_count: 8, answered_count: 8 },
  { id: 4, job_title: 'ML Engineer', company: 'Anthropic', status: 'completed', overall_score: 68, created_at: '2026-04-05', question_count: 8, answered_count: 8 },
  { id: 5, job_title: 'Engineering Manager', company: 'Notion', status: 'completed', overall_score: 79, created_at: '2026-03-28', question_count: 8, answered_count: 8 },
  { id: 6, job_title: 'iOS Developer', company: 'Arc', status: 'active', overall_score: null, created_at: '2026-04-26', question_count: 8, answered_count: 3 },
];

const MOCK_QUESTIONS = [
  { id: 1, question_type: 'technical', question_text: 'Tu CV menciona experiencia con React Server Components. Explica cuándo elegirías un Server Component sobre uno Client, y qué trade-offs conlleva esa decisión en una app de e-commerce a escala.', focus: 'Arquitectura RSC, hidratación, decisiones de fetch en servidor vs cliente.' },
  { id: 2, question_type: 'behavioral', question_text: 'Cuéntame una situación en la que tuviste que defender una decisión técnica impopular ante un equipo de producto. Usa la estructura STAR.', focus: 'Liderazgo técnico, comunicación cross-functional, manejo de conflicto.' },
  { id: 3, question_type: 'situational', question_text: 'Llegas a Stripe y descubres que el bundle del checkout pesa 2.4MB. Tu manager te pide reducirlo a la mitad en una semana. ¿Por dónde empezarías y qué métricas seguirías?', focus: 'Performance, priorización, métricas de impacto en negocio.' },
  { id: 4, question_type: 'motivation', question_text: '¿Por qué Stripe específicamente, y no otra fintech? ¿Qué te atrae del problema que resuelven?', focus: 'Conexión con la misión, conocimiento real del producto.' },
  { id: 5, question_type: 'technical', question_text: 'Diseña la arquitectura de un sistema de validación de tarjetas en tiempo real con feedback instantáneo, considerando latencia, seguridad PCI y UX.', focus: 'System design frontend, seguridad, percepción de velocidad.' },
  { id: 6, question_type: 'behavioral', question_text: '¿Cuál ha sido el bug más difícil que has resuelto? Describe el proceso de debugging, no solo la solución.', focus: 'Pensamiento analítico, perseverancia, metodología.' },
  { id: 7, question_type: 'situational', question_text: 'Tu equipo está dividido entre adoptar Tailwind o seguir con CSS Modules. Como tech lead, ¿cómo facilitas esta decisión?', focus: 'Facilitación, RFCs, decisiones reversibles vs irreversibles.' },
  { id: 8, question_type: 'motivation', question_text: '¿Dónde te ves en 3 años y cómo encaja Stripe en ese camino?', focus: 'Visión de carrera, alineamiento.' },
];

// Pre-baked feedback for q1 to demo the streaming UI
const DEMO_FEEDBACK = {
  final_score: 84,
  llm_score: 86,
  embedding_score: 81,
  verdict: 'good',
  feedback_text: 'Respuesta sólida y bien estructurada. Demuestras comprensión de las diferencias clave entre RSC y Client Components, y los trade-offs que mencionas (hidratación, bundle size, acceso a APIs de servidor) son precisos. Para un Senior, sin embargo, esperaría un ejemplo más concreto de cómo aplicarías esto en un caso de e-commerce real — algo como el árbol de componentes del checkout o las páginas de producto.',
  strengths: [
    'Distinción técnica clara entre los dos paradigmas',
    'Mención explícita del coste de hidratación',
    'Buen uso del lenguaje técnico sin sobre-explicar',
  ],
  improvements: [
    'Falta un ejemplo específico de e-commerce (carrito vs PDP)',
    'No abordas SEO, que es crítico en este tipo de app',
    'Podrías mencionar streaming SSR como puente entre ambos',
  ],
  ideal_answer_hint: 'Una respuesta excelente abriría con el principio (RSC para árboles que no necesitan interactividad ni estado de cliente), seguiría con un mapa concreto del checkout (página estática vs componente de pago), y cerraría con el coste real: latencia de red en el servidor, complejidad de cache, y el riesgo de "RSC waterfall" si no se gestiona bien Suspense.'
};

const IMPROVEMENT_PLAN = [
  { week: 'Semana 1', focus: 'Concreción técnica', actions: ['Practica respuestas con ejemplos del producto real de la empresa objetivo', 'Mapea 3 features de Stripe que conozcas y prepara explicaciones técnicas de 60s'] },
  { week: 'Semana 2', focus: 'Estructura STAR', actions: ['Documenta 5 historias profesionales con el formato STAR completo', 'Graba video de tus respuestas y mide tiempo (objetivo: 90-120s)'] },
  { week: 'Semana 3', focus: 'System design', actions: ['Diseña 3 sistemas frontend complejos (checkout, dashboard, editor)', 'Estudia los blogs de ingeniería de Stripe y Linear'] },
  { week: 'Semana 4', focus: 'Mock interviews', actions: ['2 mock interviews con peers de la industria', 'Repite las 3 preguntas con menor puntuación de tus sesiones de Lumen'] },
];

Object.assign(window, { ThemeProvider, ThemeContext, RouterProvider, RouterContext, useRouter, AuthProvider, AuthContext, useAuth, Icon, Logo, ThemeToggle, TYPE_LABELS, MOCK_SESSIONS, MOCK_QUESTIONS, DEMO_FEEDBACK, IMPROVEMENT_PLAN });
