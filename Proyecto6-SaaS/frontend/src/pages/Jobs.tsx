import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getJobMatches, updateJobMatchStatus, prepareInterviewFromJob, refreshJobMatches, getProfile } from '../services/api'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import type { JobMatch } from '../types'

const SOURCE_COLORS: Record<string, string> = {
  linkedin: 'oklch(0.55 0.18 250)',
  indeed: 'oklch(0.6 0.18 30)',
  glassdoor: 'oklch(0.55 0.18 150)',
  google: 'oklch(0.55 0.18 200)',
}

function formatDescription(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, i) => (
        <p key={i} style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>
          {line}
        </p>
      ))}
    </div>
  )
}

function JobCard({
  match,
  onStatusChange,
  onPrepare,
  preparing,
}: {
  match: JobMatch
  onStatusChange: (id: number, status: string) => void
  onPrepare: (id: number) => void
  preparing: number | null
}) {
  const { t } = useTranslation()
  const job = match.job_offer
  const [expanded, setExpanded] = useState(false)
  const sourceColor = SOURCE_COLORS[job.source?.toLowerCase()] || 'var(--text-faint)'
  const isDismissed = match.status === 'dismissed'

  const MODALITY_LABELS: Record<string, string> = {
    remote: t('jobs.modality.remote'),
    hybrid: t('jobs.modality.hybrid'),
    onsite: t('jobs.modality.onsite'),
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${match.status === 'new' ? 'oklch(from var(--accent) l c h / 0.3)' : 'var(--line-soft)'}`,
      borderRadius: 12,
      opacity: isDismissed ? 0.45 : 1,
      transition: 'opacity .2s',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              {match.status === 'new' && (
                <span style={{ padding: '2px 8px', background: 'oklch(from var(--accent) l c h / 0.15)', color: 'var(--accent)', borderRadius: 99, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>
                  {t('jobs.card.statusNew')}
                </span>
              )}
              {match.status === 'saved' && (
                <span style={{ padding: '2px 8px', background: 'oklch(0.55 0.18 150 / 0.15)', color: 'oklch(0.75 0.18 150)', borderRadius: 99, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>
                  {t('jobs.card.statusSaved')}
                </span>
              )}
              {match.status === 'applied' && (
                <span style={{ padding: '2px 8px', background: 'oklch(0.55 0.18 250 / 0.15)', color: 'oklch(0.75 0.18 250)', borderRadius: 99, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>
                  {t('jobs.card.statusApplied')}
                </span>
              )}
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{job.title}</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{job.company}</span>
              {job.location && (
                <>
                  <span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--text-faint)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{job.location}</span>
                </>
              )}
              {job.modality && (
                <>
                  <span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--text-faint)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, padding: '2px 8px', border: '1px solid var(--line-soft)', borderRadius: 99, color: 'var(--text-muted)' }}>
                    {MODALITY_LABELS[job.modality] || job.modality}
                  </span>
                </>
              )}
              {job.salary_range && (
                <>
                  <span style={{ width: 2, height: 2, borderRadius: 99, background: 'var(--text-faint)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--good)' }}>{job.salary_range}</span>
                </>
              )}
              <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sourceColor, fontWeight: 600, textTransform: 'capitalize' }}>
                {job.source}
              </span>
            </div>
          </div>
        </div>

        {job.description && (
          <div style={{ marginTop: 14 }}>
            {expanded
              ? formatDescription(job.description)
              : <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {job.description.slice(0, 220).trimEnd()}{job.description.length > 220 ? '…' : ''}
                </p>
            }
            {job.description.length > 220 && (
              <button
                onClick={() => setExpanded(x => !x)}
                className="btn btn-bare"
                style={{ fontSize: 12, color: 'var(--accent)', padding: '4px 0', marginTop: 6 }}
              >
                {expanded ? t('jobs.card.seeLess') : t('jobs.card.seeMore')}
              </button>
            )}
          </div>
        )}

        {!isDismissed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <button
              onClick={() => onPrepare(match.id)}
              disabled={preparing === match.id}
              className="btn btn-accent"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {preparing === match.id ? t('jobs.card.preparing') : t('jobs.card.prepare')}
            </button>

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-bare"
              style={{ padding: '8px 14px', fontSize: 13, border: '1px solid var(--line-soft)', borderRadius: 8, textDecoration: 'none', color: 'inherit' }}
            >
              <Icon name="external-link" size={13} /> {t('jobs.card.viewOffer')}
            </a>

            {match.status !== 'saved' && match.status !== 'applied' && (
              <button
                onClick={() => onStatusChange(match.id, 'saved')}
                className="btn btn-bare"
                style={{ padding: '8px 14px', fontSize: 13, border: '1px solid var(--line-soft)', borderRadius: 8 }}
              >
                <Icon name="bookmark" size={13} /> {t('jobs.card.save')}
              </button>
            )}

            <button
              onClick={() => onStatusChange(match.id, 'dismissed')}
              className="btn btn-bare"
              style={{ padding: '8px 14px', fontSize: 13, color: 'var(--text-faint)', marginLeft: 'auto' }}
            >
              <Icon name="x" size={13} /> {t('jobs.card.dismiss')}
            </button>
          </div>
        )}

        {isDismissed && (
          <div style={{ marginTop: 14 }}>
            <button
              onClick={() => onStatusChange(match.id, 'new')}
              className="btn btn-bare"
              style={{ fontSize: 13, color: 'var(--text-faint)', padding: '4px 0' }}
            >
              {t('jobs.card.restore')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const PAGE_SIZE_INITIAL = 10
const PAGE_SIZE_MORE = 15

function matchesRole(jobTitle: string, role: string): boolean {
  const title = jobTitle.toLowerCase()
  const words = role.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  return words.some(w => title.includes(w))
}

export default function Jobs() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [activeRole, setActiveRole] = useState('')
  const [targetRoles, setTargetRoles] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState('')
  const [preparing, setPreparing] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE_INITIAL)
  const [hasLoadedMore, setHasLoadedMore] = useState(false)

  const TABS = [
    { value: '', label: t('jobs.tabs.all') },
    { value: 'new', label: t('jobs.tabs.new') },
    { value: 'saved', label: t('jobs.tabs.saved') },
    { value: 'applied', label: t('jobs.tabs.applied') },
    { value: 'dismissed', label: t('jobs.tabs.dismissed') },
  ]

  useEffect(() => {
    getProfile()
      .then(res => setTargetRoles(res.data.target_roles || []))
      .catch(() => {})
  }, [])

  const load = (status?: string) => {
    setLoading(true)
    getJobMatches(status ? { status } : undefined)
      .then(res => setMatches(res.data))
      .catch(() => setError(t('jobs.errors.loadError')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(activeTab || undefined)
    setVisibleCount(PAGE_SIZE_INITIAL)
    setHasLoadedMore(false)
  }, [activeTab])

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMsg('')
    setError('')
    try {
      const prevCount = matches.length
      await refreshJobMatches()
      setRefreshMsg(t('jobs.searchingLinkedIn'))

      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        try {
          const res = await getJobMatches(activeTab ? { status: activeTab } : undefined)
          const newCount = res.data.length
          if (newCount > prevCount || attempts >= 20) {
            clearInterval(poll)
            setMatches(res.data)
            setRefreshMsg(newCount > prevCount ? t('jobs.newOffers', { count: newCount - prevCount }) : t('jobs.searchComplete'))
            setTimeout(() => setRefreshMsg(''), 3000)
            setRefreshing(false)
          } else {
            setRefreshMsg(`${t('jobs.searchingLinkedIn')} (${attempts * 3}s)`)
          }
        } catch {
          clearInterval(poll)
          setRefreshing(false)
        }
      }, 3000)
    } catch (e: any) {
      const code = e?.response?.data?.detail
      setError(t(`errors.${code}`, { defaultValue: t('jobs.errors.sessionError') }))
      setRefreshing(false)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await updateJobMatchStatus(id, status)
      setMatches(prev => prev.map(m => m.id === id ? { ...m, status: res.data.status } : m))
    } catch {
      setError(t('jobs.errors.updateError'))
    }
  }

  const handlePrepare = async (matchId: number) => {
    setPreparing(matchId)
    setError('')
    try {
      const res = await prepareInterviewFromJob(matchId)
      navigate(`/interview/${res.data.id}`)
    } catch (e: any) {
      const code = e?.response?.data?.detail
      setError(t(`errors.${code}`, { defaultValue: t('jobs.errors.sessionError') }))
      setPreparing(null)
    }
  }

  const filteredMatches = activeRole
    ? matches.filter(m => matchesRole(m.job_offer.title, activeRole))
    : matches

  const newCount = matches.filter(m => m.status === 'new').length
  const visibleMatches = filteredMatches.slice(0, visibleCount)
  const hasMore = filteredMatches.length > visibleCount

  return (
    <Layout>
      <div className="fade-up">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
          <div>
            <p className="section-rule" style={{ marginBottom: 16, justifyContent: 'flex-start' }}>
              <span style={{ flex: 'none', height: 1, width: 24, background: 'var(--line)' }} />
              {t('jobs.sectionRule')}
            </p>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.0, margin: 0 }}>
              {t('jobs.title')}{' '}
              <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>
                {t('jobs.titleItalic')}
              </span>
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-accent"
              style={{ padding: '12px 20px', fontSize: 14 }}
            >
              {refreshing ? t('jobs.searching') : t('jobs.searchBtn')}
            </button>
            {refreshMsg && <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{refreshMsg}</span>}
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 18px', background: 'oklch(0.25 0.06 20 / 0.4)', border: '1px solid oklch(0.5 0.12 20 / 0.4)', borderRadius: 10, fontSize: 14, color: 'oklch(0.8 0.1 20)', marginBottom: 24 }}>
            <span>{error}</span>
            {error.toLowerCase().includes('perfil') || error.toLowerCase().includes('profile') && (
              <Link to="/profile" style={{ whiteSpace: 'nowrap', color: 'oklch(0.8 0.1 20)', fontWeight: 500, textDecoration: 'underline' }}>
                {t('jobs.errors.goToProfile')}
              </Link>
            )}
          </div>
        )}

        {/* Role filter chips */}
        {targetRoles.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              onClick={() => { setActiveRole(''); setVisibleCount(PAGE_SIZE_INITIAL) }}
              className="btn btn-bare"
              style={{
                padding: '5px 14px', fontSize: 12, borderRadius: 99,
                border: `1px solid ${!activeRole ? 'var(--accent)' : 'var(--line-soft)'}`,
                color: !activeRole ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: !activeRole ? 600 : 400,
              }}
            >
              {t('jobs.filter.all')}
            </button>
            {targetRoles.map(role => (
              <button
                key={role}
                onClick={() => { setActiveRole(role === activeRole ? '' : role); setVisibleCount(PAGE_SIZE_INITIAL) }}
                className="btn btn-bare"
                style={{
                  padding: '5px 14px', fontSize: 12, borderRadius: 99,
                  border: `1px solid ${activeRole === role ? 'var(--accent)' : 'var(--line-soft)'}`,
                  color: activeRole === role ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: activeRole === role ? 600 : 400,
                }}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--line-soft)', paddingBottom: 2 }}>
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="btn btn-bare"
              style={{
                padding: '8px 14px', fontSize: 13,
                color: activeTab === tab.value ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: `2px solid ${activeTab === tab.value ? 'var(--accent)' : 'transparent'}`,
                borderRadius: 0, marginBottom: -2,
                transition: 'color .15s, border-color .15s',
              }}
            >
              {tab.label}
              {tab.value === 'new' && newCount > 0 && (
                <span style={{ marginLeft: 6, padding: '1px 6px', background: 'var(--accent)', color: 'white', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: 120, background: 'var(--bg-card)', borderRadius: 12 }} />)}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 14 }}>
            <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 24, color: 'var(--text-muted)', margin: '0 0 16px', fontStyle: 'italic' }}>
              {activeTab
                ? t('jobs.empty.noOffersTab', { tab: TABS.find(tb => tb.value === activeTab)?.label })
                : t('jobs.empty.noOffers')}
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-faint)', margin: '0 0 24px' }}>
              {t('jobs.empty.hint')}
            </p>
            <button onClick={handleRefresh} disabled={refreshing} className="btn btn-accent" style={{ padding: '12px 20px' }}>
              {refreshing ? t('jobs.searching') : t('jobs.empty.searchNow')}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visibleMatches.map(m => (
                <JobCard
                  key={m.id}
                  match={m}
                  onStatusChange={handleStatusChange}
                  onPrepare={handlePrepare}
                  preparing={preparing}
                />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={() => { setVisibleCount(c => c + PAGE_SIZE_MORE); setHasLoadedMore(true) }}
                  className="btn btn-bare"
                  style={{ padding: '12px 24px', border: '1px solid var(--line-soft)', borderRadius: 10, fontSize: 14 }}
                >
                  {t('jobs.pagination.showMore', { count: filteredMatches.length - visibleCount })}
                </button>
              </div>
            )}
          </>
        )}

        {hasLoadedMore && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: 32, right: 32, zIndex: 40,
              padding: '10px 16px', borderRadius: 99,
              background: 'var(--bg-card)', border: '1px solid var(--line-soft)',
              color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
              boxShadow: '0 4px 16px oklch(0 0 0 / 0.3)',
            }}
          >
            <Icon name="arrow-up" size={14} /> {t('jobs.pagination.scrollTop')}
          </button>
        )}
      </div>
    </Layout>
  )
}
