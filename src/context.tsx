import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { audit, initialState, loadState, saveState, users, type FarmState, type User } from './domain/store';
import type { Language, Role } from './domain/advisory';

interface Context { state: FarmState; setState: (s: FarmState | ((s: FarmState) => FarmState)) => void; user: User; role: Role; setRole: (role: Role) => void; language: Language; setLanguage: (language: Language) => void; notify: (message: string) => void; reset: () => void; }
const FarmContext = createContext<Context | null>(null);
export function FarmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadState);
  const [role, changeRole] = useState<Role>('agronomist');
  const [language, setLanguage] = useState<Language>('English');
  const [toast, setToast] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { setStorageError(!saveState(state)); }, [state]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 5000); return () => clearTimeout(timer); } }, [toast]);
  useEffect(() => { const yes = () => setOnline(true), no = () => setOnline(false); window.addEventListener('online', yes); window.addEventListener('offline', no); return () => { window.removeEventListener('online', yes); window.removeEventListener('offline', no); }; }, []);
  function setRole(next: Role) { changeRole(next); }
  function reset() { setState(audit(initialState(), users[role], 'Demo reset', 'Restored sample data.')); setToast('Demo reset. All sample data has been restored.'); }
  return <FarmContext.Provider value={{ state, setState, user: users[role], role, setRole, language, setLanguage, notify: setToast, reset }}>
    {!online && <div className="connection-banner" role="status">Offline · locally saved demo data. New live readings are unavailable.</div>}
    {storageError && <div className="connection-banner" role="alert">Browser storage unavailable. Changes will last only for this session.</div>}
    {children}
    {toast && <div className="toast" role="status"><span>✓</span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}>×</button></div>}
  </FarmContext.Provider>;
}
export function useFarm() { const context = useContext(FarmContext); if (!context) throw new Error('Farm provider is required.'); return context; }
