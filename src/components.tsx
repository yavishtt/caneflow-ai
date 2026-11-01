import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import assets from './assets.json';
import { useFarm } from './context';
import { canAccess, openPlot, type Plot } from './domain/store';
import type { Role } from './domain/advisory';

export type Screen = keyof typeof assets;
export function asset(screen: Screen, name: string) { const p = (assets[screen] as Record<string, string>)[name]; return p ? `${import.meta.env.BASE_URL}${p.slice(1)}` : undefined; }
export function Icon({ name, screen = 'landing', className = '' }: { name: string; screen?: Screen; className?: string }) { return <span className={`icon ${className}`} aria-hidden="true"><img src={asset(screen, name)} alt="" /></span>; }
export function Badge({ children, tone = 'green', screen = 'landing', icon }: { children: ReactNode; tone?: string; screen?: Screen; icon?: string }) { const icons = assets[screen] as Record<string, string>; const candidate = tone === 'amber' ? 'imgIndicator2' : tone === 'blue' ? 'imgIndicator1' : 'imgIndicator'; const chosen = icon || (icons[candidate] ? candidate : icons.imgIndicator ? 'imgIndicator' : 'imgMarker'); return <span className={`badge ${tone}`}><Icon screen={screen} name={chosen} />{children}</span>; }
export function Brand({ subtitle = 'IRRIGATION ADVISORY SYSTEM', compact = false, screen = 'landing' }: { subtitle?: string; compact?: boolean; screen?: Screen }) { return <Link className="brand" to="/" aria-label="CaneFlow AI home"><span className="brand-mark"><Icon name="imgSprout" screen={screen} /></span>{!compact && <span>CaneFlow AI<small>{subtitle}</small></span>}</Link>; }
export function Button({ children, onClick, variant = '', disabled = false, type = 'button', className = '' }: { children: ReactNode; onClick?: () => void; variant?: string; disabled?: boolean; type?: 'button' | 'submit'; className?: string }) { return <button className={`button ${variant} ${className}`} onClick={onClick} disabled={disabled} type={type}>{children}</button>; }
export function Panel({ title, eyebrow, action, children, className = '' }: { title?: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) { return <section className={`panel ${className}`}>{(title || action) && <div className="panel-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>}{children}</section>; }
export function Metric({ label, value, delta, icon, screen = 'admin', tone = 'green' }: { label: string; value: ReactNode; delta: string; icon?: string; screen?: Screen; tone?: string }) { return <div className="metric"><div className="metric-label">{label}{icon && <span className={`icon-well ${tone}`}><Icon screen={screen} name={icon} /></span>}</div><strong>{value}</strong><small className={`text-${tone}`}>{delta}</small></div>; }
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = dialog.current; d?.showModal(); return () => d?.close(); }, []);
  return <dialog ref={dialog} className="modal" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="panel-heading"><h2>{title}</h2><button className="close-button" aria-label="Close dialog" onClick={onClose}>×</button></div>{children}</dialog>;
}

