import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export default function UnknownProductModal() {
  const { unknownModalOpen, setUnknownModalOpen, pendingBarcode, saveUnknown } = useApp();
  const [name, setName] = useState('');
  const [mrp, setMRP] = useState('');
  const [price, setPrice] = useState('');
  const [gst, setGST] = useState('12');
  const [disc, setDisc] = useState('0');
  const nameRef = useRef(null);

  useEffect(() => {
    if (unknownModalOpen) {
      setName(''); setMRP(''); setPrice(''); setGST('12'); setDisc('0');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [unknownModalOpen]);

  function handleSave() {
    saveUnknown(name.trim(), parseFloat(mrp) || 0, parseFloat(price), parseInt(gst), parseFloat(disc) || 0);
  }

  if (!unknownModalOpen) return null;
  return (
    <div className="modal-bg active" onClick={(e) => { if (e.target === e.currentTarget) setUnknownModalOpen(false); }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <h2>Unknown Product</h2>
          <button className="modal-close" onClick={() => setUnknownModalOpen(false)}>&times;</button>
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          <p style={{ fontSize: '.85rem', color: 'var(--text-light)', marginBottom: 16 }}>
            Barcode <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, fontSize: '.9rem' }}>{pendingBarcode}</code> not found. Add to inventory &amp; bill.
          </p>
          <div className="form-group">
            <label>Product Name *</label>
            <input type="text" ref={nameRef} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fresh Milk 1L" />
          </div>
          <div className="form-row-4">
            <div className="form-group"><label>MRP (₹)</label><input type="number" value={mrp} onChange={e => setMRP(e.target.value)} placeholder="0.00" step="0.01" /></div>
            <div className="form-group"><label>Shop Price (₹) *</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" step="0.01" /></div>
            <div className="form-group"><label>GST %</label>
              <select value={gst} onChange={e => setGST(e.target.value)}>
                <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
              </select>
            </div>
            <div className="form-group"><label>Discount (₹)</label><input type="number" value={disc} onChange={e => setDisc(e.target.value)} placeholder="0" step="0.01" /></div>
          </div>
          <button className="btn btn-primary btn-block" onClick={handleSave}>Save to Inventory &amp; Add to Bill</button>
        </div>
      </div>
    </div>
  );
}
