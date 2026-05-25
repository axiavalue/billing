import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const filters = [
  { id: 'all', label: 'All Sessions' },
  { id: 'hour', label: 'Last Hour' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
  { id: 'session', label: 'Select Session' },
];

export default function SettingsData() {
  const { allSessions, currentFilter, setCurrentFilter, exportFilteredData, importInventoryCSV, importHistoryCSV } = useApp();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [checkedIds, setCheckedIds] = useState(new Set());

  function toggleSession(id) {
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCheckedIds(next);
  }

  function handleExport() {
    exportFilteredData(currentFilter, fromDate, toDate, Array.from(checkedIds));
  }

  return (
    <div className="settings-section active">
      <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Data Transfer &amp; Reports</h3>
      <div className="device-card">
        <h4>Export Billing Data</h4>
        <p style={{ fontSize: '.85rem', color: 'var(--text-light)', marginBottom: 12 }}>Choose filter criteria for your export. Exports all matching sessions as CSV.</p>
        <div className="filter-grid">
          {filters.map(f => (
            <div key={f.id} className={`filter-chip${currentFilter === f.id ? ' active' : ''}`} onClick={() => setCurrentFilter(f.id)}>{f.label}</div>
          ))}
        </div>
        <div className={`date-range${currentFilter === 'custom' ? ' active' : ''}`}>
          <div className="form-group"><label>From Date</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
          <div className="form-group"><label>To Date</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
        </div>
        {currentFilter === 'session' && (
          <div className="session-list">
            <div style={{ fontSize: '.8rem', color: 'var(--text-light)', marginBottom: 6 }}>Select sessions to export:</div>
            {!allSessions.length ? (
              <div style={{ padding: 10, color: 'var(--text-light)', fontSize: '.85rem' }}>No saved sessions yet</div>
            ) : (
              [...allSessions].reverse().map(s => (
                <div key={s.id} className="session-item" onClick={() => toggleSession(s.id)}>
                  <input type="checkbox" checked={checkedIds.has(s.id)} onChange={() => toggleSession(s.id)} onClick={e => e.stopPropagation()} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.id}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-light)' }}>{s.items.length} items &bull; {new Date(s.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn btn-success btn-block" onClick={handleExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export Filtered CSV
          </button>
        </div>
      </div>
      <div className="device-card" style={{ marginTop: 12 }}>
        <h4>Import Data</h4>
        <p style={{ fontSize: '.85rem', color: 'var(--text-light)', marginBottom: 12 }}>Import products or billing history from CSV. Format: barcode,name,mrp,price,gst,stock</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => document.getElementById('importProductsFile').click()}>Import Products</button>
          <input type="file" id="importProductsFile" accept=".csv" style={{ display: 'none' }} onChange={e => { importInventoryCSV(e.target.files[0]); e.target.value = ''; }} />
          <button className="btn btn-ghost" onClick={() => document.getElementById('importHistoryFile').click()}>Import History</button>
          <input type="file" id="importHistoryFile" accept=".csv" style={{ display: 'none' }} onChange={e => { importHistoryCSV(); e.target.value = ''; }} />
        </div>
      </div>
    </div>
  );
}
