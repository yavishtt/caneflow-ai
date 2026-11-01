import { generateAdvisory, type Advisory, type Language, type Reading, type Role } from './advisory';

export interface Plot { id: string; name: string; ownerId: string; supervisorId: string; area: number; stage: string; reading: Reading; }
export interface Audit { id: string; at: string; actor: string; action: string; plotId?: string; detail: string; }
export interface Decision { plotId: string; durationMinutes: number; reason: string; approved: boolean; overridden: boolean; }
export interface Inspection { id: string; title: string; plotId: string; priority: string; assignee: string; done: boolean; }
export interface FarmState { plots: Plot[]; decisions: Record<string, Decision>; pumps: Record<string, boolean>; audit: Audit[]; tasks: Inspection[]; feedback: { plotId: string; text: string; at: string }[]; }
export interface User { id: string; name: string; role: Role; }
export const users: Record<Role, User> = {
  farmer: { id: 'farmer-1', name: 'FarmerXYZ', role: 'farmer' },
  supervisor: { id: 'supervisor-1', name: 'Ravi K.', role: 'supervisor' },
  agronomist: { id: 'agronomist-1', name: 'Dr. Meera P.', role: 'agronomist' },
  admin: { id: 'admin-1', name: 'Factory Administrator', role: 'admin' },
};
export const defaultReading: Reading = { moisture: 16, rainfall: 0.4, powerHours: 8, ageHours: 0.03, previousMoisture: 18, weatherAvailable: true };
export function initialState(): FarmState {
  return {
    plots: [
      { id: 'SC-14', name: 'North cane field', ownerId: 'farmer-1', supervisorId: 'supervisor-1', area: 2.4, stage: 'Ratoon', reading: { ...defaultReading } },
      { id: 'SC-03', name: 'Canal-side field', ownerId: 'farmer-1', supervisorId: 'supervisor-1', area: 1.8, stage: 'Grand growth', reading: { ...defaultReading, moisture: 50, previousMoisture: 48 } },
      { id: 'SC-09', name: 'East cane field', ownerId: 'farmer-2', supervisorId: 'supervisor-1', area: 3.1, stage: 'Tillering', reading: { ...defaultReading, moisture: 85, previousMoisture: 80 } },
      { id: 'SC-12', name: 'South cane field', ownerId: 'farmer-3', supervisorId: 'supervisor-2', area: 2.2, stage: 'Ratoon', reading: { ...defaultReading, ageHours: 24 } },
    ], decisions: {}, pumps: {}, audit: [], feedback: [],
    tasks: [
      { id: 'task-1', title: 'Check moisture node S-28', plotId: 'SC-14', priority: 'High', assignee: 'Ravi K.', done: false },
      { id: 'task-2', title: 'Inspect gateway GW-04', plotId: 'SC-03', priority: 'High', assignee: 'Unassigned', done: false },
      { id: 'task-3', title: 'Verify flow meter FM-11', plotId: 'SC-03', priority: 'Medium', assignee: 'Meera P.', done: false },
    ],
  };
}
export function audit(state: FarmState, user: User, action: string, detail: string, plotId?: string): FarmState {
  return { ...state, audit: [{ id: crypto.randomUUID(), at: new Date().toISOString(), actor: user.name, action, detail, plotId }, ...state.audit] };
}
export function canAccess(user: User, plot: Plot): boolean {
  return user.role === 'agronomist' || user.role === 'admin' || (user.role === 'farmer' ? user.id === plot.ownerId : user.id === plot.supervisorId);
}
export function openPlot(state: FarmState, user: User, plotId: string): { state: FarmState; plot: Plot | null } {
  const plot = state.plots.find(p => p.id === plotId);
  if (!plot || !canAccess(user, plot)) return { state: audit(state, user, 'Access denied', 'Attempted to open an unassigned plot.', plotId), plot: null };
  return { state, plot };
}
export function advisoryFor(state: FarmState, plot: Plot, language: Language): Advisory {
  const result = generateAdvisory(plot.reading, language);
  const decision = state.decisions[plot.id];
  if (decision?.approved && result.action === 'irrigate') {
    return { ...result, durationMinutes: decision.durationMinutes, applicationMm: Math.round(decision.durationMinutes * 18 / 42 * 10) / 10 };
  }
  return result;
}
export function approve(state: FarmState, user: User, plotId: string, durationMinutes: number, reason: string, overridden: boolean): FarmState {
  const plot = state.plots.find(p => p.id === plotId);
  if (user.role !== 'agronomist' || !plot || !canAccess(user, plot)) throw new Error('Only an agronomist can validate or override an advisory.');
  const result = generateAdvisory(plot.reading);
  if (!result.valid) throw new Error('Resolve data alerts before validating this recommendation.');
  if (overridden && !reason.trim()) throw new Error('A reason is required for a manual override.');
  if (result.action === 'irrigate' && (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > plot.reading.powerHours! * 60)) throw new Error('Duration must be positive and fit within the available power window.');
  const decisions = { ...state.decisions, [plotId]: { plotId, durationMinutes: result.action === 'irrigate' ? durationMinutes : 0, reason: reason.trim(), approved: true, overridden } };
  return audit({ ...state, decisions }, user, overridden ? 'Manual override' : 'Advisory validated', `${durationMinutes} minutes. ${reason.trim() || 'Evidence reviewed and approved.'}`, plotId);
}
export function updateReading(state: FarmState, user: User, plotId: string, reading: Reading): FarmState {
  if (user.role !== 'agronomist' && user.role !== 'supervisor') throw new Error('Only field staff can update demo readings.');
  const plot = state.plots.find(p => p.id === plotId);
  if (!plot || !canAccess(user, plot)) throw new Error('Access denied.');
  const decisions = { ...state.decisions }; delete decisions[plotId];
  return audit({ ...state, plots: state.plots.map(p => p.id === plotId ? { ...p, reading } : p), decisions, pumps: { ...state.pumps, [plotId]: false } }, user, 'Readings updated', 'New inputs invalidate previous approval and stop the simulated pump.', plotId);
}
export function controlPump(state: FarmState, user: User, plotId: string, running: boolean): FarmState {
  const plot = state.plots.find(p => p.id === plotId);
  if (!plot || !canAccess(user, plot) || user.role !== 'farmer') throw new Error('Only the assigned farmer can control this pump.');
  const result = advisoryFor(state, plot, 'English');
  if (running && (!state.decisions[plotId]?.approved || result.action !== 'irrigate')) throw new Error('A valid, agronomist-approved irrigation schedule is required before starting the pump.');
  return audit({ ...state, pumps: { ...state.pumps, [plotId]: running } }, user, running ? 'Pump started' : 'Pump stopped', running ? 'Demo command acknowledged. Pump P-04 is running.' : 'Demo pump stopped by farmer.', plotId);
}
export const STORAGE_KEY = 'caneflow-lab-v1';
export function loadState(): FarmState {
  try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); if (s?.plots?.length && s.decisions && s.pumps && Array.isArray(s.audit) && Array.isArray(s.tasks) && Array.isArray(s.feedback)) return s; } catch { /* A clean demo is safe when local storage is unavailable. */ }
  return initialState();
}
export function saveState(state: FarmState) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; } }
