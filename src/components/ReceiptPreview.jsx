import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function ReceiptPreview() {
  const {
    session, settings, billSettings, sessionId,
    getCurrentTime, fmtTime, fmtDate,
    printAndSave, exportCSV, newSession, totals
  } = useApp();

  const { sub, gst, disc, qty, grand } = totals;

  return (
    <>
      <div className="total-card">
        <div className="total-label">Total Payable</div>
        <div className="total-value">₹{grand.toFixed(2)}</div>
        <div className="total-row">
          <span>Items: <b>{session.length}</b></span>
          <span>Qty: <b>{qty}</b></span>
        </div>
        {billSettings.showSubtotal && (
          <div className="total-row"><span>Subtotal</span><span>₹{sub.toFixed(2)}</span></div>
        )}
        {billSettings.showTotalGST && (
          <div className="total-row"><span>GST</span><span>₹{gst.toFixed(2)}</span></div>
        )}
        {billSettings.showTotalDiscount && (
          <div className="total-row"><span>Discount</span><span>₹{disc.toFixed(2)}</span></div>
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Receipt Preview
        </div>
        <div className="receipt-box">
          <div className="receipt-head">
            <h4>{settings.name}</h4>
            <div>{settings.address}</div>
            <div>{fmtDate(getCurrentTime())} {fmtTime(getCurrentTime())}</div>
          </div>
          {!session.length ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '10px 0' }}>No items scanned</div>
          ) : (
            <>
              <div>
                {session.map((it, i) => {
                  const b = it.price * it.qty;
                  const d = (it.discount || 0) * it.qty;
                  const a = b - d;
                  const g = a * (it.gst / 100);
                  let line = `${it.name} x${it.qty}`;
                  if (billSettings.showPrice) line += ` @ ₹${it.price.toFixed(2)}`;
                  if (billSettings.showOffer && it.discount) line += ` (-₹${d.toFixed(2)})`;
                  return (
                    <div key={i} className="receipt-line">
                      <span>{line}</span>
                      <span>₹{(a + g).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="receipt-total">
                {billSettings.showSubtotal && (
                  <div className="receipt-line"><span>Subtotal</span><span>₹{sub.toFixed(2)}</span></div>
                )}
                {billSettings.showTotalGST && (
                  <div className="receipt-line"><span>GST</span><span>₹{gst.toFixed(2)}</span></div>
                )}
                {billSettings.showTotalDiscount && disc > 0 && (
                  <div className="receipt-line"><span>Discount</span><span>₹{disc.toFixed(2)}</span></div>
                )}
                {billSettings.showGrandTotal && (
                  <div className="receipt-line" style={{ fontSize: '1.05rem', marginTop: 4 }}>
                    <span><b>TOTAL</b></span>
                    <span><b>₹{grand.toFixed(2)}</b></span>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="receipt-foot">
            Thank you for shopping!<br />
            {settings.gstin ? <span>GSTIN: {settings.gstin}</span> : null}
            {settings.gstin && settings.fssai ? <br /> : null}
            {settings.fssai ? <span>FSSAI: {settings.fssai}</span> : null}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={printAndSave}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Bill & Save Session (Enter)
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="btn btn-success btn-block" onClick={() => exportCSV()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export CSV
          </button>
          <button className="btn btn-ghost btn-block" onClick={newSession}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            New Session
          </button>
        </div>
      </div>
    </>
  );
}
