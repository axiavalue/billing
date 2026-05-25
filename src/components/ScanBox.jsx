import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function ScanBox() {
  const { scanInputRef, doScan } = useApp();

  return (
    <div className="card">
      <div className="card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8"/></svg>
        Barcode Scanner
      </div>
      <div className="scan-wrap">
        <input
          type="text"
          className="scan-input"
          ref={scanInputRef}
          data-scan-input="true"
          placeholder="Scan barcode or type & press Enter..."
          autoComplete="off"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const val = e.target.value.trim();
              if (val) doScan(val);
            }
          }}
        />
        <svg className="scan-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8"/></svg>
      </div>
      <div className="scan-meta">
        <span className="dot"></span>
        <span>USB Scanner: Keyboard Emulation Ready</span>
        <span style={{ marginLeft: 'auto' }}>Mode: Keyboard Emulation</span>
      </div>
    </div>
  );
}
