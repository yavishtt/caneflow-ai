import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Panel, PlotPicker, PlotSummary, Shell } from '../components';
import { useFarm } from '../context';
import { durationText, generateAdvisory, languages, type Language, type Reading } from '../domain/advisory';
import { updateReading } from '../domain/store';

export const actionNames = { irrigate: 'Irrigation recommended', defer: 'Awaiting power window', rain: 'Rainfall expected · skip irrigation', adequate: 'Moisture adequate · no irrigation', saturated: 'Saturation warning · no irrigation', blocked: 'Recommendation withheld' };
export const scenarios: { title: string; patch: Partial<Reading> }[] = [
  { title: 'Low moisture', patch: { moisture: 15, previousMoisture: 18 } },
  { title: 'Adequate', patch: { moisture: 50, previousMoisture: 48 } },
  { title: 'Saturated', patch: { moisture: 85, previousMoisture: 80 } },
  { title: 'Rain expected', patch: { moisture: 15, rainfall: 40, previousMoisture: 18 } },
  { title: 'No power', patch: { moisture: 15, powerHours: 0, previousMoisture: 18 } },
  { title: 'Sensor offline', patch: { ageHours: 24 } },
  { title: 'Noisy sensor', patch: { moisture: 95, previousMoisture: 20 } },
  { title: 'Weather failure', patch: { weatherAvailable: false } },
];
const baseline: Reading = { moisture: 15, rainfall: 0, powerHours: 8, ageHours: 0, previousMoisture: null, weatherAvailable: true };
export function ReadingEditor({ reading, onApply }: { reading: Reading; onApply: (r: Reading) => void }) {
  const [draft, setDraft] = useState(reading);
  const numeric = (key: keyof Reading, text: string) => setDraft(d => ({ ...d, [key]: text === '' ? null : Number(text) }));
  function submit(e: FormEvent) { e.preventDefault(); onApply(draft); }
  return <form onSubmit={submit} className="reading-editor"><div className="chips wrap">{scenarios.map(s => <button type="button" key={s.title} onClick={() => { const r = { ...baseline, ...s.patch }; setDraft(r); onApply(r); }}>{s.title}</button>)}</div><div className="form-grid">{[['moisture', 'Soil moisture (%)'], ['rainfall', 'Forecast rainfall (mm / 24 h)'], ['powerHours', 'Power availability (h / day)'], ['ageHours', 'Hours since last reading'], ['previousMoisture', 'Previous soil moisture (%)']].map(([key, label]) => <label key={key}>{label}<input type="number" step="any" aria-label={label} value={(draft[key as keyof Reading] as number | null) ?? ''} onChange={e => numeric(key as keyof Reading, e.target.value)} placeholder="Missing" /></label>)}<label className="checkbox-label"><input type="checkbox" checked={draft.weatherAvailable} onChange={e => setDraft(d => ({ ...d, weatherAvailable: e.target.checked }))} /> Weather service available</label></div><Button variant="primary" type="submit">Generate advisory</Button></form>;
}
export function AdvisoryLab() {
  const { state, user, setState, language, setLanguage, notify } = useFarm();
  const [reading, setReading] = useState<Reading>(baseline); const [plotId, setPlotId] = useState('SC-14');
  const result = generateAdvisory(reading, language); const plot = state.plots.find(p => p.id === plotId)!;
  return <Shell title="Irrigation test lab" subtitle="Experiment 7 · Explore boundary values, decision rules and failure conditions"><div className="lab-intro"><Badge>Experiment 7</Badge><h2>From input to explainable advice.</h2><p>Try a scenario or enter readings to see the recommendation change. These are the numeric rules from your black-box testing experiment.</p></div><div className="lab-grid"><Panel title="Field inputs" eyebrow="Interactive scenario"><ReadingEditor reading={reading} onApply={setReading} /></Panel><Panel title={actionNames[result.action]} eyebrow="Recommendation"><div className={`advisory-output ${!result.valid ? 'red' : result.action === 'irrigate' ? 'green' : 'amber'}`} role="status"><strong>{result.message}</strong>{result.durationMinutes > 0 && <p>{durationText(result.durationMinutes, language)}</p>}<small>Next evaluation: {result.nextCycle}</small></div><label className="language-select">Advisory language<select value={language} onChange={e => setLanguage(e.target.value as Language)}>{languages.map(l => <option key={l}>{l}</option>)}</select></label>{result.alerts.map(a => <div key={a} className="notice amber">{a}</div>)}{result.recipients.length > 0 && <small>Alert recipients: {result.recipients.join(', ')} (in-app demo)</small>}<div className="summary-grid"><div><small>Duration</small><strong>{result.durationMinutes} min</strong></div><div><small>Application</small><strong>{result.applicationMm} mm</strong></div><div><small>Water stress estimate</small><strong>{result.valid ? `${result.waterStress}%` : 'Unavailable'}</strong></div><div><small>Delay loss estimate</small><strong>{result.valid ? `${result.yieldLoss}%` : 'Unavailable'}</strong></div></div><small>Duration, stress and yield estimates use documented demo formulas, not a trained AI model.</small></Panel></div><Panel title="Apply this scenario to a plot" eyebrow="Connected demonstration"><div className="row wrap between"><PlotPicker value={plotId} onChange={setPlotId} /><Button variant="primary" disabled={!['agronomist', 'supervisor'].includes(user.role)} onClick={() => { try { setState(updateReading(state, user, plotId, reading)); notify(`Scenario applied to ${plotId}. Review the updated advisory.`); } catch (e) { notify((e as Error).message); } }}>Apply to selected plot</Button></div><PlotSummary plot={plot} /><div className="row wrap"><Link to="/agronomist">Review as agronomist →</Link><Link to="/farmer">Open farmer view →</Link><Link to="/audit">View audit trail →</Link></div></Panel><div className="notice muted"><strong>Experiment rules</strong><p>Moisture: 0–100%; low below 30%, adequate 30–70%, high above 70%. Significant rainfall begins at 10 mm. Power availability: 0–24 hours. Missing, invalid, stale or noisy data withholds a recommendation.</p></div></Shell>;
}
