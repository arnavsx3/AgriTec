import { useEffect, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CloudDrizzle, CloudSun,
  Droplets, Ellipsis, Home, Leaf, MapPin, Menu, Plus, Search, Settings,
  Sprout, Sun, Thermometer, TrendingUp, Users, Wind, X, Zap,
} from 'lucide-react'
import './App.css'
import './typography.css'
import { checkApi, clearAccessToken, createCrop, createFarm, getCrops, getCurrentUser, getFarms, refreshSession, signIn, signOut, signUp } from './api.js'

const TODAY_LABEL = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()

const initialTasks = [
  { id: 1, title: 'Irrigate North Field', detail: 'North Field · 2.4 acres', time: 'Today, 9:00 AM', tone: 'blue', done: false },
  { id: 2, title: 'Check tomato leaves', detail: 'Greenhouse A · Pest check', time: 'Today, 11:30 AM', tone: 'orange', done: false },
  { id: 3, title: 'Apply organic compost', detail: 'East Plot · Soil care', time: 'Tomorrow, 8:00 AM', tone: 'green', done: true },
]

const initialCrops = [
  { name: 'Tomatoes', variety: 'Roma · Greenhouse A', stage: 'Fruiting', progress: 72, days: '18 days to harvest', tint: 'tomato', emoji: '🍅', area: '1.2 acres' },
  { name: 'Sweet corn', variety: 'Golden Bantam · North Field', stage: 'Vegetative', progress: 48, days: '34 days to harvest', tint: 'corn', emoji: '🌽', area: '2.4 acres' },
  { name: 'Lettuce', variety: 'Butterhead · East Plot', stage: 'Maturity', progress: 86, days: '6 days to harvest', tint: 'lettuce', emoji: '🥬', area: '0.8 acres' },
]

const navGroups = [
  { label: 'WORKSPACE', items: [{ name: 'Overview', icon: Home }, { name: 'My farms', icon: MapPin }, { name: 'Crop calendar', icon: CalendarDays }, { name: 'Insights', icon: Activity }] },
  { label: 'COMMUNITY', items: [{ name: 'Experts & community', icon: Users }] },
]

const pageCopy = {
  Overview: ['Good morning, Arjun 👋', 'Here’s what’s happening on your farm today.'],
  'My farms': ['Your farms', 'Keep an eye on every field, all in one place.'],
  'Crop calendar': ['Crop calendar', 'Track what’s growing and what’s coming up next.'],
  Insights: ['Farm insights', 'A clear picture of your soil, crops, and season.'],
  'Experts & community': ['Grow together', 'Ask a question or learn from other growers.'],
}

function Brand() {
  return <div className="brand"><div className="brand-mark"><Sprout size={22} strokeWidth={2.3} /></div><span>agri<span className="brand-light">tec</span></span></div>
}

