import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const xToggles = [
  { key: 'showName', label: 'Product Name', desc: 'Show product name in table' },
  { key: 'showBarcode', label: 'Barcode', desc: 'Show barcode below product name' },
  { key: 'showMRP', label: 'MRP', desc: 'Maximum retail price column' },
  { key: 'showPrice', label: 'Shop Price (Rate)', desc: 'Your selling price column' },
  { key: 'showOffer', label: 'Offer / Discount', desc: 'Discount amount per item' },
  { key: 'showGSTPercent', label: 'GST %', desc: 'GST rate indicator' },
  { key: 'showGSTAmount', label: 'GST Amount', desc: 'Calculated GST per line' },
  { key: 'showItemTotal', label: 'Item Total', desc: 'Final amount per line' },
  { key: 'showTime', label: 'Timestamp', desc: 'Scan time per item' },
];

const yToggles = [
  { key: 'showSubtotal', label: 'Subtotal', desc: 'Total before GST and discount' },
  { key: 'showTotalDiscount', label: 'Total Discount', desc: 'Sum of all discounts' },
  { key: 'showTotalGST', label: 'Total GST', desc: 'Sum of all GST' },
  { key: 'showGrandTotal', label: 'Final Total (Grand)', desc: 'Total payable amount' },
];

export default function SettingsBill() {
  const { billSettings, toggleBillSetting, saveBillSettingsFinal } = useApp();
  const [receiptWidth, setReceiptWidth] = useState(billSettings.receiptWidth || '80mm');
  const [tableLayout, setTableLayout] = useState(billSettings.tableLayout || 'full');

  function handleSave() {
    saveBillSettingsFinal(receiptWidth, tableLayout);
  }

  return (
    <div className="settings-section active">
      <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Bill Display &amp; Layout</h3>
      <p style={{ fontSize: '.85rem', color: 'var(--text-light)', marginBottom: 16 }}>Choose which fields appear in the billing table (X component) and receipt summary (Y component).</p>

      <div className="device-card">
        <h4>X-Component: Table Columns (Per Item)</h4>
        {xToggles.map(t => (
          <div className="toggle-row" key={t.key}>
            <div><label>{t.label}</label><small>{t.desc}</small></div>
            <div className={`toggle-switch${billSettings[t.key] ? ' on' : ''}`} onClick={() => toggleBillSetting(t.key)}></div>
          </div>
        ))}
      </div>

      <div className="device-card">
        <h4>Y-Component: Receipt Summary</h4>
        {yToggles.map(t => (
          <div className="toggle-row" key={t.key}>
            <div><label>{t.label}</label><small>{t.desc}</small></div>
            <div className={`toggle-switch${billSettings[t.key] ? ' on' : ''}`} onClick={() => toggleBillSetting(t.key)}></div>
          </div>
        ))}
      </div>

      <div className="device-card">
        <h4>Receipt Layout</h4>
        <div className="form-group">
          <label>Receipt Width</label>
          <select value={receiptWidth} onChange={e => setReceiptWidth(e.target.value)}>
            <option value="58mm">58mm (Small Thermal)</option>
            <option value="80mm">80mm (Standard Thermal)</option>
            <option value="A4">A4 / Full Page</option>
          </select>
        </div>
        <div className="form-group">
          <label>Table Layout Mode</label>
          <select value={tableLayout} onChange={e => setTableLayout(e.target.value)}>
            <option value="full">Full (All selected columns)</option>
            <option value="compact">Compact (Name, Qty, Total)</option>
            <option value="minimal">Minimal (Name, Total only)</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={handleSave}>Save Bill Display Settings</button>
    </div>
  );
}
