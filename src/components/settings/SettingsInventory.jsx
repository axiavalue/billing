import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function SettingsInventory() {
  const { products, addInventoryItem, deleteProduct, clearInventory, exportInventoryCSV, importInventoryCSV } = useApp();
  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [mrp, setMRP] = useState('');
  const [price, setPrice] = useState('');
  const [gst, setGST] = useState('12');
  const [stock, setStock] = useState('100');
  const [disc, setDisc] = useState('0');

  const list = Object.entries(products).filter(([bc, p]) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || bc.includes(search)
  );

  function handleAdd() {
    addInventoryItem(code.trim(), name.trim(), parseFloat(mrp) || 0, parseFloat(price), parseInt(gst), parseInt(stock) || 0, parseFloat(disc) || 0);
    setCode(''); setName(''); setMRP(''); setPrice(''); setGST('12'); setStock('100'); setDisc('0');
  }

  return (
    <div className="settings-section active">
      <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Inventory Management</h3>
      <div className="inv-toolbar">
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-success" onClick={() => document.getElementById('importFile').click()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Import CSV
        </button>
        <input type="file" id="importFile" accept=".csv" style={{ display: 'none' }} onChange={e => { importInventoryCSV(e.target.files[0]); e.target.value = ''; }} />
        <button className="btn btn-primary" onClick={exportInventoryCSV}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Export CSV
        </button>
        <button className="btn btn-danger" onClick={clearInventory}>Clear All</button>
      </div>
      <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 10, marginBottom: 12 }}>
        <h4 style={{ fontSize: '.9rem', marginBottom: 10 }}>Add New Product</h4>
        <div className="form-row-4">
          <div className="form-group" style={{ marginBottom: 0 }}><label>Barcode</label><input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Barcode" /></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label>Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Product name" /></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label>MRP (₹)</label><input type="number" value={mrp} onChange={e => setMRP(e.target.value)} placeholder="0.00" step="0.01" /></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label>Shop Price (₹)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" step="0.01" /></div>
        </div>
        <div className="form-row-4" style={{ marginTop: 10 }}>
          <div className="form-group" style={{ marginBottom: 0 }}><label>GST %</label>
            <select value={gst} onChange={e => setGST(e.target.value)}>
              <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}><label>Stock Qty</label><input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" /></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label>Discount (₹)</label><input type="number" value={disc} onChange={e => setDisc(e.target.value)} placeholder="0" step="0.01" /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}><button className="btn btn-success btn-block" onClick={handleAdd}>Add Product</button></div>
        </div>
      </div>
      <div className="inv-table-wrap">
        <table>
          <thead><tr><th>Barcode</th><th>Name</th><th>MRP</th><th>Price</th><th>GST</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {!list.length ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)' }}>No products found</td></tr>
            ) : (
              list.map(([bc, p]) => (
                <tr key={bc}>
                  <td><code>{bc}</code></td>
                  <td>{p.name}</td>
                  <td>₹{(p.mrp || p.price).toFixed(2)}</td>
                  <td>₹{p.price.toFixed(2)}</td>
                  <td>{p.gst}%</td>
                  <td>{p.stock || 0}</td>
                  <td>
                    <button className="del-btn" onClick={() => deleteProduct(bc)} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