function MetricCard({ icon: Icon, label, value, unit, trend, trendTone = 'positive', note, iconTone }) {
  return <article className="metric-card">
    <div className="metric-top"><span className={`metric-icon ${iconTone}`}><Icon size={18} /></span><span className={`trend ${trendTone}`}>{trendTone === 'positive' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{trend}</span></div>
    <p className="metric-label">{label}</p><div className="metric-value">{value}<span>{unit}</span></div><p className="metric-note">{note}</p>
  </article>
}

function WeatherCard() {
  return <article className="weather-card">
    <div className="weather-heading"><div><span className="eyebrow">LOCAL WEATHER <span className="demo-pill">DEMO</span></span><div className="weather-place"><MapPin size={14} /> Nashik, Maharashtra</div></div><button className="icon-button weather-more" aria-label="Weather options"><Ellipsis size={19} /></button></div>
    <div className="weather-current"><div className="weather-temp">28<span>°</span></div><div className="weather-conditions"><CloudSun size={37} strokeWidth={1.6} /><span>Partly cloudy</span></div></div>
    <div className="weather-detail"><span><Thermometer size={15} /> Feels like 31°</span><span><Droplets size={15} /> 64%</span><span><Wind size={15} /> 12 km/h</span></div>
    <div className="weather-divider" />
    <div className="forecast">
      {[['Now', CloudSun, '28°'], ['12 PM', Sun, '30°'], ['2 PM', CloudSun, '29°'], ['4 PM', CloudDrizzle, '26°']].map(([time, Icon, temp]) => <div className="forecast-item" key={time}><span>{time}</span><Icon size={18} /><strong>{temp}</strong></div>)}
    </div>
    <p className="weather-footnote">Illustrative forecast · connect a provider for live conditions</p>
  </article>
}

function HarvestChart() {
  const bars = [42, 55, 47, 66, 53, 76, 63, 86, 70, 91, 78, 100]
  return <div className="chart-wrap">
    <div className="chart-summary"><div><span className="chart-big">2,480 <small>kg</small></span><span className="chart-period">Harvested this season</span></div><span className="chart-growth"><TrendingUp size={14} /> 12.8%</span></div>
    <div className="chart" role="img" aria-label="Harvest trend rising over the last 12 weeks"><div className="chart-lines"><i /><i /><i /><i /></div><div className="bars">{bars.map((height, index) => <div key={index} className={`bar ${index === 11 ? 'bar-current' : ''}`} style={{ height: `${height}%` }}><span>{index === 11 ? '2.48t' : ''}</span></div>)}</div></div>
    <div className="chart-labels"><span>Aug 1</span><span>Aug 15</span><span>Sep 1</span><span>Sep 15</span><span>Sep 28</span></div>
  </div>
}

function CropCard({ crop, onMenu }) {
  return <article className="crop-card">
    <div className={`crop-visual ${crop.tint}`}><span className="crop-emoji">{crop.emoji}</span><span className="crop-stage">{crop.stage}</span><button className="crop-menu" onClick={onMenu} aria-label={`Options for ${crop.name}`}><Ellipsis size={17} /></button></div>
    <div className="crop-info"><div className="crop-title-row"><div><h3>{crop.name}</h3><p>{crop.variety}</p></div><span className="crop-area">{crop.area}</span></div><div className="progress-meta"><span>Growing progress</span><strong>{crop.progress}%</strong></div><div className="progress-track"><span style={{ width: `${crop.progress}%` }} /></div><div className="harvest-date"><CalendarDays size={14} /> {crop.days}</div></div>
  </article>
}

function TaskItem({ task, toggle }) {
  return <div className={`task-row ${task.done ? 'task-done' : ''}`}><button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggle(task.id)} aria-label={task.done ? 'Mark task incomplete' : 'Mark task complete'}>{task.done && <Check size={13} />}</button><span className={`task-dot ${task.tone}`} /><div className="task-copy"><strong>{task.title}</strong><span>{task.detail}</span></div><span className="task-time">{task.time}</span></div>
}

function AddTaskDialog({ close, save }) {
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('Choose a field')
  function submit(event) { event.preventDefault(); if (title.trim()) { save(title.trim(), detail); close() } }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close() }}><form className="task-modal" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">FARM PLANNER</span><h2>Add a field task</h2></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={19} /></button></div><label>Task name<input autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Check irrigation lines" required /></label><label>Field or note<input value={detail} onChange={event => setDetail(event.target.value)} placeholder="e.g. North Field" /></label><div className="modal-actions"><button type="button" className="button-secondary" onClick={close}>Cancel</button><button className="button-primary" type="submit"><Plus size={16} /> Add task</button></div></form></div>
}

