import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function SessionTable() {
  const { session, billSettings, changeQty, removeItem, clearSession, getVisibleColumns } = useApp();
  const cols = getVisibleColumns();

  const renderHeaders = () => {
    const headers = [];
    if (cols['#']) headers.push('#');
    if (cols.name) headers.push('Product');
    if (cols.qty) headers.push('Qty');
    if (cols.mrp) headers.push('MRP');
    if (cols.price) headers.push('Rate');
    if (cols.offer) headers.push('Disc');
    if (cols.gstPct) headers.push('GST');
    if (cols.gstAmt) headers.push('GST Amt');
    if (cols.total) headers.push('Total');
    if (cols.time) headers.push('Time');
    if (cols.actions) headers.push('');
    return headers.map((h, i) => <th key={i}>{h}</th>);
  };

  const colCount = Object.values(cols).filter(Boolean).length || 9;

  return (
    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="card-title" style={{ margin: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Session Items
        </div>
        <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '.8rem' }} onClick={clearSession}>Clear All</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr>{renderHeaders()}</tr></thead>
          <tbody>
            {!session.length ? (
              <tr>
                <td colSpan={colCount}>
                  <div className="empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <p>Scan a barcode to start billing</p>
                  </div>
                </td>
              </tr>
            ) : (
              session.map((it, i) => {
                const base = it.price * it.qty;
                const disc = (it.discount || 0) * it.qty;
                const afterDisc = base - disc;
                const gstAmt = afterDisc * (it.gst / 100);
                const total = afterDisc + gstAmt;
                return (
                  <tr key={`${it.barcode}-${i}`} className="flash">
                    {cols['#'] && <td>{i + 1}</td>}
                    {cols.name && (
                      <td>
                        <b>{it.name}</b>
                        {billSettings.showBarcode && <br />}
                        {billSettings.showBarcode && <small style={{ color: 'var(--text-light)' }}>{it.barcode}</small>}
                      </td>
                    )}
                    {cols.qty && (
                      <td>
                        <div className="qty-box">
                          <button className="qty-btn" onClick={() => changeQty(i, -1)}>−</button>
                          <span className="qty-val">{it.qty}</span>
                          <button className="qty-btn" onClick={() => changeQty(i, 1)}>+</button>
                        </div>
                      </td>
                    )}
                    {cols.mrp && <td>₹{(it.mrp || it.price).toFixed(2)}</td>}
                    {cols.price && <td>₹{it.price.toFixed(2)}</td>}
                    {cols.offer && <td>{disc > 0 ? '₹' + disc.toFixed(2) : '—'}</td>}
                    {cols.gstPct && <td>{it.gst}%</td>}
                    {cols.gstAmt && <td>₹{gstAmt.toFixed(2)}</td>}
                    {cols.total && <td><b>₹{total.toFixed(2)}</b></td>}
                    {cols.time && <td className="timestamp">{it.time}</td>}
                    {cols.actions && (
                      <td>
                        <button className="del-btn" onClick={() => removeItem(i)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
