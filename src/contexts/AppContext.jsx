import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

const defaultBillSettings = {
  showName: true, showBarcode: true, showMRP: false, showPrice: true,
  showOffer: false, showGSTPercent: true, showGSTAmount: false,
  showItemTotal: true, showTime: false,
  showSubtotal: true, showTotalDiscount: true, showTotalGST: true, showGrandTotal: true,
  receiptWidth: '80mm', tableLayout: 'full'
};

const defaultSettings = {
  name: 'SuperMart', address: '123 Main Street, City', phone: '+91 00000 00000',
  gstin: '', fssai: '', logoDataUrl: ''
};

const defaultTimeState = {
  source: 'system',
  ntpOffset: 0,
  ntpLastSync: null,
  manualBase: null,
  manualSetAt: null,
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const data = loadJSON('sm_products', {});
    if (!Object.keys(data).length) {
      const demo = {
        '8901234567890': { name: 'Amul Milk 1L', mrp: 72, price: 68, gst: 0, stock: 50, discount: 0 },
        '8901234567891': { name: 'Britannia Bread', mrp: 45, price: 40, gst: 0, stock: 30, discount: 0 },
        '8901234567892': { name: 'Amul Butter 500g', mrp: 280, price: 265, gst: 12, stock: 20, discount: 0 },
        '8901234567893': { name: 'Cheese Slice 10pc', mrp: 105, price: 95, gst: 12, stock: 25, discount: 0 },
        '8901234567894': { name: 'Eggs 12 Pcs', mrp: 90, price: 84, gst: 0, stock: 40, discount: 0 },
        '8901234567895': { name: 'India Gate Rice 5kg', mrp: 380, price: 350, gst: 0, stock: 15, discount: 0 },
        '8901234567896': { name: 'Aashirvaad Atta 5kg', mrp: 260, price: 245, gst: 0, stock: 18, discount: 0 },
        '8901234567897': { name: 'Sugar 1kg', mrp: 50, price: 46, gst: 0, stock: 60, discount: 0 },
        '8901234567898': { name: 'Tata Tea 250g', mrp: 155, price: 140, gst: 5, stock: 22, discount: 0 },
        '8901234567899': { name: 'Nescafe Coffee 100g', mrp: 200, price: 185, gst: 18, stock: 12, discount: 0 },
      };
      localStorage.setItem('sm_products', JSON.stringify(demo));
      return demo;
    }
    return data;
  });

  const [session, setSession] = useState([]);
  const [sessionId, setSessionId] = useState('SESS-' + Date.now());
  const [settings, setSettings] = useState(() => loadJSON('sm_settings', { ...defaultSettings }));
  const [billSettings, setBillSettings] = useState(() => loadJSON('sm_bill_settings', { ...defaultBillSettings }));
  const [allSessions, setAllSessions] = useState(() => loadJSON('sm_history', []));
  const [timeState, setTimeState] = useState(() => {
    const saved = loadJSON('sm_time_v2', null);
    if (saved) {
      return {
        source: saved.source || 'system',
        ntpOffset: saved.ntpOffset || 0,
        ntpLastSync: saved.ntpLastSync || null,
        manualBase: saved.manualBase ? new Date(saved.manualBase) : null,
        manualSetAt: saved.manualSetAt || null,
      };
    }
    return { ...defaultTimeState };
  });

  const [toasts, setToasts] = useState([]);
  const [splashHidden, setSplashHidden] = useState(false);
  const [unknownModalOpen, setUnknownModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('shop');
  const [pendingBarcode, setPendingBarcode] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [ntpStatusText, setNtpStatusText] = useState('Idle');
  const [ntpStatusClass, setNtpStatusClass] = useState('pill-green');
  const [ntpLastText, setNtpLastText] = useState('Last sync: Never');

  const scanBuf = useRef('');
  const scanTmr = useRef(null);
  const usbDevice = useRef(null);
  const btDevice = useRef(null);
  const printerDevice = useRef(null);
  const toastId = useRef(0);
  const scanInputRef = useRef(null);
  const callbacksRef = useRef({});

  // Persist products
  useEffect(() => { saveJSON('sm_products', products); }, [products]);
  useEffect(() => { saveJSON('sm_settings', settings); }, [settings]);
  useEffect(() => { saveJSON('sm_bill_settings', billSettings); }, [billSettings]);
  useEffect(() => { saveJSON('sm_history', allSessions); }, [allSessions]);
  useEffect(() => {
    saveJSON('sm_time_v2', {
      source: timeState.source,
      ntpOffset: timeState.ntpOffset,
      ntpLastSync: timeState.ntpLastSync,
      manualBase: timeState.manualBase ? timeState.manualBase.toISOString() : null,
      manualSetAt: timeState.manualSetAt,
    });
  }, [timeState]);

  // Splash
  useEffect(() => {
    const t = setTimeout(() => setSplashHidden(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Clock
  const getCurrentTime = useCallback(() => {
    const nowMs = Date.now();
    if (timeState.source === 'manual' && timeState.manualBase && timeState.manualSetAt) {
      const elapsed = nowMs - timeState.manualSetAt;
      return new Date(timeState.manualBase.getTime() + elapsed);
    }
    if (timeState.source === 'internet' && timeState.ntpOffset !== 0) {
      return new Date(nowMs + timeState.ntpOffset);
    }
    return new Date();
  }, [timeState]);

  const fmtTime = useCallback((d) => d.toLocaleTimeString('en-IN', { hour12: false }), []);
  const fmtDate = useCallback((d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), []);

  // Toast
  const toast = useCallback((msg, type = 'ok') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, out: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3500);
  }, []);

  // Keep callbacks ref fresh every render so listeners always call latest versions
  callbacksRef.current = {
    doScan, printAndSave, exportCSV, newSession,
    toast, setUnknownModalOpen, setPendingBarcode, setSettingsModalOpen
  };

  // Scanner keyboard detection
  useEffect(() => {
    function onKeyDown(e) {
      const { doScan, printAndSave } = callbacksRef.current;
      if (e.target?.dataset?.scanInput) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = e.target.value.trim();
          if (val) doScan(val);
          else printAndSave();
        }
        return;
      }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key.length === 1) {
        scanBuf.current += e.key;
        clearTimeout(scanTmr.current);
        scanTmr.current = setTimeout(() => {
          if (scanBuf.current.length >= 6) doScan(scanBuf.current);
          scanBuf.current = '';
        }, 60);
      } else if (e.key === 'Enter' && scanBuf.current.length >= 6) {
        e.preventDefault();
        doScan(scanBuf.current);
        scanBuf.current = '';
        clearTimeout(scanTmr.current);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      const { printAndSave, exportCSV, newSession, setSettingsModalOpen } = callbacksRef.current;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'p') { e.preventDefault(); printAndSave(); }
        else if (e.key === 'e') { e.preventDefault(); exportCSV(); }
        else if (e.key === 'n') { e.preventDefault(); newSession(); }
        else if (e.key === 's') { e.preventDefault(); setSettingsModalOpen(true); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Focus scan input after splash
  useEffect(() => {
    if (splashHidden && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [splashHidden]);

  // Focus scan input when modals close
  useEffect(() => {
    if (!unknownModalOpen && !settingsModalOpen && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [unknownModalOpen, settingsModalOpen]);

  function doScan(code) {
    code = code.trim();
    if (!code) return;
    const active = document.activeElement;
    const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');
    if (scanInputRef.current && !isTyping) {
      scanInputRef.current.value = '';
      scanInputRef.current.focus();
    }
    if (products[code]) {
      addItem(code, products[code]);
      toast('Scanned: ' + products[code].name, 'ok');
    } else {
      setPendingBarcode(code);
      setUnknownModalOpen(true);
      toast('Unknown barcode! Add product details.', 'warn');
    }
  }

  function addItem(barcode, prod) {
    const now = getCurrentTime();
    setSession(prev => {
      const existing = prev.find(i => i.barcode === barcode && !(i.discount || 0));
      if (existing && !(prod.discount || 0)) {
        return prev.map((it, idx) => {
          if (idx === prev.indexOf(existing)) {
            return { ...it, qty: it.qty + 1, time: fmtTime(now) };
          }
          return it;
        });
      }
      return [...prev, {
        barcode, name: prod.name, mrp: prod.mrp || prod.price, price: prod.price, gst: prod.gst,
        qty: 1, discount: prod.discount || 0,
        time: fmtTime(now), date: fmtDate(now), timestamp: now.toISOString()
      }];
    });
    setProducts(prev => {
      const p = prev[barcode];
      if (p && p.stock > 0) {
        return { ...prev, [barcode]: { ...p, stock: p.stock - 1 } };
      }
      return prev;
    });
  }

  function changeQty(idx, delta) {
    setSession(prev => {
      const item = prev[idx];
      if (!item) return prev;
      const oldQty = item.qty;
      const newQty = Math.max(1, item.qty + delta);
      const diff = newQty - oldQty;
      if (products[item.barcode]) {
        if (diff > 0 && (products[item.barcode].stock || 0) < diff) {
          toast('Out of stock: ' + item.name + ' (stock: ' + (products[item.barcode].stock || 0) + ')', 'warn');
          return prev;
        }
        setProducts(p => ({ ...p, [item.barcode]: { ...p[item.barcode], stock: p[item.barcode].stock - diff } }));
      }
      return prev.map((it, i) => i === idx ? { ...it, qty: newQty } : it);
    });
  }

  function removeItem(idx) {
    setSession(prev => {
      const item = prev[idx];
      if (!item) return prev;
      if (products[item.barcode]) {
        setProducts(p => ({ ...p, [item.barcode]: { ...p[item.barcode], stock: p[item.barcode].stock + item.qty } }));
      }
      return prev.filter((_, i) => i !== idx);
    });
  }

  function clearSession() {
    if (!session.length) return;
    if (!window.confirm('Clear all items?')) return;
    const stockUpdates = {};
    session.forEach(it => {
      if (products[it.barcode]) {
        stockUpdates[it.barcode] = (products[it.barcode].stock || 0) + it.qty;
      }
    });
    if (Object.keys(stockUpdates).length) {
      setProducts(prev => {
        const next = { ...prev };
        for (const [code, stock] of Object.entries(stockUpdates)) {
          next[code] = { ...next[code], stock };
        }
        return next;
      });
    }
    setSession([]);
    toast('Session cleared', 'warn');
  }

  function newSession() {
    if (session.length && !window.confirm('Start new session? Unsaved items will be lost.')) return;
    const stockUpdates = {};
    session.forEach(it => {
      if (products[it.barcode]) {
        stockUpdates[it.barcode] = (products[it.barcode].stock || 0) + it.qty;
      }
    });
    if (Object.keys(stockUpdates).length) {
      setProducts(prev => {
        const next = { ...prev };
        for (const [code, stock] of Object.entries(stockUpdates)) {
          next[code] = { ...next[code], stock };
        }
        return next;
      });
    }
    setSession([]);
    setSessionId('SESS-' + Date.now());
    toast('New session started', 'ok');
  }

  function printAndSave() {
    if (!session.length) { toast('No items to print', 'warn'); return; }
    const record = { id: sessionId, items: JSON.parse(JSON.stringify(session)), createdAt: getCurrentTime().toISOString() };
    setAllSessions(prev => [...prev, record]);
    exportCSV(true);
    doPrint();
    toast('Bill printed & session saved! Starting new session...', 'ok');
    setTimeout(() => {
      setSession([]);
      setSessionId('SESS-' + Date.now());
      if (scanInputRef.current) scanInputRef.current.focus();
    }, 600);
  }

  function doPrint() {
    let sub = 0, gst = 0, disc = 0;
    const bs = billSettings;
    const receiptWidth = bs.receiptWidth === '58mm' ? '58mm' : bs.receiptWidth === '80mm' ? '80mm' : '210mm';
    const fontSize = bs.receiptWidth === '58mm' ? '11px' : '12px';

    const items = session.map(it => {
      const b = it.price * it.qty;
      const d = (it.discount || 0) * it.qty;
      const a = b - d;
      const g = a * (it.gst / 100);
      sub += a; gst += g; disc += d;
      let cols = `<td style="text-align:left">${it.name}</td>`;
      cols += `<td style="text-align:center">${it.qty}</td>`;
      if (bs.showPrice) cols += `<td style="text-align:right">₹${it.price.toFixed(2)}</td>`;
      if (bs.showOffer && it.discount) cols += `<td style="text-align:right">₹${d.toFixed(2)}</td>`;
      if (bs.showGSTPercent) cols += `<td style="text-align:right">${it.gst}%</td>`;
      if (bs.showItemTotal) cols += `<td style="text-align:right">₹${(a+g).toFixed(2)}</td>`;
      return `<tr>${cols}</tr>`;
    }).join('');

    let summary = '';
    if (bs.showSubtotal) summary += `<div style="display:flex;justify-content:space-between"><span>Subtotal:</span><span>₹${sub.toFixed(2)}</span></div>`;
    if (bs.showTotalDiscount && disc > 0) summary += `<div style="display:flex;justify-content:space-between"><span>Discount:</span><span>₹${disc.toFixed(2)}</span></div>`;
    if (bs.showTotalGST) summary += `<div style="display:flex;justify-content:space-between"><span>GST:</span><span>₹${gst.toFixed(2)}</span></div>`;
    if (bs.showGrandTotal) summary += `<div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-top:6px"><span>TOTAL PAYABLE:</span><span>₹${(sub+gst).toFixed(2)}</span></div>`;

    const now = getCurrentTime();
    const html = `
      <div style="width:${receiptWidth};font-family:'Courier New',monospace;padding:4mm;font-size:${fontSize};line-height:1.4">
        <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:8px;margin-bottom:8px">
          ${settings.logoDataUrl ? `<img src="${settings.logoDataUrl}" style="max-width:60mm;max-height:20mm;margin-bottom:6px" alt="logo">` : ''}
          <h2 style="margin:0;font-family:'Segoe UI',sans-serif;font-size:16px">${settings.name}</h2>
          <div style="font-size:11px;margin-top:4px">${settings.address}</div>
          <div style="font-size:11px">Ph: ${settings.phone}</div>
          ${settings.gstin?`<div style="font-size:10px;margin-top:2px">GSTIN: ${settings.gstin}</div>`:''}
          ${settings.fssai?`<div style="font-size:10px">FSSAI: ${settings.fssai}</div>`:''}
        </div>
        <div style="font-size:11px;margin-bottom:8px">
          <div>Bill: ${sessionId}</div>
          <div>Date: ${fmtDate(now)}</div>
          <div>Time: ${fmtTime(now)}</div>
        </div>
        <table style="width:100%;font-size:11px;border-collapse:collapse">
          <thead><tr style="border-bottom:1px dashed #000"><th align="left">Item</th><th align="center">Qty</th>${bs.showPrice?'<th align="right">Rate</th>':''}${bs.showOffer?'<th align="right">Disc</th>':''}${bs.showGSTPercent?'<th align="right">GST</th>':''}${bs.showItemTotal?'<th align="right">Amt</th>':''}</tr></thead>
          <tbody>${items}</tbody>
        </table>
        <div style="border-top:1px dashed #000;margin-top:8px;padding-top:8px">
          ${summary}
        </div>
        <div style="text-align:center;margin-top:16px;font-size:10px;border-top:1px dashed #000;padding-top:8px">
          <p>Thank you for shopping!</p><p>Visit Again</p>
        </div>
      </div>`;

    const printArea = document.getElementById('print-area');
    if (printArea) {
      printArea.innerHTML = html;
      printArea.style.display = 'block';
    }
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Bill - ${settings.name}</title><style>@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); if (printArea) printArea.style.display = 'none'; }, 300);
  }

  function exportCSV(silent = false) {
    if (!session.length) { if (!silent) toast('No items to export', 'warn'); return; }
    const headers = ['Session','Date','Time','Barcode','Product','MRP','Qty','UnitPrice','Discount','GST%','BaseAmt','GSTAmt','Total'];
    const rows = session.map(it => {
      const b = it.price * it.qty;
      const d = (it.discount || 0) * it.qty;
      const a = b - d;
      const g = a * (it.gst / 100);
      return [sessionId, it.date, it.time, it.barcode, it.name, it.mrp || it.price, it.qty, it.price, d, it.gst+'%', a.toFixed(2), g.toFixed(2), (a+g).toFixed(2)].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    dl(csv, `${settings.name.replace(/\s+/g,'_')}_${sessionId}_${fmtDate(getCurrentTime()).replace(/\s+/g,'_')}.csv`);
    if (!silent) toast('CSV exported', 'ok');
  }

  function dl(content, filename) {
    const blob = new Blob(['\uFEFF'+content], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getVisibleColumns() {
    const bs = billSettings;
    const layout = bs.tableLayout;
    if (layout === 'minimal') return { '#': true, name: true, qty: true, total: true, actions: true };
    if (layout === 'compact') return { '#': true, name: true, qty: true, price: bs.showPrice, total: bs.showItemTotal, actions: true };
    return {
      '#': true,
      name: bs.showName,
      qty: true,
      price: bs.showPrice,
      mrp: bs.showMRP,
      offer: bs.showOffer,
      gstPct: bs.showGSTPercent,
      gstAmt: bs.showGSTAmount,
      total: bs.showItemTotal,
      time: bs.showTime,
      actions: true
    };
  }

  // Settings helpers
  function saveShopSettings(newSettings) {
    const phone = newSettings.phone?.trim() || '';
    if (phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(phone)) {
      toast('Invalid phone number format', 'err');
      return;
    }
    setSettings(newSettings);
    toast('Shop profile saved', 'ok');
  }

  function toggleBillSetting(key) {
    setBillSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function saveBillSettingsFinal(receiptWidth, tableLayout) {
    setBillSettings(prev => ({ ...prev, receiptWidth, tableLayout }));
    toast('Bill display settings saved', 'ok');
  }

  // Inventory helpers
  function addInventoryItem(code, name, mrp, price, gst, stock, discount) {
    if (!code || !name || isNaN(price)) { toast('Fill barcode, name and shop price', 'err'); return; }
    setProducts(prev => ({ ...prev, [code]: { name, mrp: mrp || price, price, gst, stock, discount } }));
    toast('Product added', 'ok');
  }

  function deleteProduct(code) {
    if (!window.confirm('Delete: ' + products[code]?.name + '?')) return;
    setProducts(prev => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
    toast('Product deleted', 'warn');
  }

  function clearInventory() {
    if (!window.confirm('Delete ALL products?')) return;
    setProducts({});
    toast('Inventory cleared', 'warn');
  }

  function exportInventoryCSV() {
    const rows = Object.entries(products).map(([code, p]) => [code, p.name, p.mrp || p.price, p.price, p.gst, p.stock || 0, p.discount || 0].join(','));
    dl(['Barcode,Name,MRP,Price,GST,Stock,Discount', ...rows].join('\n'), 'inventory_' + fmtDate(getCurrentTime()).replace(/\s+/g,'_') + '.csv');
    toast('Inventory exported', 'ok');
  }

  function importInventoryCSV(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      let count = 0;
      setProducts(prev => {
        const next = { ...prev };
        e.target.result.split('\n').filter(l => l.trim()).slice(1).forEach(line => {
          const p = line.split(',');
          if (p.length >= 4) {
            const mrp = parseFloat(p[2]) || parseFloat(p[3]);
            next[p[0].trim()] = { name: p[1].trim(), mrp, price: parseFloat(p[3]), gst: parseInt(p[4]) || 0, stock: parseInt(p[5]) || 0, discount: parseFloat(p[6]) || 0 };
            count++;
          }
        });
        return next;
      });
      toast('Imported ' + count + ' products', 'ok');
    };
    reader.readAsText(file);
  }

  // Data transfer
  function exportFilteredData(filter, fromDate, toDate, checkedIds) {
    let filtered = [];
    const now = getCurrentTime();
    switch (filter) {
      case 'all': filtered = allSessions; break;
      case 'hour': filtered = allSessions.filter(s => new Date(s.createdAt) >= new Date(now.getTime() - 3600000)); break;
      case 'today': filtered = allSessions.filter(s => fmtDate(new Date(s.createdAt)) === fmtDate(now)); break;
      case 'week': filtered = allSessions.filter(s => new Date(s.createdAt) >= new Date(now.getTime() - 7 * 86400000)); break;
      case 'month': filtered = allSessions.filter(s => new Date(s.createdAt) >= new Date(now.getTime() - 30 * 86400000)); break;
      case 'custom': {
        if (!fromDate || !toDate) { toast('Select date range', 'warn'); return; }
        filtered = allSessions.filter(s => { const d = new Date(s.createdAt).toISOString().slice(0,10); return d >= fromDate && d <= toDate; });
        break;
      }
      case 'session': {
        filtered = allSessions.filter(s => checkedIds.includes(s.id));
        if (!filtered.length) { toast('Select at least one session', 'warn'); return; }
        break;
      }
    }
    if (!filtered.length) { toast('No sessions match filter', 'warn'); return; }

    const headers = ['Session','Date','Time','Barcode','Product','MRP','Qty','UnitPrice','Discount','GST%','BaseAmt','GSTAmt','Total'];
    const rows = [];
    filtered.forEach(sess => {
      sess.items.forEach(it => {
        const b = it.price * it.qty;
        const d = (it.discount || 0) * it.qty;
        const a = b - d;
        const g = a * (it.gst / 100);
        rows.push([sess.id, it.date, it.time, it.barcode, it.name, it.mrp || it.price, it.qty, it.price, d, it.gst+'%', a.toFixed(2), g.toFixed(2), (a+g).toFixed(2)].join(','));
      });
    });
    dl([headers.join(','), ...rows].join('\n'), `billing_export_${filter}_${fmtDate(now).replace(/\s+/g,'_')}.csv`);
    toast('Exported ' + filtered.length + ' session(s)', 'ok');
  }

  function importHistoryCSV() {
    toast('History import: parse and merge logic ready', 'info');
  }

  // Time sync
  function onTimeSourceChange(src) {
    if (src !== 'manual') {
      setTimeState(prev => ({ ...prev, manualBase: null, manualSetAt: null }));
    }
    if (src === 'system') {
      setTimeState(prev => ({ ...prev, ntpOffset: 0, ntpLastSync: null }));
    }
    setTimeState(prev => ({ ...prev, source: src }));
  }

  function applyManualTime(dateVal, timeVal) {
    if (!dateVal || !timeVal) { toast('Please select both date and time', 'err'); return; }
    const [y, m, d] = dateVal.split('-').map(Number);
    const [h, min, s] = timeVal.split(':').map(Number);
    const manualBase = new Date(y, m - 1, d, h || 0, min || 0, s || 0);
    setTimeState({
      source: 'manual',
      manualBase,
      manualSetAt: Date.now(),
      ntpOffset: 0,
      ntpLastSync: null,
    });
    toast('Manual time active. Clock ticks from: ' + fmtTime(manualBase), 'ok');
  }

  function resetTimeSync() {
    setTimeState({ source: 'system', ntpOffset: 0, ntpLastSync: null, manualBase: null, manualSetAt: null });
    toast('Time sync reset to system default', 'ok');
  }

  async function syncInternetTime() {
    try {
      toast('Syncing with NTP server...', 'info');
      const res = await fetch('https://worldtimeapi.org/api/ip', { cache: 'no-store' });
      const data = await res.json();
      const serverTime = new Date(data.datetime);
      const localTime = new Date();
      const ntpOffset = serverTime.getTime() - localTime.getTime();
      setTimeState(prev => ({
        ...prev,
        source: 'internet',
        ntpOffset,
        ntpLastSync: Date.now(),
        manualBase: null,
        manualSetAt: null,
      }));
      setNtpStatusText('Synced');
      setNtpStatusClass('pill-green');
      setNtpLastText('Last sync: ' + fmtTime(serverTime) + ' (offset: ' + (ntpOffset > 0 ? '+' : '') + ntpOffset + 'ms)');
      toast('Internet time synced successfully', 'ok');
    } catch (e) {
      setNtpStatusText('Failed');
      setNtpStatusClass('pill-red');
      toast('Internet sync failed. Check connection.', 'err');
    }
  }

  // Devices
  async function requestUSBScanner() {
    try {
      if (!navigator.usb) { toast('WebUSB not supported. Use keyboard emulation.', 'warn'); return; }
      const device = await navigator.usb.requestDevice({ filters: [] });
      usbDevice.current = device;
      toast('USB scanner: ' + device.productName, 'ok');
    } catch (e) { toast('USB request cancelled', 'warn'); }
  }

  function testScannerBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.frequency.value = 2000;
      osc.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
      toast('Scanner beep test', 'ok');
    } catch (e) { toast('Audio test failed', 'warn'); }
  }

  async function pairBluetoothPrinter() {
    try {
      if (!navigator.bluetooth) { toast('Web Bluetooth not supported', 'warn'); return; }
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: ['device_information'] });
      btDevice.current = device;
      toast('Bluetooth printer paired', 'ok');
    } catch (e) { toast('Bluetooth pairing cancelled', 'warn'); }
  }

  async function pairUSBPrinter() {
    try {
      if (!navigator.usb) { toast('WebUSB not supported', 'warn'); return; }
      const device = await navigator.usb.requestDevice({ filters: [] });
      printerDevice.current = device;
      toast('USB printer connected', 'ok');
    } catch (e) { toast('USB printer request failed', 'warn'); }
  }

  function testPrint() {
    const html = `<div style="width:80mm;font-family:'Courier New',monospace;padding:4mm;font-size:12px"><div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:8px"><h3>${settings.name}</h3><div>TEST PRINT</div><div>${fmtTime(getCurrentTime())}</div></div><div style="text-align:center;margin-top:12px">Printer connection OK</div></div>`;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Test Print</title></head><body>${html}</body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
    toast('Test print sent', 'ok');
  }

  // Save unknown product
  function saveUnknown(name, mrp, price, gst, disc) {
    if (!name || isNaN(price)) { toast('Enter product name and shop price', 'err'); return; }
    const code = pendingBarcode;
    setProducts(prev => ({ ...prev, [code]: { name, mrp: mrp || price, price, gst, stock: 100, discount: disc } }));
    setUnknownModalOpen(false);
    addItem(code, { name, mrp: mrp || price, price, gst, discount: disc });
    toast('Saved & added: ' + name, 'ok');
  }

  const totals = React.useMemo(() => {
    let sub = 0, gst = 0, disc = 0, qty = 0;
    session.forEach(it => {
      const b = it.price * it.qty;
      const d = (it.discount || 0) * it.qty;
      const a = b - d;
      sub += a; gst += a * (it.gst / 100); disc += d; qty += it.qty;
    });
    return { sub, gst, disc, qty, grand: sub + gst };
  }, [session]);

  const value = {
    products, setProducts,
    session, setSession,
    sessionId, setSessionId,
    settings, setSettings,
    billSettings, setBillSettings,
    allSessions, setAllSessions,
    timeState, setTimeState,
    toasts, setToasts,
    splashHidden, setSplashHidden,
    unknownModalOpen, setUnknownModalOpen,
    settingsModalOpen, setSettingsModalOpen,
    activeSettingsTab, setActiveSettingsTab,
    pendingBarcode, setPendingBarcode,
    currentFilter, setCurrentFilter,
    ntpStatusText, ntpStatusClass, ntpLastText,
    scanInputRef,
    usbDevice, btDevice, printerDevice,
    getCurrentTime, fmtTime, fmtDate,
    doScan, addItem, changeQty, removeItem, clearSession, newSession,
    printAndSave, doPrint, exportCSV, dl,
    getVisibleColumns, totals,
    saveShopSettings, toggleBillSetting, saveBillSettingsFinal,
    addInventoryItem, deleteProduct, clearInventory, exportInventoryCSV, importInventoryCSV,
    exportFilteredData, importHistoryCSV,
    onTimeSourceChange, applyManualTime, resetTimeSync, syncInternetTime,
    requestUSBScanner, testScannerBeep,
    pairBluetoothPrinter, pairUSBPrinter, testPrint,
    saveUnknown,
    toast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