function AlternateView({ page, crops, farms, onNotice }) {
  if (page === 'My farms') return <section className="alternate-grid">{(farms || [{ _id: 'sample-1', name: 'North Field', location: 'Nashik, Maharashtra', area: 2.4, areaUnit: 'acres' }, { _id: 'sample-2', name: 'Greenhouse A', location: 'Nashik, Maharashtra', area: 1.2, areaUnit: 'acres' }, { _id: 'sample-3', name: 'East Plot', location: 'Nashik, Maharashtra', area: 0.8, areaUnit: 'acres' }]).map((farm, index) => <article className="farm-card" key={farm._id}><div className={`farm-art farm-${index % 3}`}><span>{['🌾', '🍅', '🥬'][index % 3]}</span><span className="farm-tag">{farm.soilType || 'Farm'}</span></div><div className="farm-card-content"><div><h3>{farm.name}</h3><p><MapPin size={14} /> {farm.location || 'Location not set'}</p></div><strong>{farm.area} <small>{farm.areaUnit || 'acres'}</small></strong></div><div className="farm-card-foot"><span><Sprout size={14} /> Farm workspace</span><span>Active</span></div></article>)}</section>
  if (page === 'Crop calendar') return <section className="calendar-view"><div className="section-heading"><div><span className="eyebrow">SEASON AT A GLANCE</span><h2>Growing now</h2></div><button className="button-secondary"><ChevronLeft size={16} /> September <ChevronRight size={16} /></button></div><div className="calendar-list">{crops.map((crop, index) => <div className="calendar-row" key={crop.name}><span className="calendar-emoji">{crop.emoji}</span><div className="calendar-crop"><strong>{crop.name}</strong><span>{crop.variety}</span></div><div className="calendar-bar"><i style={{ width: `${crop.progress}%` }} /></div><strong className="calendar-progress">{crop.progress}%</strong><span className="calendar-days">{crop.days}</span><span className={`calendar-dot calendar-dot-${index}`} /></div>)}</div><div className="calendar-note"><CalendarDays size={18} /><p><strong>Coming up this week</strong><span>Lettuce harvest is just around the corner. Plan your picking and delivery.</span></p></div></section>
  if (page === 'Insights') return <section className="insights-view"><div className="section-heading"><div><span className="eyebrow">SEASON TO DATE · DEMO DATA</span><h2>Your farm at a glance</h2></div><span className="demo-pill">ILLUSTRATIVE</span></div><div className="insight-cards"><article><span className="insight-icon green"><Sprout size={19} /></span><span className="eyebrow">CROP HEALTH</span><strong>Looking good</strong><p>3 crops are progressing on schedule this season.</p></article><article><span className="insight-icon blue"><Droplets size={19} /></span><span className="eyebrow">SOIL MOISTURE</span><strong>68% <small>Balanced</small></strong><p>North Field may benefit from irrigation tomorrow.</p></article><article><span className="insight-icon orange"><Sun size={19} /></span><span className="eyebrow">SOIL NUTRIENTS</span><strong>Good range</strong><p>Last recorded observation · Sep 22</p></article></div><div className="insight-callout"><Zap size={19} /><div><strong>One small step for a healthier crop</strong><p>Check the North Field moisture before your next watering. These are example recommendations, not sensor readings.</p></div></div></section>
  return <section className="community-view"><div className="community-banner"><div><span className="eyebrow">AGRI COMMUNITY</span><h2>Good things grow together.</h2><p>Share what’s working, ask a question, and learn from farmers nearby.</p><button className="button-primary" onClick={() => onNotice('Community posting will be available when the API is connected.')}><Plus size={16} /> Start a discussion</button></div><div className="community-illustration">🌱</div></div><div className="community-post"><div className="avatar">RK</div><div><span className="post-meta">Ravi K. · 2 hours ago · Nashik</span><h3>What’s your go-to natural fix for aphids on tomato plants?</h3><p>Noticed a few on the undersides of leaves in my greenhouse. Would love to hear what has worked for you this season.</p><div className="post-actions"><button><Users size={15} /> 8 replies</button><button><Leaf size={15} /> Helpful</button></div></div></div><div className="community-post"><div className="avatar avatar-gold">MS</div><div><span className="post-meta">Meera S. · Yesterday · Pune</span><h3>First harvest of the season! 🌽</h3><p>Golden Bantam is ready earlier than expected. Sharing a little reminder to check your planting dates against local rainfall.</p><div className="post-actions"><button><Users size={15} /> 12 replies</button><button><Leaf size={15} /> Helpful</button></div></div></div></section>
}

