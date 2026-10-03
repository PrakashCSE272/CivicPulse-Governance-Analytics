import { useEffect, useState } from 'react'
import './Dashboard.css'

const BASE = 'http://localhost:8081'
const SUMMARY_API = `${BASE}/api/dashboard/summary`

const MENU = ['Dashboard', 'Citizens', 'Services', 'Grievances', 'Permits', 'Budget', 'Reports']

// Sidebar tab -> backend list endpoint (must match each controller's @RequestMapping)
const ENDPOINTS: Record<string, string> = {
  Citizens: '/api/citizens',
  Services: '/api/workflows',
  Grievances: '/api/grievances',
  Permits: '/api/permits',
  Budget: '/api/budget',
}

// Reports tab -> backend list endpoint
const REPORTS: Record<string, string> = {
  'Citizen Reports': '/api/citizens',
  'Grievance Reports': '/api/grievances',
  'Revenue Reports': '/api/revenue',
  'Performance Reports': '/api/departments',
}

type Summary = {
  cards: { serviceSla?: number; revenueCollected?: number; citizenSatisfaction?: number }
  services: { requests?: number; resolvedPercent?: number; avgDays?: number }
  grievances: { filed?: number; resolvedPercent?: number; mttrHours?: number }
  revenue: { total?: number; propertyTaxPercent?: number; licensesPercent?: number }
  budget: { allocated?: number; utilized?: number; utilizedPercent?: number }
  departments: { name: string; performance: number }[]
  trends: { complaintsDownPercent?: number; servicesUpPercent?: number }
}

const money = (n = 0) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `$${n.toLocaleString()}`
const count = (n = 0) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n)
const label = (c: string) => c.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())

