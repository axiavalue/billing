import React from 'react';
import { useApp } from '../../contexts/AppContext';

export default function SettingsDevices() {
  const { requestUSBScanner, testScannerBeep, pairBluetoothPrinter, pairUSBPrinter, testPrint } = useApp();

  return (
    <div className="settings-section active">
      <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Device Management</h3>
      <div className="device-card">
        <h4>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>
          USB Barcode Scanner
        </h4>
        <div className="device-status"><span className="pill">Keyboard Emulation</span><span>Detects via keystroke pattern</span></div>
        <p style={{ fontSize: '.8rem', color: 'var(--text-light)', marginBottom: 10 }}>Most USB scanners act as keyboards. The app auto-detects rapid input sequences. For native USB HID access, use the button below (requires browser permission).</p>
        <button className="btn btn-primary" onClick={requestUSBScanner}>Request USB Access</button>
        <button className="btn btn-ghost" onClick={testScannerBeep} style={{ marginLeft: 8 }}>Test Beep</button>
      </div>
      <div className="device-card">
        <h4>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M6.5 17h11M6 20v-2a6 6 0 0112 0v2"/><path d="M9 7a3 3 0 116 0 3 3 0 01-6 0z"/><path d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2"/></svg>
          Receipt Printer
        </h4>
        <div className="device-status"><span className="pill pill-yellow">Not Connected</span><span>No printer paired</span></div>
        <p style={{ fontSize: '.8rem', color: 'var(--text-light)', marginBottom: 10 }}>Connect via Bluetooth (Web Bluetooth API) or USB. For thermal ESC/POS printers.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={pairBluetoothPrinter}>Pair Bluetooth Printer</button>
          <button className="btn btn-ghost" onClick={pairUSBPrinter}>Pair USB Printer</button>
          <button className="btn btn-info" onClick={testPrint}>Test Print</button>
        </div>
      </div>
    </div>
  );
}
