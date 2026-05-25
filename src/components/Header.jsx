import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export default function Header() {
  const { settings, sessionId, getCurrentTime, fmtTime, fmtDate, setSettingsModalOpen, timeState } = useApp();
  const [now, setNow] = useState(getCurrentTime());

  useEffect(() => {
    const tick = setInterval(() => setNow(getCurrentTime()), 1000);
    return () => clearInterval(tick);
  }, [getCurrentTime]);

  const srcLabel = timeState.source === 'internet' ? 'Internet NTP' : timeState.source === 'manual' ? 'Manual Input' : 'System Default';

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-wrap" title="Open Settings" onClick={() => setSettingsModalOpen(true)}>
          {settings.logoDataUrl ? (
            <img src={settings.logoDataUrl} alt="logo" />
          ) : (
            <svg viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          )}
        </div>
        <div>
          <div className="shop-title">{settings.name}</div>
          <div className="shop-sub">{settings.address}</div>
        </div>
      </div>
      <div className="header-right">
        <div className="session-id">{sessionId}</div>
        <span className="badge-live">LIVE</span>
        <div className="time-box">
          <div className="t">{fmtTime(now)}</div>
          <div className="d">{fmtDate(now)}</div>
          <div style={{ fontSize: '.65rem', color: 'var(--text-light)' }}>{srcLabel}</div>
        </div>
        <button className="btn-icon" onClick={() => setSettingsModalOpen(true)} title="Settings (Ctrl+S)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
      </div>
    </header>
  );
}
