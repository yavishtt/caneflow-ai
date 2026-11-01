import { describe, expect, it } from 'vitest';
import { generateAdvisory, languages, type Action, type Reading } from '../domain/advisory';
import { advisoryFor, approve, initialState, openPlot, users } from '../domain/store';

const base: Reading = { moisture: 15, rainfall: 0, powerHours: 8, ageHours: 0, previousMoisture: null, weatherAvailable: true };
type Case = [id: string, inputs: Partial<Reading>, action: Action];
const ecps: Case[] = [
  ['ECP-01', { moisture: -5 }, 'blocked'], ['ECP-02', { moisture: 15 }, 'irrigate'],
  ['ECP-03', { moisture: 50 }, 'adequate'], ['ECP-04', { moisture: 85 }, 'saturated'],
  ['ECP-05', { moisture: 120 }, 'blocked'], ['ECP-06', { moisture: null }, 'blocked'],
  ['ECP-07', { rainfall: -3 }, 'blocked'], ['ECP-08', { rainfall: 5 }, 'irrigate'],
  ['ECP-09', { rainfall: 40 }, 'rain'], ['ECP-10', { rainfall: 500 }, 'blocked'],
];
const bvas: Case[] = [
  ['BVA-01', { moisture: -1 }, 'blocked'], ['BVA-02', { moisture: 0 }, 'irrigate'],
  ['BVA-03', { moisture: 1 }, 'irrigate'], ['BVA-04', { moisture: 29 }, 'irrigate'],
  ['BVA-05', { moisture: 30 }, 'adequate'], ['BVA-06', { moisture: 31 }, 'adequate'],
  ['BVA-07', { moisture: 70 }, 'adequate'], ['BVA-08', { moisture: 71 }, 'saturated'],
  ['BVA-09', { moisture: 100 }, 'saturated'], ['BVA-10', { moisture: 101 }, 'blocked'],
  ['BVA-11', { rainfall: -1 }, 'blocked'], ['BVA-12', { rainfall: 0 }, 'irrigate'],
  ['BVA-13', { rainfall: 9 }, 'irrigate'], ['BVA-14', { rainfall: 10 }, 'rain'],
  ['BVA-15', { rainfall: 200 }, 'rain'], ['BVA-16', { rainfall: 201 }, 'blocked'],
  ['BVA-17', { powerHours: -1 }, 'blocked'], ['BVA-18', { powerHours: 0 }, 'defer'],
  ['BVA-19', { powerHours: 24 }, 'irrigate'], ['BVA-20', { powerHours: 25 }, 'blocked'],
];
const dts: Case[] = [
  ['DT-01', { moisture: 15, rainfall: 0, powerHours: 8 }, 'irrigate'],
  ['DT-02', { moisture: 15, rainfall: 0, powerHours: 0 }, 'defer'],
  ['DT-03', { moisture: 15, rainfall: 40, powerHours: 8 }, 'rain'],
  ['DT-04', { moisture: 15, rainfall: 40, powerHours: 0 }, 'rain'],
  ['DT-05', { moisture: 50, rainfall: 0, powerHours: 8 }, 'adequate'],
  ['DT-06', { moisture: 50, rainfall: 0, powerHours: 0 }, 'adequate'],
  ['DT-07', { moisture: 50, rainfall: 40, powerHours: 8 }, 'rain'],
  ['DT-08', { moisture: 50, rainfall: 40, powerHours: 0 }, 'rain'],
];
function check(input: Partial<Reading>, action: Action) {
  const r = generateAdvisory({ ...base, ...input });
  expect(r.action).toBe(action);
  expect(r.valid).toBe(action !== 'blocked');
  if (action === 'blocked') { expect(r.alerts.length).toBeGreaterThan(0); expect(r.durationMinutes).toBe(0); expect(r.scheduled).toBe(false); }
  if (action === 'irrigate') { expect(r.durationMinutes).toBeGreaterThan(0); expect(r.durationMinutes).toBeLessThanOrEqual((input.powerHours ?? 8) * 60); expect(r.scheduled).toBe(true); }
  if (action === 'adequate') { expect(r.durationMinutes).toBe(0); expect(r.nextCycle).toContain('Next'); }
  if (action === 'saturated') { expect(r.durationMinutes).toBe(0); expect(r.alerts.join(' ')).toMatch(/saturation/i); }
  if (action === 'defer') { expect(r.durationMinutes).toBe(0); expect(r.nextCycle).toContain('power window'); expect(r.recipients).toContain('farmer'); }
  if (action === 'rain') { expect(r.durationMinutes).toBe(0); expect(r.message).toMatch(/rainfall/i); }
}
describe('Experiment 7 · Equivalence Class Partitioning (10 cases)', () => { it.each(ecps)('%s', (_, inputs, action) => check(inputs, action)); });
describe('Experiment 7 · Boundary Value Analysis (20 cases)', () => { it.each(bvas)('%s', (_, inputs, action) => check(inputs, action)); });
describe('Experiment 7 · Decision Table (8 cases)', () => { it.each(dts)('%s', (_, inputs, action) => check(inputs, action)); });
describe('Experiment 7 · Error Guessing (7 cases)', () => {
  it('EG-01 · 24h communication failure alerts farmer and supervisor; old reading is withheld', () => { const r = generateAdvisory({ ...base, ageHours: 24 }); expect(r.action).toBe('blocked'); expect(r.recipients).toEqual(['farmer', 'supervisor']); expect(r.alerts.join(' ')).toMatch(/communication failure.*not current/i); });
  it('EG-02 · sudden jump from 20% to 95% is noisy and withheld', () => { const r = generateAdvisory({ ...base, moisture: 95, previousMoisture: 20 }); expect(r.action).toBe('blocked'); expect(r.alerts.join(' ')).toMatch(/noisy/i); expect(r.durationMinutes).toBe(0); });
  it('EG-03 · weather outage withholds unreliable advice and alerts both roles', () => { const r = generateAdvisory({ ...base, weatherAvailable: false }); expect(r.valid).toBe(false); expect(r.alerts.join(' ')).toMatch(/weather service unavailable/i); expect(r.recipients).toEqual(['farmer', 'supervisor']); });
  it('EG-04 · agronomist duration override is saved, farmer sees it and audit records it', () => { const state = approve(initialState(), users.agronomist, 'SC-14', 60, 'Field inspection confirms additional water demand.', true); expect(state.decisions['SC-14'].durationMinutes).toBe(60); const opened = openPlot(state, users.farmer, 'SC-14'); expect(opened.plot).not.toBeNull(); expect(advisoryFor(state, opened.plot!, 'English').durationMinutes).toBe(60); expect(state.audit[0]).toMatchObject({ action: 'Manual override', plotId: 'SC-14' }); expect(state.audit[0].detail).toContain('Field inspection'); });
  it('EG-05 · same recommendation in English, Kannada, Marathi and Hindi', () => { const outputs = languages.map(l => generateAdvisory(base, l)); expect(new Set(outputs.map(r => r.message)).size).toBe(4); outputs.forEach((r, i) => { expect(r.action).toBe('irrigate'); expect(r.durationMinutes).toBe(45); expect(r.language).toBe(languages[i]); }); expect(outputs[1].message).toMatch(/[\u0C80-\u0CFF]/); expect(outputs[2].message).toMatch(/[\u0900-\u097F]/); expect(outputs[3].message).toMatch(/[\u0900-\u097F]/); });
  it('EG-06 · unsupported language is rejected and supported languages are listed', () => { const r = generateAdvisory(base, 'Tamil'); expect(r.action).toBe('blocked'); expect(r.alerts.join(' ')).toContain('English, Kannada, Marathi, Hindi'); });
  it('EG-07 · another farmer’s plot is denied and access attempt is audited', () => { const r = openPlot(initialState(), users.farmer, 'SC-09'); expect(r.plot).toBeNull(); expect(r.state.audit[0]).toMatchObject({ action: 'Access denied', plotId: 'SC-09', actor: 'FarmerXYZ' }); });
});
