import { useMemo, useState } from 'react'
import './App.css'

const initialCrops = [
  { id: 1, name: 'Tomato', variety: 'Arka Rakshak', field: 'North Field', area: '1.2 acres', status: 'Growing', progress: 72, harvest: 'Nov 12, 2026', color: 'tomato' },
  { id: 2, name: 'Rice', variety: 'Ponni', field: 'Paddy Field A', area: '2.5 acres', status: 'Growing', progress: 48, harvest: 'Dec 04, 2026', color: 'rice' },
  { id: 3, name: 'Spinach', variety: 'Palak Green', field: 'Kitchen Garden', area: '0.4 acres', status: 'Ready to harvest', progress: 94, harvest: 'Oct 30, 2026', color: 'spinach' },
  { id: 4, name: 'Chilli', variety: 'Guntur Sannam', field: 'East Field', area: '0.8 acres', status: 'Growing', progress: 35, harvest: 'Jan 18, 2027', color: 'chilli' },
]
const navItems = [
  { label: 'Overview', icon: '◫' }, { label: 'My crops', icon: '♧' }, { label: 'Fields', icon: '▦' },
  { label: 'Calendar', icon: '▦' }, { label: 'Expenses', icon: '₹' }, { label: 'Harvests', icon: '⌁' },
]
const activity = [
  { icon: '☀', tone: 'gold', title: 'Morning irrigation completed', detail: 'North Field · Tomato', time: 'Today, 8:30 AM' },
  { icon: '♧', tone: 'green', title: 'Fertilizer applied', detail: 'Paddy Field A · Rice', time: 'Yesterday, 4:15 PM' },
  { icon: '✓', tone: 'blue', title: 'Harvest record added', detail: 'Kitchen Garden · Spinach', time: 'Oct 24, 11:20 AM' },
]
function Icon({ children, className = '' }) { return <span aria-hidden="true" className={'icon ' + className}>{children}</span> }
function Brand() { return <div className="brand"><div className="brand-mark"><span>i</span><span className="brand-leaf">✦</span></div><div><strong>infyro</strong><small>FARM CONNECT</small></div></div> }
function App() {
  const [active, setActive] = useState('Overview')
  const [crops, setCrops] = useState(initialCrops)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ name: '', variety: '', field: '', area: '' })
  const filtered = useMemo(() => crops.filter(c => [c.name, c.variety, c.field].join(' ').toLowerCase().includes(search.toLowerCase())), [crops, search])
  function notify(message) { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  function addCrop(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setCrops(prev => [{ id: Date.now(), name: form.name.trim(), variety: form.variety || 'Local variety', field: form.field || 'Unassigned field', area: form.area ? form.area + ' acres' : '—', status: 'Planned', progress: 5, harvest: 'To be scheduled', color: 'new' }, ...prev])
    setForm({ name: '', variety: '', field: '', area: '' }); setShowAdd(false); setActive('My crops'); notify('Crop added to your farm')
  }
  const isOverview = active === 'Overview'
  return <div className="app-shell">
    <aside className="sidebar">
      <Brand />
      <div className="farm-switch"><div className="farm-avatar">🌿</div><div className="farm-meta"><strong>Green Valley Farm</strong><small>Tambaram, Tamil Nadu</small></div><span className="chevron">⌄</span></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.label} onClick={() => setActive(item.label)} className={'nav-item ' + (active === item.label ? 'selected' : '')}><Icon>{item.icon}</Icon><span>{item.label}</span>{item.label === 'Calendar' && <span className="nav-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-sun">✳</div><strong>Growing together</strong><p>Small steps every day lead to a thriving farm.</p><button onClick={() => notify('Farm tips are coming soon')}>Explore farm tips <span>↗</span></button></div><button className="profile-row" onClick={() => notify('Account settings coming soon')}><div className="profile-avatar">RK</div><div><strong>Ravi Kumar</strong><small>Farm owner</small></div><span className="more">···</span></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Farm workspace <span>/</span> <strong>{active}</strong></div><div className="top-actions"><div className="weather-pill"><span>☀</span><div><strong>29°C</strong><small>Mostly sunny</small></div></div><button className="icon-button notification" aria-label="Notifications" onClick={() => notify('You’re all caught up!')}>♧<i /></button><div className="top-avatar">RK</div></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> TUESDAY, OCTOBER 27, 2026</div><h1>{isOverview ? 'Good evening, Ravi' : active}<span className="wave">{isOverview ? ' 👋' : ''}</span></h1><p>{isOverview ? 'Here’s what’s happening on your farm today.' : active === 'My crops' ? 'Keep track of every crop, from planting to harvest.' : 'Manage your farm activity and keep everything growing.'}</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><span>＋</span> Add new crop</button></section>
        {isOverview && <section className="hero-banner"><div className="hero-copy"><div className="hero-tag"><span>✦</span> YOUR FARM, IN RHYTHM</div><h2>Every season is a<br/><em>fresh beginning.</em></h2><p>Healthy soil. Thoughtful care. A little patience.<br/>You’re growing something wonderful.</p><button onClick={() => setActive('My crops')}>Explore your crops <span>→</span></button></div><div className="hero-art" aria-label="Illustration of growing plants"><div className="sun-disc" /><div className="hill hill-back" /><div className="hill hill-front" /><div className="plant plant-one"><i/><b/><span/></div><div className="plant plant-two"><i/><b/><span/></div><div className="plant plant-three"><i/><b/><span/></div><div className="flower"><i/><i/><i/><i/><i/><b/></div><div className="art-label">GROW WITH CARE <span>✦</span></div></div><div className="hero-spark spark-one">✳</div><div className="hero-spark spark-two">✦</div></section>}
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-head"><span>Total crops</span><span className="stat-icon green">♧</span></div><div className="stat-number">{crops.length}<small> varieties</small></div><div className="stat-foot"><span className="trend-up">↗ 2 new</span><span> this season</span></div><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
          <div className="stat-card"><div className="stat-head"><span>Active fields</span><span className="stat-icon blue">▦</span></div><div className="stat-number">4<small> fields</small></div><div className="stat-foot"><span className="muted-dot" /> Across 4.9 acres</div><div className="stat-visual field-visual"><i/><i/><i/><i/></div></div>
          <div className="stat-card"><div className="stat-head"><span>Upcoming harvest</span><span className="stat-icon orange">♧</span></div><div className="stat-number">3<small> crops</small></div><div className="stat-foot"><span className="trend-warm">Next in 3 days</span></div><div className="harvest-visual"><span>30</span><span>02</span><span>04</span><small>OCT</small><small>NOV</small><small>NOV</small></div></div>
          <div className="stat-card"><div className="stat-head"><span>Monthly expenses</span><span className="stat-icon violet">₹</span></div><div className="stat-number">₹8,450</div><div className="stat-foot"><span className="trend-down">↓ 8.4%</span><span> vs last month</span></div><div className="expense-line"><svg viewBox="0 0 180 36" preserveAspectRatio="none"><path d="M0 29 C16 26 19 13 33 18 S51 30 67 19 S87 22 102 10 S122 19 137 13 S161 20 180 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></div></div>
        </section>
        <section className="content-grid"><div className="panel crops-panel"><div className="panel-heading"><div><h3>{isOverview ? 'Your growing crops' : 'Crop directory'}</h3><p>{isOverview ? 'A little progress goes a long way.' : 'Search and manage the crops on your farm.'}</p></div><button className="text-button" onClick={() => setActive('My crops')}>View all <span>→</span></button></div><div className="crop-toolbar"><div className="search-box"><Icon>⌕</Icon><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crops or fields..." /></div><button className="filter-button" onClick={() => notify('Showing all crop statuses')}>☷ <span>Filter</span></button></div><div className="crop-table-wrap"><table className="crop-table"><thead><tr><th>CROP</th><th>FIELD</th><th>PROGRESS</th><th>STATUS</th><th>HARVEST DATE</th></tr></thead><tbody>{(isOverview ? filtered.slice(0,4) : filtered).map(crop => <tr key={crop.id}><td><div className="crop-name-cell"><div className={'crop-thumb ' + crop.color}>{crop.color === 'tomato' ? '🍅' : crop.color === 'rice' ? '🌾' : crop.color === 'spinach' ? '🥬' : crop.color === 'chilli' ? '🌶️' : '🌱'}</div><div><strong>{crop.name}</strong><small>{crop.variety}</small></div></div></td><td><strong className="field-name">{crop.field}</strong><small className="area-label">{crop.area}</small></td><td><div className="progress-cell"><div className="progress-track"><i style={{width: crop.progress + '%'}} /></div><small>{crop.progress}%</small></div></td><td><span className={'status-pill ' + (crop.status === 'Ready to harvest' ? 'ready' : crop.status === 'Planned' ? 'planned' : 'growing')}><i />{crop.status}</span></td><td className="harvest-date">{crop.harvest}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-search">No crops match “{search}”. Try another search.</div>}</div><div className="table-footer"><span>Showing <strong>{isOverview ? Math.min(filtered.length,4) : filtered.length}</strong> of <strong>{crops.length}</strong> crops</span><button onClick={() => setActive('My crops')}>Open crop directory <span>→</span></button></div></div>
          <div className="right-column"><div className="panel activity-panel"><div className="panel-heading"><div><h3>Recent activity</h3><p>The latest from your fields.</p></div><button className="dots-button" onClick={() => notify('Activity options')}>···</button></div><div className="activity-list">{activity.map((a, i) => <div className="activity-item" key={a.title}><div className={'activity-icon ' + a.tone}>{a.icon}</div><div className="activity-copy"><strong>{a.title}</strong><p>{a.detail}</p><small>{a.time}</small></div></div>)}</div><button className="activity-link" onClick={() => notify('You’re viewing the latest activity')}>View activity log <span>→</span></button></div><div className="tip-card"><div className="tip-top"><span>✳ FIELD NOTE</span><span>NO. 024</span></div><div className="tip-leaf">♧</div><h3>A little care goes<br/>a long way.</h3><p>Check soil moisture before watering. Your crops — and your water bill — will thank you.</p><button onClick={() => notify('Tip saved to your field notes')}>Save this tip <span>↗</span></button><div className="tip-decoration">✳</div></div></div></section>
        <footer className="footer"><span>© 2026 Infyro Farm Connect</span><span><i/> Your farm data, growing with you</span><a href="https://github.com/ItsWeslie/Infyro_farm_connect" target="_blank" rel="noreferrer">Help & support ↗</a></footer>
      </div>
    </main>
    {showAdd && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowAdd(false) }}><form className="add-modal" onSubmit={addCrop}><div className="modal-head"><div><span className="modal-kicker">GROW SOMETHING NEW</span><h2>Add a crop</h2><p>Start a new chapter for your farm.</p></div><button type="button" className="modal-close" onClick={() => setShowAdd(false)}>×</button></div><label>Crop name<input required autoFocus placeholder="e.g. Tomato" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></label><label>Variety<input placeholder="e.g. Arka Rakshak" value={form.variety} onChange={e => setForm({...form, variety:e.target.value})}/></label><label>Field name<input placeholder="e.g. North Field" value={form.field} onChange={e => setForm({...form, field:e.target.value})}/></label><label>Area (acres)<input type="number" min="0" step="0.1" placeholder="e.g. 1.2" value={form.area} onChange={e => setForm({...form, area:e.target.value})}/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="primary-button">＋ Add crop</button></div></form></div>}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>
}
export default App
