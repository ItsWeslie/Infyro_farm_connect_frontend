import { useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check,
  ChevronDown, CircleHelp, CloudSun, Command, CreditCard, Ellipsis, Field, Flower2,
  LayoutDashboard, Leaf, Menu, MoreHorizontal, Plus, Search, Settings2, Sprout,
  Tractor, TrendingUp, Wheat, X, MapPinned, ClipboardList, PackageCheck, SlidersHorizontal,
  CircleUserRound, Settings, LogOut, CheckCheck, Clock3, Droplets, Sun, Wallet,
} from 'lucide-react'
import './App.css'

const navigation = [
  { section: 'WORKSPACE', items: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Farms', icon: Tractor },
    { label: 'Fields', icon: MapPinned },
    { label: 'Crop management', icon: Sprout, badge: '4' },
    { label: 'Activities', icon: ClipboardList },
    { label: 'Calendar', icon: CalendarDays, dot: true },
  ]},
  { section: 'INSIGHTS', items: [
    { label: 'Expenses', icon: Wallet },
    { label: 'Harvest records', icon: PackageCheck },
    { label: 'Notifications', icon: Bell, badge: '3' },
  ]},
]
const crops = [
  { name: 'Tomato', variety: 'Arka Rakshak', field: 'North Field', area: '1.2 acres', progress: 72, status: 'Growing', harvest: 'Nov 12, 2026', icon: '🍅', tone: 'tomato' },
  { name: 'Rice', variety: 'Ponni', field: 'Paddy Field A', area: '2.5 acres', progress: 48, status: 'Growing', harvest: 'Dec 04, 2026', icon: '🌾', tone: 'rice' },
  { name: 'Spinach', variety: 'Palak Green', field: 'Kitchen Garden', area: '0.4 acres', progress: 94, status: 'Ready soon', harvest: 'Oct 30, 2026', icon: '🥬', tone: 'spinach' },
  { name: 'Chilli', variety: 'Guntur Sannam', field: 'East Field', area: '0.8 acres', progress: 35, status: 'Growing', harvest: 'Jan 18, 2027', icon: '🌶️', tone: 'chilli' },
]
const activities = [
  { icon: Droplets, tone: 'blue', title: 'Morning irrigation completed', detail: 'North Field · Tomato', time: 'Today, 8:30 AM' },
  { icon: Sprout, tone: 'green', title: 'Fertilizer applied', detail: 'Paddy Field A · Rice', time: 'Yesterday, 4:15 PM' },
  { icon: CheckCheck, tone: 'gold', title: 'Harvest record added', detail: 'Kitchen Garden · Spinach', time: 'Oct 24, 11:20 AM' },
]
const pageDescriptions = {
  Farms: 'A home for every plot, plan, and growing season.',
  Fields: 'Know your land, understand your soil, grow with confidence.',
  'Crop management': 'Follow every crop from planting to harvest.',
  Activities: 'Keep your daily farm work moving smoothly.',
  Calendar: 'Your season at a glance, with every important date in view.',
  Expenses: 'Understand where your farm investment goes.',
  'Harvest records': 'Celebrate every harvest and learn from each season.',
  Notifications: 'A calm place for updates that need your attention.',
  Settings: 'Make your farm workspace feel like yours.',
}
function Brand() {
  return <div className="brand" aria-label="Infyro Farm Connect">
    <div className="brand-symbol"><Sprout size={23} strokeWidth={2.2} /></div>
    <div className="brand-wordmark"><strong>infyro</strong><span>FARM CONNECT</span></div>
  </div>
}
function Avatar({ small = false }) { return <div className={small ? 'avatar avatar-small' : 'avatar'}>RK</div> }
function App() {
  const [active, setActive] = useState('Overview')
  const [search, setSearch] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [farmOpen, setFarmOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [cropName, setCropName] = useState('')
  const [localCrops, setLocalCrops] = useState(crops)
  const filteredCrops = useMemo(() => localCrops.filter(c => [c.name, c.variety, c.field].join(' ').toLowerCase().includes(search.toLowerCase())), [localCrops, search])
  function notify(message) { setToast(message); window.clearTimeout(window.__ifcToast); window.__ifcToast = window.setTimeout(() => setToast(''), 2600) }
  function addCrop(e) {
    e.preventDefault()
    if (!cropName.trim()) return
    setLocalCrops([{ name: cropName.trim(), variety: 'Local variety', field: 'Unassigned field', area: '—', progress: 4, status: 'Planned', harvest: 'To be scheduled', icon: '🌱', tone: 'new' }, ...localCrops])
    setCropName(''); setShowAdd(false); setActive('Crop management'); notify('Your crop was added to the demo workspace')
  }
  const currentIcon = navigation.flatMap(g => g.items).find(i => i.label === active)?.icon || LayoutDashboard
  const PageIcon = currentIcon
  return <div className="app-shell">
    {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={'sidebar ' + (mobileNav ? 'sidebar-open' : '')}>
      <div className="sidebar-top">
        <Brand />
        <button className="icon-button mobile-close" aria-label="Close menu" onClick={() => setMobileNav(false)}><X size={19}/></button>
      </div>
      <button className="farm-switch" onClick={() => setFarmOpen(!farmOpen)} aria-expanded={farmOpen}>
        <div className="farm-avatar"><Leaf size={18}/></div><span className="farm-meta"><strong>Green Valley Farm</strong><small><MapPinned size={11}/> Tambaram, Tamil Nadu</small></span><ChevronDown size={15} className={farmOpen ? 'rotate' : ''}/>
      </button>
      {farmOpen && <div className="farm-popover"><strong>My farms</strong><button onClick={() => { setFarmOpen(false); notify('Green Valley Farm selected') }}><span className="farm-dot"/>Green Valley Farm <Check size={14}/></button><button onClick={() => { setFarmOpen(false); notify('Demo farm switcher') }}><span className="farm-dot farm-dot-muted"/>Sunrise Plot <Plus size={14}/></button></div>}
      <nav className="side-navigation" aria-label="Main navigation">
        {navigation.map(group => <div className="nav-group" key={group.section}><div className="nav-label">{group.section}</div>{group.items.map(item => { const Icon = item.icon; return <button key={item.label} className={'nav-item ' + (active === item.label ? 'nav-active' : '')} onClick={() => { setActive(item.label); setMobileNav(false) }}><Icon size={18} strokeWidth={active === item.label ? 2.2 : 1.8}/><span>{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}{item.dot && <span className="nav-notice-dot"/>}</button> })}</div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="season-card"><div className="season-icon"><Sun size={17}/></div><div><strong>Growing together</strong><p>Small steps every day lead to a thriving farm.</p></div><button aria-label="Learn more about farm tips" onClick={() => notify('More farm tips are coming soon')}><ArrowUpRight size={15}/></button></div>
        <button className="sidebar-help" onClick={() => notify('Help centre is coming soon')}><CircleHelp size={17}/><span>Help & support</span><ArrowUpRight size={14}/></button>
        <div className="profile-area"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><Avatar/><span className="profile-copy"><strong>Ravi Kumar</strong><small>Farm owner</small></span><Ellipsis size={19}/></button>{profileOpen && <div className="profile-popover"><button onClick={() => { setActive('Settings'); setProfileOpen(false) }}><CircleUserRound size={16}/> My profile</button><button onClick={() => { setActive('Settings'); setProfileOpen(false) }}><Settings size={16}/> Settings</button><button onClick={() => { setProfileOpen(false); notify('You are in demo mode') }}><LogOut size={16}/> Sign out</button></div>}</div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div className="breadcrumbs"><span>Farm workspace</span><span className="crumb-slash">/</span><strong>{active}</strong></div></div>
        <div className="topbar-right">
          <label className="global-search"><Search size={16}/><input aria-label="Search workspace" placeholder="Search anything..." value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setActive('Crop management') }}/><kbd><Command size={10}/> K</kbd></label>
          <div className="top-divider"/>
          <div className="weather-chip"><span className="weather-icon"><CloudSun size={20}/></span><span><strong>29°C</strong><small>Mostly sunny</small></span></div>
          <div className="popover-anchor"><button className={'icon-button top-icon ' + (notificationsOpen ? 'icon-selected' : '')} aria-label="Notifications" onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false) }}><Bell size={19}/><i className="notification-dot"/></button>{notificationsOpen && <div className="notification-popover"><div className="popover-heading"><strong>Notifications</strong><span>3 new</span></div><div className="notification-row"><span className="notification-symbol gold"><CalendarDays size={16}/></span><span><strong>Harvest coming up</strong><small>Spinach is almost ready · in 3 days</small></span></div><div className="notification-row"><span className="notification-symbol green"><Droplets size={16}/></span><span><strong>Irrigation reminder</strong><small>Check moisture in North Field</small></span></div><div className="notification-row"><span className="notification-symbol blue"><Wallet size={16}/></span><span><strong>Weekly expenses ready</strong><small>Your farm spending overview is updated</small></span></div><button className="popover-footer" onClick={() => { setActive('Notifications'); setNotificationsOpen(false) }}>View all notifications <ArrowRight size={14}/></button></div>}</div>
          <button className="top-profile" aria-label="Open profile menu" onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false) }}><Avatar small/><ChevronDown size={14}/></button>
        </div>
      </header>
      <div className="page-content">
        {active === 'Overview' ? <Dashboard
          filteredCrops={filteredCrops} cropCount={localCrops.length} search={search} setSearch={setSearch}
          onAdd={() => setShowAdd(true)} onNavigate={setActive} notify={notify}
        /> : <section className="placeholder-page">
          <div className="page-eyebrow"><span className="eyebrow-pip"/>{active === 'Settings' ? 'PREFERENCES' : 'FARM WORKSPACE'}</div>
          <div className="page-title-row"><div className="page-title-icon"><PageIcon size={23}/></div><div><h1>{active}</h1><p>{pageDescriptions[active] || 'Personalize your farm workspace and preferences.'}</p></div><button className="button-primary" onClick={() => active === 'Crop management' ? setShowAdd(true) : notify(active + ' actions will be available in the next UI phase')}><Plus size={16}/>{active === 'Crop management' ? 'Add crop' : 'Create new'}</button></div>
          <div className="placeholder-banner"><div className="placeholder-art"><div className="placeholder-sun"/><div className="placeholder-hill one"/><div className="placeholder-hill two"/><Sprout size={64}/></div><div><span className="section-kicker">YOUR FARM, IN RHYTHM</span><h2>Good things take<br/><em>time to grow.</em></h2><p>This workspace is ready for its next chapter. We’re building each screen with the same thoughtful, farm-first design.</p><button className="button-secondary" onClick={() => setActive('Overview')}>Back to overview <ArrowRight size={15}/></button></div></div>
          <div className="placeholder-cards"><div className="surface-card"><span className="placeholder-card-icon"><PageIcon size={18}/></span><strong>Everything in one place</strong><p>Clear summaries and useful details, without the clutter.</p></div><div className="surface-card"><span className="placeholder-card-icon sage"><Sprout size={18}/></span><strong>Made for farm work</strong><p>Purposeful tools designed around your daily workflow.</p></div><div className="surface-card"><span className="placeholder-card-icon amber"><Activity size={18}/></span><strong>Progress at a glance</strong><p>Visual status, helpful reminders, and next steps.</p></div></div>
        </section>}
        <footer className="app-footer"><span>© 2026 Infyro Farm Connect</span><span className="footer-status"><i/> Your farm, growing with you</span><button onClick={() => notify('Help centre is coming soon')}>Help centre <ArrowUpRight size={13}/></button></footer>
      </div>
    </main>
    {showAdd && <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setShowAdd(false) }}><form className="dialog-card" onSubmit={addCrop}><div className="dialog-heading"><div><span className="section-kicker">GROW SOMETHING NEW</span><h2>Add a crop</h2><p>Start a new chapter for your farm.</p></div><button type="button" className="icon-button" aria-label="Close dialog" onClick={() => setShowAdd(false)}><X size={19}/></button></div><label className="form-label">Crop name<input required autoFocus placeholder="e.g. Tomato, Okra, Spinach" value={cropName} onChange={e => setCropName(e.target.value)}/></label><div className="dialog-note"><Sprout size={17}/><span>This demo entry will be added to your local crop directory.</span></div><div className="dialog-actions"><button type="button" className="button-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="button-primary"><Plus size={16}/>Add crop</button></div></form></div>}
    {toast && <div role="status" className="toast-message"><span><Check size={15}/></span>{toast}</div>}
  </div>
}
function Dashboard({ filteredCrops, cropCount, search, setSearch, onAdd, onNavigate, notify }) {
  return <>
    <section className="welcome-row"><div><div className="page-eyebrow"><span className="eyebrow-pip"/>TUESDAY, OCTOBER 27, 2026</div><h1>Good evening, Ravi <span className="wave">✳</span></h1><p>Here’s what’s happening on your farm today.</p></div><button className="button-primary" onClick={onAdd}><Plus size={17}/> Add new crop</button></section>
    <section className="hero-banner"><div className="hero-copy"><div className="hero-tag"><Flower2 size={14}/> YOUR FARM, IN RHYTHM</div><h2>Every season is a<br/><em>fresh beginning.</em></h2><p>Healthy soil. Thoughtful care. A little patience.<br/>You’re growing something wonderful.</p><button className="hero-button" onClick={() => onNavigate('Crop management')}>Explore your crops <ArrowRight size={15}/></button><div className="hero-note"><span><Sun size={14}/></span> A beautiful day to grow something good</div></div><div className="hero-art" aria-label="Illustration of growing plants"><div className="hero-sun"/><div className="hero-cloud cloud-a"/><div className="hero-cloud cloud-b"/><div className="hero-hill hill-back"/><div className="hero-hill hill-front"/><div className="hero-plant plant-a"><i/><b/><span/></div><div className="hero-plant plant-b"><i/><b/><span/></div><div className="hero-plant plant-c"><i/><b/><span/></div><div className="hero-flower"><i/><i/><i/><i/><b/></div><span className="art-caption">GROW WITH CARE <Flower2 size={12}/></span></div></section>
    <section className="stats-grid">
      <StatCard label="Total crops" value={String(cropCount).padStart(2,'0')} suffix="varieties" icon={Sprout} tone="sage" trend="+2 new" foot="this season" visual="bars"/>
      <StatCard label="Active fields" value="04" suffix="fields" icon={MapPinned} tone="blue" trend="4.9 acres" foot="under cultivation" visual="fields"/>
      <StatCard label="Upcoming harvest" value="03" suffix="crops" icon={Wheat} tone="amber" trend="Next in 3 days" foot="Spinach · Kitchen Garden" visual="calendar"/>
      <StatCard label="Monthly expenses" value="₹8,450" suffix="" icon={Wallet} tone="lilac" trend="↓ 8.4%" foot="vs. last month" visual="line"/>
    </section>
    <section className="dashboard-grid"><div className="surface-card crop-card"><div className="section-heading"><div><h2>Your growing crops</h2><p>A little progress goes a long way.</p></div><button className="button-link" onClick={() => onNavigate('Crop management')}>View all <ArrowRight size={14}/></button></div><div className="table-tools"><label className="table-search"><Search size={15}/><input placeholder="Search crops or fields..." value={search} onChange={e => setSearch(e.target.value)}/>{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={14}/></button>}</label><button className="filter-button" onClick={() => notify('All crop statuses are currently shown')}><SlidersHorizontal size={15}/>Filter</button></div><div className="crop-table-wrap"><table className="crop-table"><thead><tr><th>CROP</th><th>FIELD</th><th>PROGRESS</th><th>STATUS</th><th>HARVEST</th></tr></thead><tbody>{filteredCrops.slice(0,4).map(c => <tr key={c.name}><td><div className="crop-identity"><span className={'crop-emoji '+c.tone}>{c.icon}</span><span><strong>{c.name}</strong><small>{c.variety}</small></span></div></td><td><strong className="field-name">{c.field}</strong><small className="field-area">{c.area}</small></td><td><div className="progress-wrap"><div className="progress-track"><span style={{width:c.progress+'%'}}/></div><small>{c.progress}%</small></div></td><td><span className={'status-pill '+(c.status==='Ready soon'?'status-ready':c.status==='Planned'?'status-planned':'status-growing')}><i/>{c.status}</span></td><td className="harvest-date">{c.harvest}</td></tr>)}</tbody></table>{filteredCrops.length===0 && <div className="empty-state"><Sprout size={22}/><strong>No crops found</strong><span>Try another crop or field name.</span></div>}</div><div className="table-footer"><span>Showing <strong>{Math.min(filteredCrops.length,4)}</strong> of <strong>{filteredCrops.length}</strong> crops</span><button onClick={() => onNavigate('Crop management')}>Open crop directory <ArrowRight size={14}/></button></div></div>
      <div className="right-column"><div className="surface-card activity-card"><div className="section-heading"><div><h2>Recent activity</h2><p>The latest from your fields.</p></div><button className="icon-button subtle-icon" aria-label="Activity options" onClick={() => notify('Activity options are coming soon')}><MoreHorizontal size={19}/></button></div><div className="activity-list">{activities.map(a => {const Icon=a.icon;return <div className="activity-item" key={a.title}><span className={'activity-icon '+a.tone}><Icon size={16}/></span><div className="activity-copy"><strong>{a.title}</strong><p>{a.detail}</p><small><Clock3 size={11}/>{a.time}</small></div></div>})}</div><button className="activity-link" onClick={() => onNavigate('Activities')}>View activity log <ArrowRight size={14}/></button></div><div className="field-note"><div className="field-note-top"><span><Flower2 size={13}/> FIELD NOTE</span><span>NO. 024</span></div><div className="field-note-illustration"><Droplets size={25}/><Leaf size={39}/></div><h3>A little care goes<br/>a long way.</h3><p>Check soil moisture before watering. Your crops — and your water bill — will thank you.</p><button onClick={() => notify('Tip saved to your field notes')}>Save this tip <ArrowUpRight size={14}/></button><Flower2 className="note-decoration" size={64}/></div></div>
    </section>
  </>
}
function StatCard({ label, value, suffix, icon: Icon, tone, trend, foot, visual }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className={'stat-icon '+tone}><Icon size={17}/></span></div><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-foot"><span className={visual==='line'?'positive-trend':'trend-tag'}>{trend}</span><span>{foot}</span></div><div className={'stat-visual '+visual}>{visual==='bars' ? Array.from({length:12},(_,i)=><i key={i}/>) : visual==='fields' ? Array.from({length:4},(_,i)=><i key={i}/>) : visual==='calendar' ? <><b>30<small>OCT</small></b><b>02<small>NOV</small></b><b>04<small>NOV</small></b></> : <svg viewBox="0 0 120 32" preserveAspectRatio="none"><path d="M1 25 C14 24 15 10 28 16 S45 27 58 17 S73 19 83 9 S102 17 119 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}</div></article>
}
export default App
