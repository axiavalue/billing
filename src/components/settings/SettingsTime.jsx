import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function SettingsTime() {
  const {
    timeState, getCurrentTime, fmtTime, fmtDate,
    onTimeSourceChange, applyManualTime, resetTimeSync, syncInternetTime,
    ntpStatusText, ntpStatusClass, ntpLastText
  } = useApp();
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');

  const now = getCurrentTime();
  const src = timeState.source || 'system';

  return (
    <div className="settings-section active">
      <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Time Synchronization</h3>
      <div className="device-card">
        <h4>Current System Time</h4>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtTime(now)}</div>
        <div style={{ fontSize: '.85rem', color: 'var(--text-light)', marginTop: 4 }}>{fmtDate(now)}</div>
        <div style={{ fontSize: '.8rem', color: 'var(--text-light)', marginTop: 4 }}>
          Source: {src === 'internet' ? 'Internet NTP' : src === 'manual' ? 'Manual Input' : 'System Default'}
        </div>
      </div>

      <label style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: 10, display: 'block' }}>Select Time Source</label>
      <div className="time-source">
        <label><input type="radio" name="timeSource" value="system" checked={src === 'system'} onChange={() => onTimeSourceChange('system')} /> System Default (Device Clock)</label>
        <label><input type="radio" name="timeSource" value="internet" checked={src === 'internet'} onChange={() => onTimeSourceChange('internet')} /> Internet NTP Server</label>
        <label><input type="radio" name="timeSource" value="manual" checked={src === 'manual'} onChange={() => onTimeSourceChange('manual')} /> Manual Input</label>
      </div>

      <div className={`manual-time${src === 'manual' ? ' active' : ''}`}>
        <div className="form-row">
          <div className="form-group"><label>Date</label><input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} /></div>
          <div className="form-group"><label>Time</label><input type="time" value={manualTime} onChange={e => setManualTime(e.target.value)} step="1" /></div>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => applyManualTime(manualDate, manualTime)}>Apply Manual Time</button>
        <p style={{ fontSize: '.8rem', color: 'var(--text-light)', marginTop: 8 }}>Manual time disables all auto-sync. The clock will tick forward from your entered value using the system timer.</p>
      </div>

      {src !== 'manual' && (
        <div className="device-card">
          <h4>Internet NTP Sync</h4>
          <div className="device-status">
            <span className={`pill ${ntpStatusClass}`}>{ntpStatusText}</span>
            <span>{ntpLastText}</span>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: '.85rem', padding: '6px 12px' }} onClick={syncInternetTime}>Sync Now</button>
        </div>
      )}

      <button className="btn btn-danger btn-block" style={{ marginTop: 10 }} onClick={resetTimeSync}>Reset to System Default</button>
    </div>
  );
}