/* ---------- Generic table used by the sidebar tabs and the Reports tab ---------- */
function DataTable({
  path,
  onToast,
  canDelete = true,
}: {
  path: string
  onToast: (m: string) => void
  canDelete?: boolean
}) {
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null)
  const [err, setErr] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    setRows(null)
    setErr('')
    fetch(BASE + path)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setRows)
      .catch(e => setErr(`Could not load ${path} (${e.message}). Check the controller's @RequestMapping.`))
  }, [path, reload])

  const remove = async (id: unknown) => {
    if (!window.confirm('Delete this record?')) return
    try {
      const r = await fetch(`${BASE}${path}/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      onToast('Record deleted')
      setReload(n => n + 1)
    } catch (e) {
      onToast(`Delete failed (${(e as Error).message}) - add a @DeleteMapping to this controller`)
    }
  }

  if (err) return <div className="cp-error">{err}</div>
  if (!rows) return <p>Loading...</p>
  if (rows.length === 0) return <p>No records yet.</p>

  const cols = Array.from(new Set(rows.flatMap(r => Object.keys(r)))).filter(c => c !== 'id')

  return (
    <div className="cp-panel" style={{ overflowX: 'auto' }}>
      <table className="cp-table">
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c}>{label(c)}</th>
            ))}
            {canDelete && <th></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map(c => (
                <td key={c}>{String(r[c] ?? '')}</td>
              ))}
              {canDelete && (
                <td>
                  <button className="cp-del" onClick={() => remove(r.id)}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Main dashboard ---------- */
export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null)
  const [error, setError] = useState('')
  const [active, setActive] = useState('Dashboard')
  const [report, setReport] = useState('Citizen Reports')
  const [drill, setDrill] = useState(false)
  const [toast, setToast] = useState('')

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Re-fetch the summary whenever the tab changes, so edits/deletes show up
  useEffect(() => {
    fetch(SUMMARY_API)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        setData(d)
        setError('')
      })
      .catch(e => setError(`Could not load data (${e.message}). Is the backend running on port 8081?`))
  }, [active])

  const exportReport = () => {
    if (!data) return
    const rows: string[][] = [
      ['Section', 'Metric', 'Value'],
      ['Cards', 'Citizen Satisfaction', String(data.cards.citizenSatisfaction)],
      ['Cards', 'Service SLA %', String(data.cards.serviceSla)],
      ['Cards', 'Revenue Collected', String(data.cards.revenueCollected)],
      ['Services', 'Requests', String(data.services.requests)],
      ['Services', 'Resolved %', String(data.services.resolvedPercent)],
      ['Services', 'Avg Days', String(data.services.avgDays)],
      ['Grievances', 'Filed', String(data.grievances.filed)],
      ['Grievances', 'Resolved %', String(data.grievances.resolvedPercent)],
      ['Grievances', 'MTTR Hours', String(data.grievances.mttrHours)],
      ['Revenue', 'Total', String(data.revenue.total)],
      ['Revenue', 'Property Tax %', String(data.revenue.propertyTaxPercent)],
      ['Revenue', 'Licenses %', String(data.revenue.licensesPercent)],
      ['Budget', 'Allocated', String(data.budget.allocated)],
      ['Budget', 'Utilized', String(data.budget.utilized)],
      ['Budget', 'Utilized %', String(data.budget.utilizedPercent)],
      ...data.departments.map(d => ['Departments', d.name, String(d.performance)]),
      ['Trends', 'Complaints down %', String(data.trends.complaintsDownPercent)],
      ['Trends', 'Services up %', String(data.trends.servicesUpPercent)],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'governance-report.csv'
    a.click()
    URL.revokeObjectURL(url)
    flash('Report exported')
  }

  const share = async () => {
    if (!data) return
    const text =
      `CivicPulse Nexus - Governance Analytics: ` +
      `${count(data.services.requests)} requests, ${data.services.resolvedPercent}% resolved. ` +
      `Revenue ${money(data.revenue.total)}. Budget ${data.budget.utilizedPercent}% utilized. ` +
      `Citizen SAT ${data.cards.citizenSatisfaction}/5. Complaints down ${data.trends.complaintsDownPercent}%.`
    try {
      await navigator.clipboard.writeText(text)
      flash('Summary copied to clipboard')
    } catch {
      flash('Could not copy')
    }
  }

  const isTableTab = !!ENDPOINTS[active]
  const showDashboard = active === 'Dashboard'

  return (
    <div className="cp-shell">
      <header className="cp-header">
        <strong>CivicPulse Nexus</strong>
        <span>Milestone 4: Governance Analytics</span>
        <small>Municipal Admin | Logout</small>
      </header>

      <div className="cp-body">
        <nav className="cp-side">
          {MENU.map(m => (
            <button key={m} className={m === active ? 'active' : ''} onClick={() => setActive(m)}>
              {m}
            </button>
          ))}
        </nav>

        <main className="cp-main">
          <h1>{showDashboard ? 'Executive Dashboard & Reports' : active}</h1>

          {/* Sidebar tabs: Citizens, Services, Grievances, Permits, Budget */}
          {isTableTab && <DataTable path={ENDPOINTS[active]} onToast={flash} />}

          {/* Reports tab */}
          {active === 'Reports' && (
            <>
              <div className="cp-actions" style={{ marginBottom: 16, marginTop: 0 }}>
                {Object.keys(REPORTS).map(r => (
                  <button key={r} className={r === report ? '' : 'cp-alt'} onClick={() => setReport(r)}>
                    {r}
                  </button>
                ))}
              </div>
              <DataTable path={REPORTS[report]} onToast={flash} canDelete={false} />
            </>
          )}

          {/* Dashboard tab */}
          {showDashboard && error && <div className="cp-error">{error}</div>}
          {showDashboard && !data && !error && <p>Loading...</p>}

          {showDashboard && data && (
            <>
              <section className="cp-cards">
                <div className="cp-card">
                  <label>Citizen Satisfaction</label>
                  <b>{data.cards.citizenSatisfaction}/5</b>
                  <em>Rating</em>
                </div>
                <div className="cp-card">
                  <label>Service SLA</label>
                  <b>{data.cards.serviceSla}%</b>
                  <em>Met</em>
                </div>
                <div className="cp-card">
                  <label>Revenue</label>
                  <b>{money(data.cards.revenueCollected)}</b>
                  <em>Collected</em>
                </div>
              </section>

              <section className="cp-panel">
                <h2>Analytics Dashboard - Governance KPIs</h2>
                <p>
                  Services: {count(data.services.requests)} requests | {data.services.resolvedPercent}% resolved |
                  Avg {data.services.avgDays} days
                </p>
                <p>
                  Grievances: {count(data.grievances.filed)} filed | {data.grievances.resolvedPercent}% resolved |
                  MTTR {data.grievances.mttrHours} hrs
                </p>
                <p>
                  Revenue: {money(data.revenue.total)} | Property Tax {data.revenue.propertyTaxPercent}% |
                  Licenses {data.revenue.licensesPercent}%
                </p>
                <p>
                  Budget: {money(data.budget.allocated)} allocated | {money(data.budget.utilized)} utilized |{' '}
                  {data.budget.utilizedPercent}%
                </p>
                <p>Departments: {data.departments.map(d => `${d.name} ${d.performance}%`).join(' | ')}</p>
                <p>
                  Citizen SAT: {data.cards.citizenSatisfaction}/5 | Complaints ↓ {data.trends.complaintsDownPercent}% |
                  Services ↑ {data.trends.servicesUpPercent}%
                </p>

                <div className="cp-actions">
                  <button onClick={exportReport}>Export Report</button>
                  <button onClick={() => setDrill(d => !d)}>{drill ? 'Hide Drill Down' : 'Drill Down'}</button>
                  <button onClick={share}>Share</button>
                </div>

                {drill && (
                  <div className="cp-drill">
                    <h3>Department Performance</h3>
                    {data.departments.map(d => (
                      <div className="cp-bar-row" key={d.name}>
                        <span>{d.name}</span>
                        <div className="cp-bar">
                          <div style={{ width: `${d.performance}%` }} />
                        </div>
                        <span>{d.performance}%</span>
                      </div>
                    ))}
                    <h3>Budget Utilization</h3>
                    <div className="cp-bar-row">
                      <span>Utilized</span>
                      <div className="cp-bar">
                        <div style={{ width: `${data.budget.utilizedPercent}%` }} />
                      </div>
                      <span>{data.budget.utilizedPercent}%</span>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {toast && <div className="cp-toast">{toast}</div>}
    </div>
  )
}