function AuthDialog({ close, submit }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function onSubmit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await submit({ mode, name, email, password }) }
    catch (issue) { setError(issue.message || 'Could not connect. Check that the API and MongoDB are running.') }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close() }}><form className="task-modal auth-modal" onSubmit={onSubmit}><div className="modal-heading"><div><span className="eyebrow">YOUR FARM, YOUR DATA</span><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={19} /></button></div>{mode === 'register' && <label>Your name<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" minLength="2" maxLength="80" required /></label>}<label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 10} required />{mode === 'register' && <small className="field-hint">Use at least 10 characters.</small>}</label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions auth-actions"><button type="button" className="auth-switch" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login') }}>{mode === 'login' ? 'Create account' : 'I already have an account'}</button><button className="button-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></div></form></div>
}

function CropDialog({ farms, close, save }) {
  const [farmId, setFarmId] = useState(farms[0]?._id || '')
  const [name, setName] = useState('')
  const [variety, setVariety] = useState('')
  const [growthStage, setGrowthStage] = useState('planning')
  const [area, setArea] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function onSubmit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await save({ farmId, values: { name, variety, growthStage, area: Number(area) || 0 } }) }
    catch (issue) { setError(issue.message || 'Could not save this crop.') }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close() }}><form className="task-modal" onSubmit={onSubmit}><div className="modal-heading"><div><span className="eyebrow">CROP PLANNER</span><h2>Track a crop</h2></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={19} /></button></div><label>Farm<select value={farmId} onChange={event => setFarmId(event.target.value)} required>{farms.map(farm => <option key={farm._id} value={farm._id}>{farm.name}</option>)}</select></label><label>Crop name<input value={name} onChange={event => setName(event.target.value)} maxLength="80" required placeholder="e.g. Tomatoes" /></label><label>Variety<input value={variety} onChange={event => setVariety(event.target.value)} maxLength="100" placeholder="Optional" /></label><div className="area-input-row"><label>Growth stage<select value={growthStage} onChange={event => setGrowthStage(event.target.value)}><option value="planning">Planning</option><option value="seedling">Seedling</option><option value="vegetative">Vegetative</option><option value="flowering">Flowering</option><option value="fruiting">Fruiting</option><option value="maturity">Maturity</option></select></label><label>Area (acres)<input type="number" value={area} onChange={event => setArea(event.target.value)} min="0" step="0.1" placeholder="0.0" /></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button-secondary" onClick={close}>Cancel</button><button className="button-primary" type="submit" disabled={busy || !farms.length}>{busy ? 'Saving…' : 'Save crop'}</button></div></form></div>
}

