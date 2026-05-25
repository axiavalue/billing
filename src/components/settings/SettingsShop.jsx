import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function SettingsShop() {
  const { settings, saveShopSettings } = useApp();
  const [name, setName] = useState(settings.name);
  const [addr, setAddr] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [gstin, setGstin] = useState(settings.gstin);
  const [fssai, setFssai] = useState(settings.fssai);
  const [logoPreview, setLogoPreview] = useState(settings.logoDataUrl || '');
  const fileRef = useRef(null);

  useEffect(() => {
    setName(settings.name);
    setAddr(settings.address);
    setPhone(settings.phone);
    setGstin(settings.gstin);
    setFssai(settings.fssai);
    setLogoPreview(settings.logoDataUrl || '');
  }, [settings]);

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    saveShopSettings({
      ...settings,
      name: name || 'SuperMart',
      address: addr,
      phone,
      gstin,
      fssai,
      logoDataUrl: logoPreview,
    });
  }

  return (
    <div className="settings-section active">
      <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Shop Profile</h3>
      <div className="form-group">
        <label>Shop Logo</label>
        <div className={`logo-upload${logoPreview ? ' has-img' : ''}`} onClick={() => fileRef.current?.click()}>
          {!logoPreview && (
            <div className="upload-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Click to upload logo</span>
              <span style={{ fontSize: '.75rem' }}>PNG, JPG, SVG</span>
            </div>
          )}
          {logoPreview && <img src={logoPreview} alt="preview" />}
        </div>
        <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
      </div>
      <div className="form-row">
        <div className="form-group"><label>Shop Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="form-group"><label>Phone</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} /></div>
      </div>
      <div className="form-group"><label>Address</label><textarea value={addr} onChange={e => setAddr(e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label>GSTIN</label><input type="text" value={gstin} onChange={e => setGstin(e.target.value)} /></div>
        <div className="form-group"><label>FSSAI License</label><input type="text" value={fssai} onChange={e => setFssai(e.target.value)} /></div>
      </div>
      <button className="btn btn-primary btn-block" onClick={handleSave}>Save Shop Profile</button>
    </div>
  );
}