const nav: Record<Role, [string, string, string][]> = {
  agronomist: [['Overview', 'imgLayoutDashboard', '/agronomist/overview'], ['Decision review', 'imgScanEye', '/agronomist'], ['Crop health', 'imgLeaf', '/agronomist/crop-health'], ['Raw signals', 'imgActivity', '/agronomist/signals'], ['Models', 'imgBrainCircuit', '/agronomist/models'], ['Audit trail', 'imgHistory', '/audit']],
  supervisor: [['Map', 'imgMap', '/supervisor'], ['Alerts', 'imgBell', '/supervisor/alerts'], ['Tasks', 'imgClipboardCheck', '/supervisor/tasks'], ['Sensors', 'imgRadioTower', '/supervisor/sensors'], ['Settings', 'imgSettings', '/settings']],
  admin: [['Factory overview', 'imgLayoutDashboard', '/admin'], ['Regions', 'imgMap', '/admin/regions'], ['Water accounts', 'imgDroplets', '/admin/water'], ['Weather APIs', 'imgCloudSun', '/admin/weather'], ['AI model health', 'imgBrainCircuit', '/admin/models'], ['Integrations', 'imgCable', '/admin/integrations'], ['Users', 'imgUsers', '/admin/users']],
  farmer: [],
};
export function RoleSelect() {
  const { role, setRole } = useFarm(); const navigate = useNavigate();
  return <label className="role-select"><span className="sr-only">Demo role</span><select value={role} onChange={e => { const next = e.target.value as Role; setRole(next); navigate(`/${next}`); }}><option value="farmer">Farmer view</option><option value="supervisor">Supervisor view</option><option value="agronomist">Agronomist view</option><option value="admin">Admin view</option></select></label>;
}
export function Shell({ title, subtitle, children, action }: { title: string; subtitle: string; children: ReactNode; action?: ReactNode }) {
  const { role } = useFarm(); const location = useLocation(); const [notifications, setNotifications] = useState(false);
  const screen = role === 'farmer' ? 'agronomist' : role;
  return <div className={`app-shell ${role === 'supervisor' ? 'compact-shell' : ''}`}>
    <aside className="sidebar"><Brand screen={screen} compact={role === 'supervisor'} subtitle={role === 'admin' ? 'ADMIN OPERATIONS' : 'AGRONOMIST CONSOLE'} /><nav aria-label="Main navigation">{nav[role].map(([name, icon, path]) => <Link key={path} to={path} className={location.pathname === path ? 'active' : ''}><Icon name={icon} screen={screen} /><span>{name}</span></Link>)}</nav><div className="sidebar-status"><Badge screen={screen}>System operational</Badge><small>Last sync · sample data</small></div><Link className="sidebar-bottom" to="/workflow">AI-to-pump workflow ↗</Link></aside>
    <div className="shell-main"><header className="app-header"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions">{action}<RoleSelect /><button className="icon-button" aria-label="Notifications" onClick={() => setNotifications(true)}><Icon screen={screen} name="imgBell" /></button><img className="avatar" src={asset(screen, 'imgAvatar')} alt="Demo profile" /></div></header><div className="demo-strip"><span><i /> Lab demonstration · simulated field data</span><Link to="/lab">Experiment 7 · Test lab ↗</Link></div><main className="dashboard">{children}</main></div>
    {notifications && <Modal title="Field notifications" onClose={() => setNotifications(false)}><Notifications /><Link to="/supervisor/alerts" onClick={() => setNotifications(false)} className="button">View all alerts</Link></Modal>}
  </div>;
}
export function Notifications() {
  const { state, user } = useFarm();
  const visible = state.plots.filter(p => canAccess(user, p));
  return <div className="stack">{visible.some(p => p.id === 'SC-09') && <div className="notice red"><Icon screen="supervisor" name="imgTriangleAlert1" /><div><strong>Pressure Drop</strong><small>Plot SC-09 · Mainline 2.1 → 1.2 bar · sample</small></div></div>}<div className="notice red"><Icon screen="supervisor" name="imgTriangleAlert1" /><div><strong>Filter Backwash Triggered</strong><small>Station F-03 · Inspection requested · sample</small></div></div>{visible.filter(p => p.reading.ageHours >= 24).map(p => <div key={p.id} className="notice amber"><strong>{p.id}: communication failure</strong><small>Last reading is 24+ hours old. Farmer and supervisor alerted.</small></div>)}</div>;
}
export function PlotPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { state, user } = useFarm(); return <label className="plot-picker">Plot <select aria-label="Select plot" value={value} onChange={e => onChange(e.target.value)}>{state.plots.filter(p => canAccess(user, p)).map(p => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}</select></label>;
}
export function FieldMap({ compact = false, onSelect, label = 'STEPS live boundary layer' }: { compact?: boolean; onSelect?: (id: string) => void; label?: string }) {
  const { state, user, setState, notify } = useFarm(); const [zoom, setZoom] = useState(1); const [filter, setFilter] = useState('All plots'); const [layers, setLayers] = useState(false);
  function select(id: string) { const r = openPlot(state, user, id); if (!r.plot) { setState(r.state); notify('Access denied. This plot is assigned to another user. The attempt was recorded.'); } else { onSelect?.(id); notify(`Selected plot ${id}`); } }
  return <div className={`field-map-container ${compact ? 'compact' : ''}`}>{!compact && <div className="map-toolbar"><div className="chips">{['All plots', 'Irrigating', 'Attention', 'Offline'].map(f => <button className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)} key={f}>{f}</button>)}</div><Button onClick={() => setLayers(!layers)}><Icon screen="supervisor" name="imgLayers" /> Layers</Button></div>}
    <div className="field-map"><div className="map-world" style={{ transform: `scale(${zoom})` }}><div className="canal" /><div className="farm-road" />{(filter === 'All plots' ? ['SC-14', 'SC-09', 'SC-03'] : filter === 'Irrigating' ? ['SC-14'] : filter === 'Attention' ? ['SC-09'] : ['SC-12']).map((id, i) => <button key={id} className={`plot-boundary plot-${i}`} onClick={() => select(id)} aria-label={`Open plot ${id}`}><span className={`map-pin ${i === 1 ? 'amber' : i === 2 ? 'blue' : 'green'}`}><Icon screen="landing" name={i === 1 ? 'imgTriangleAlert' : 'imgDroplets'} /></span><span className="plot-label">{id}</span></button>)}</div><span className="map-label">{label}</span><div className="map-zoom"><button aria-label="Zoom in" onClick={() => setZoom(v => Math.min(2, v + .2))}>+</button><button aria-label="Zoom out" onClick={() => setZoom(v => Math.max(.8, v - .2))}>−</button></div>{layers && <div className="map-layers"><strong>Visible demo layers</strong><label><input type="checkbox" defaultChecked /> Plot boundaries</label><label><input type="checkbox" defaultChecked /> Irrigation status</label><small>Illustrative geofences · no live GIS connection</small></div>}</div>
    {!compact && <div className="map-legend">{[['imgMarker', 'Irrigating'], ['imgMarker1', 'Needs inspection'], ['imgMarker2', 'Critical'], ['imgMarker3', 'Scheduled']].map(([icon, label]) => <span key={label}><Icon screen="supervisor" name={icon} />{label}</span>)}</div>}
  </div>;
}
export function PlotSummary({ plot }: { plot: Plot }) { return <div className="summary-grid"><div><small>Soil moisture</small><strong>{plot.reading.moisture ?? '—'}%</strong></div><div><small>Rain · next 24h</small><strong>{plot.reading.rainfall ?? '—'} mm</strong></div><div><small>Power available</small><strong>{plot.reading.powerHours ?? '—'} h</strong></div><div><small>Crop stage</small><strong>{plot.stage}</strong></div></div>; }
export function downloadFile(filename: string, data: string, type = 'text/plain') { const url = URL.createObjectURL(new Blob([data], { type })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
