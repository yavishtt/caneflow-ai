import { useEffect, type ReactNode } from 'react';
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { FarmProvider, useFarm } from './context';
import { Landing } from './pages/Landing';
import { Agronomist } from './pages/Agronomist';
import { Farmer } from './pages/Farmer';
import { Supervisor } from './pages/Supervisor';
import { Admin } from './pages/Admin';
import { Workflow } from './pages/Workflow';
import { AdvisoryLab } from './pages/AdvisoryLab';
import { AuditTrail, Settings } from './pages/Utility';
import type { Role } from './domain/advisory';

function RoleRoute({ role, children }: { role: Role; children: ReactNode }) { const { setRole } = useFarm(); useEffect(() => setRole(role), [role]); return children; }
function ScrollReset() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); document.querySelector('main')?.setAttribute('tabindex', '-1'); }, [pathname]); return null; }
export default function App() {
  return <HashRouter><FarmProvider><ScrollReset /><a className="skip-link" href="#root" onClick={e => { e.preventDefault(); document.querySelector('main')?.focus(); }}>Skip to content</a><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/agronomist/*" element={<RoleRoute role="agronomist"><Agronomist /></RoleRoute>} />
    <Route path="/farmer/*" element={<RoleRoute role="farmer"><Farmer /></RoleRoute>} />
    <Route path="/supervisor/*" element={<RoleRoute role="supervisor"><Supervisor /></RoleRoute>} />
    <Route path="/admin/*" element={<RoleRoute role="admin"><Admin /></RoleRoute>} />
    <Route path="/workflow" element={<Workflow />} /><Route path="/lab" element={<AdvisoryLab />} />
    <Route path="/audit" element={<AuditTrail />} /><Route path="/settings" element={<Settings />} />
    <Route path="*" element={<main className="empty-state"><h1>This field path doesn’t exist.</h1><Link to="/" className="button primary">Back to CaneFlow</Link></main>} />
  </Routes></FarmProvider></HashRouter>;
}