function FarmDialog({ close, save }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [area, setArea] = useState('')
  const [areaUnit, setAreaUnit] = useState('acres')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function onSubmit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await save({ name, location, area: Number(area), areaUnit }) }
    catch (issue) { setError(issue.message || 'Could not save this farm.') }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close() }}><form className="task-modal" onSubmit={onSubmit}><div className="modal-heading"><div><span className="eyebrow">FARM PROFILE</span><h2>Add a farm</h2></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={19} /></button></div><label>Farm name<input value={name} onChange={event => setName(event.target.value)} maxLength="100" required placeholder="e.g. North Field" /></label><label>Location<input value={location} onChange={event => setLocation(event.target.value)} maxLength="160" placeholder="Village or district" /></label><div className="area-input-row"><label>Farm area<input type="number" value={area} onChange={event => setArea(event.target.value)} min="0" step="0.1" required placeholder="0.0" /></label><label>Unit<select value={areaUnit} onChange={event => setAreaUnit(event.target.value)}><option value="acres">Acres</option><option value="hectares">Hectares</option></select></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button-secondary" onClick={close}>Cancel</button><button className="button-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save farm'}</button></div></form></div>
}

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [tasks, setTasks] = useState(initialTasks)
  const [crops] = useState(initialCrops)
  const [showModal, setShowModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [farmOpen, setFarmOpen] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')
  const [liveFarms, setLiveFarms] = useState(null)
  const [liveCrops, setLiveCrops] = useState([])
  const [profileMenu, setProfileMenu] = useState(false)
  const toggleTask = id => setTasks(current => current.map(task => task.id === id ? { ...task, done: !task.done } : task))
  const addTask = (title, detail) => { setTasks(current => [{ id: Date.now(), title, detail: detail || 'Farm task', time: 'Today · Just added', tone: 'green', done: false }, ...current]); setToast('Task added to your farm planner'); window.setTimeout(() => setToast(''), 2600) }
  const loadAccountData = async () => {
    const farms = await getFarms()
    const records = await Promise.all(farms.map(farm => getCrops(farm._id)))
    setLiveFarms(farms)
    setLiveCrops(records.flat().map(crop => ({ name: crop.name, variety: `${crop.variety || 'Crop'} · ${farms.find(farm => farm._id === crop.farm)?.name || 'My farm'}`, stage: crop.growthStage, progress: crop.progress, days: crop.expectedHarvestDate ? `${Math.max(0, Math.ceil((new Date(crop.expectedHarvestDate) - new Date()) / 86400000))} days to harvest` : 'Harvest date not set', tint: crop.name.toLowerCase().includes('tomato') ? 'tomato' : crop.name.toLowerCase().includes('corn') ? 'corn' : 'lettuce', emoji: crop.name.toLowerCase().includes('tomato') ? '🍅' : crop.name.toLowerCase().includes('corn') ? '🌽' : '🌱', area: `${crop.area || 0} acres` })))
  }
  const handleAuth = async ({ mode, name, email, password }) => {
    const user = mode === 'register' ? await signUp(name, email, password) : await signIn(email, password)
    setCurrentUser(user)
    await loadAccountData()
    setAuthOpen(false)
    setToast(`Welcome, ${user.name.split(' ')[0]}! Your farm records are connected.`)
    window.setTimeout(() => setToast(''), 3000)
  }
  const handleCreateCrop = async crop => {
    await createCrop(crop.farmId, crop.values); await loadAccountData(); setCropOpen(false)
    setToast('Crop added to your farm'); window.setTimeout(() => setToast(''), 2600)
  }
  const handlePrimaryAction = () => {
    if (activePage === 'My farms') { if (currentUser) setFarmOpen(true); else setAuthOpen(true) }
    else if (activePage === 'Crop calendar') { if (currentUser) setCropOpen(true); else setAuthOpen(true) }
    else setShowModal(true)
  }
  const handleCreateFarm = async farm => {
    await createFarm(farm); await loadAccountData(); setFarmOpen(false)
    setToast('Farm added to your account'); window.setTimeout(() => setToast(''), 2600)
  }
  const handleSignOut = async () => {
    await signOut(); clearAccessToken(); setCurrentUser(null); setLiveFarms(null); setLiveCrops([]); setProfileMenu(false)
    setToast('Signed out. You are viewing sample data.'); window.setTimeout(() => setToast(''), 2600)
  }
  useEffect(() => {
    let active = true
    checkApi().then(async () => {
      if (!active) return
      setApiStatus('available')
      try { await refreshSession(); const user = await getCurrentUser(); if (active) { setCurrentUser(user); await loadAccountData() } }
      catch { clearAccessToken() }
    }).catch(() => { if (active) setApiStatus('offline') })
    return () => { active = false }
  }, [])
  const [greeting, subhead] = pageCopy[activePage]
  const visibleCropData = currentUser ? liveCrops : crops
  const visibleCrops = visibleCropData.filter(crop => `${crop.name} ${crop.variety}`.toLowerCase().includes(search.toLowerCase()))

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand /><button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <button className="farm-switcher" onClick={() => currentUser ? setActivePage('My farms') : setAuthOpen(true)}><span className="farm-avatar"><Sprout size={18} /></span><span><strong>{liveFarms?.[0]?.name || 'Green Valley Farm'}</strong><small>{currentUser ? 'Connected account' : 'Sample workspace'}</small></span><ChevronDown size={16} className="switch-chevron" /></button>
      <div className="nav-scroll">{navGroups.map(group => <div className="nav-group" key={group.label}><span className="nav-label">{group.label}</span>{group.items.map(({ name, icon: Icon }) => <button key={name} className={`nav-item ${activePage === name ? 'active' : ''}`} onClick={() => { setActivePage(name); setMobileNav(false) }}><Icon size={18} strokeWidth={1.8} /><span>{name}</span>{name === 'Insights' && <span className="nav-new">NEW</span>}</button>)}</div>)}
      <div className="season-card"><div className="season-icon"><Sun size={17} /></div><span className="season-label">CURRENT SEASON</span><strong>Kharif season</strong><span className="season-detail">Sample season · Day 82 of 120</span><div className="season-progress"><span /></div></div></div>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18} strokeWidth={1.8} /><span>Settings</span></button><button className="profile profile-button" onClick={() => currentUser ? handleSignOut() : setAuthOpen(true)}><div className="profile-avatar">{currentUser?.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'AP'}</div><div className="profile-copy"><strong>{currentUser?.name || 'Sample farmer'}</strong><span>{currentUser ? 'Tap to sign out' : 'Connect your account'}</span></div><Ellipsis size={18} className="profile-more" /></button></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay" />}
    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={15} /><strong>{activePage}</strong></div></div><div className="topbar-actions"><span className={`api-status ${apiStatus}`}><i />{apiStatus === 'available' ? 'API connected' : apiStatus === 'checking' ? 'Connecting…' : 'Demo mode'}</span><label className="search-box"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search crops..." /></label><div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}><Bell size={19} /><i /></button>{showNotifications && <div className="notification-popover"><strong>You’re all caught up</strong><span>New farm alerts will show up here.</span></div>}</div><div className="account-action"><button className="top-avatar account-button" onClick={() => currentUser ? setProfileMenu(!profileMenu) : setAuthOpen(true)} aria-label={currentUser ? 'Account options' : 'Sign in'}>{currentUser?.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'AP'}</button>{profileMenu && <div className="profile-popover"><strong>{currentUser?.name}</strong><span>{currentUser?.email}</span><button onClick={handleSignOut}>Sign out</button></div>}</div></div></header>
      <div className="page-content">
        <section className={`hero-banner ${activePage === 'Overview' ? 'overview-hero' : 'compact-hero'}`}>
          <div className="hero-copy">
            <div className="hero-kicker"><span className="hero-live-dot" /> {activePage === 'Overview' ? TODAY_LABEL : 'YOUR FARM WORKSPACE'} <span className="hero-sample-tag">{activePage === 'Overview' ? 'SAMPLE INSIGHTS' : 'AGRI TEC'}</span></div>
            <h1>{activePage === 'Overview' ? 'A better day starts in the field.' : greeting}</h1>
            <p>{activePage === 'Overview' ? 'Good morning, Arjun. Let’s make today count for your farm.' : subhead}</p>
            <div className="hero-actions"><button className="hero-primary" onClick={handlePrimaryAction}><Plus size={16} /> {activePage === 'My farms' ? 'Add a farm' : activePage === 'Crop calendar' ? 'Add a crop' : 'Plan today’s work'}</button>{activePage === 'Overview' && <button className="hero-secondary" onClick={() => setActivePage('Crop calendar')}>Explore your crops <ArrowRight size={15} /></button>}</div>
          </div>
          {activePage === 'Overview' && <div className="hero-art" aria-hidden="true"><div className="hero-sun" /><div className="hero-hill hero-hill-back" /><div className="hero-hill hero-hill-front" /><div className="hero-field-lines"><i /><i /><i /><i /></div><div className="hero-plant"><Sprout size={72} strokeWidth={1.35} /></div><div className="hero-weather-chip"><CloudSun size={17} /><span><strong>28°</strong><small>Nashik today</small></span></div><div className="hero-season-chip"><span className="season-chip-icon"><Sprout size={13} /></span><span><small>GROWING SEASON</small><strong>Kharif · Demo</strong></span></div></div>}
        </section>
        {activePage === 'Overview' ? <>
          <section className="metrics-grid"><MetricCard icon={MapPin} label="TOTAL FARM AREA" value="4.4" unit=" acres" trend="8.2%" note="Across 3 active fields" iconTone="mint" /><MetricCard icon={Sprout} label="ACTIVE PLOTS" value="6" unit=" plots" trend="3 crop types" note="Growing across your farm" iconTone="lime" /><MetricCard icon={Droplets} label="SOIL MOISTURE" value="68" unit="%" trend="4.3%" trendTone="negative" note="Last recorded · Sep 22" iconTone="sky" /><MetricCard icon={Activity} label="CROP HEALTH" value="Good" unit="" trend="On track" note="Based on sample observations" iconTone="amber" /></section>
          <section className="overview-grid"><div className="left-column"><section className="panel harvest-panel"><div className="panel-heading"><div><span className="eyebrow">FARM PERFORMANCE</span><h2>Harvest overview</h2></div><button className="select-button">This season <ChevronDown size={15} /></button></div><HarvestChart /></section>
            <section className="panel crops-panel"><div className="panel-heading"><div><span className="eyebrow">IN THE GROUND</span><h2>Your crops <span className="count-badge">{visibleCrops.length}</span></h2></div><button className="text-link" onClick={() => setActivePage('Crop calendar')}>View all <ArrowRight size={15} /></button></div><div className="crop-grid">{visibleCrops.map(crop => <CropCard key={crop.name} crop={crop} onMenu={() => setToast(`${crop.name}: ${crop.stage} · ${crop.days}`)} />)}{visibleCrops.length === 0 && <p className="empty-search">No crops match “{search}”.</p>}</div></section>
          </div><div className="right-column"><WeatherCard /><section className="panel tasks-panel"><div className="panel-heading"><div><span className="eyebrow">STAY ON TRACK</span><h2>Upcoming tasks <span className="count-badge">{tasks.filter(task => !task.done).length}</span></h2></div><button className="icon-button subtle-icon" aria-label="Task options"><Ellipsis size={20} /></button></div><div className="task-list">{tasks.map(task => <TaskItem key={task.id} task={task} toggle={toggleTask} />)}</div><button className="task-add-link" onClick={() => setShowModal(true)}><Plus size={15} /> Add a task to your day</button></section>
            <section className="tip-card"><div className="tip-icon"><Sprout size={19} /></div><div><span className="eyebrow">A LITTLE FIELD NOTE</span><p>Check the underside of your tomato leaves this week. Catching pests early makes all the difference.</p><button onClick={() => setActivePage('Insights')}>Explore crop insights <ArrowRight size={14} /></button></div></section></div></section>
          <footer className="page-foot"><span>🌱 Growing a little better, every day.</span><span>Sample farm workspace · AgriTec</span></footer>
        </> : <><AlternateView page={activePage} crops={visibleCrops} farms={currentUser ? liveFarms : null} onNotice={message => { setToast(message); window.setTimeout(() => setToast(''), 2600) }} /><footer className="page-foot"><span>🌱 Growing a little better, every day.</span><span>Sample farm workspace · AgriTec</span></footer></>}
      </div>
    </main>
    {authOpen && <AuthDialog close={() => setAuthOpen(false)} submit={handleAuth} />}
    {farmOpen && <FarmDialog close={() => setFarmOpen(false)} save={handleCreateFarm} />}
    {cropOpen && <CropDialog farms={liveFarms || []} close={() => setCropOpen(false)} save={handleCreateCrop} />}
    {showModal && <AddTaskDialog close={() => setShowModal(false)} save={addTask} />}
    {toast && <div className="toast-message"><Check size={16} />{toast}</div>}
  </div>
}

export default App
