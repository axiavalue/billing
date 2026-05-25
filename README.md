# SuperMarket Pro — Billing & Inventory System

A fast, offline-ready shop billing app with barcode scanner support, thermal printer connectivity, inventory management, and customizable bill layouts. Built as a single-page web app that can be packaged into a Windows desktop application using Electron.

---

## Features

- **Fast Billing Sessions** — Scan barcodes with any USB scanner (keyboard emulation) or native USB HID. Press Enter to print the bill instantly.
- **Inventory Management** — Add, edit, search, and manage products with barcode, MRP, shop price, GST, stock, and discount.
- **Customizable Bill Display (X & Y Components)**
  - **X-Component (Table Columns):** Choose which columns appear per item — Product Name, Barcode, MRP, Shop Price, Offer/Discount, GST %, GST Amount, Item Total, Timestamp.
  - **Y-Component (Receipt Summary):** Choose which totals appear — Subtotal, Total Discount, Total GST, Final Total.
  - **Layout Modes:** Full, Compact, or Minimal table views.
  - **Receipt Widths:** 58mm, 80mm (thermal), or A4 full page.
- **Shop Branding** — Upload your shop logo and customize shop name, address, phone, GSTIN, and FSSAI from Settings.
- **Time Sync** — System clock, Internet NTP sync, or manual time input.
- **Device Connectivity**
  - **USB Scanner:** Keyboard emulation (auto-detect) or WebUSB native HID.
  - **Printer:** Web Bluetooth, WebUSB, or system print dialog for any connected printer.
- **Data Export/Import** — Export sessions to CSV, import products via CSV, filter by date/session.
- **Offline First** — All data stored in localStorage; works without internet after first load.

---

## Quick Start (Web App)

1. Open `index.html` in any modern browser (Chrome/Edge recommended for best USB/Bluetooth API support).
2. The app loads with 10 demo products. Go to **Settings (Ctrl+S) > Inventory** to add your own products.
3. Start scanning barcodes into the scan box. Unknown barcodes will prompt you to add them.
4. Press **Enter** or click **Print Bill & Save Session** to generate the receipt and start a new session.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + P` | Print Bill & Save Session |
| `Ctrl + E` | Export CSV |
| `Ctrl + N` | New Session |
| `Ctrl + S` | Open Settings |

---

## Convert to Windows Desktop App (Electron)

Follow these steps to turn the web app into a downloadable `.exe` installer or portable Windows app.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- Windows PC for building the Windows target

### Step 1: Install Dependencies

Open a terminal in the project folder (where `package.json` is located) and run:

```bash
npm install
```

This installs Electron and electron-builder.

### Step 2: Run in Development Mode

```bash
npm start
```

This opens the app as a native desktop window.

### Step 3: Build Windows Installer

```bash
npm run build:win
```

After the build completes, find your installer and portable app in the `dist/` folder:

- `dist/SuperMarket Pro Setup.exe` — Windows installer (NSIS)
- `dist/SuperMarket Pro.exe` — Portable version (no install needed)

### Build Options

| Command | Output |
|---------|--------|
| `npm run build:win` | NSIS installer + portable |
| `npm run build:win:portable` | Portable only |
| `npm run dist` | Full distributable package |

### Adding an App Icon

1. Create a `assets/` folder in the project root.
2. Add your icon files:
   - `assets/icon.ico` — Windows app icon (required for build)
   - `assets/icon.png` — Optional fallback
3. Rebuild with `npm run build:win`.

> **Tip:** Use a 256x256 PNG and convert it to `.ico` using an online converter or tool like `png2ico`.

---

## USB Scanner Setup

Most USB barcode scanners work in **keyboard emulation mode** by default. Simply plug it in and scan — the app auto-detects rapid keystrokes as barcode input.

If your scanner supports native USB HID and you are running the app in a browser that supports WebUSB (Chrome/Edge), click **Settings > Devices > Request USB Access** to pair it directly.

---

## Printer Setup

### Thermal Printer (Recommended)

1. **Bluetooth Thermal Printer:** Click **Settings > Devices > Pair Bluetooth Printer** and select your ESC/POS thermal printer.
2. **USB Thermal Printer:** Click **Pair USB Printer** and select the device.
3. **Fallback (Any Printer):** The app uses `window.print()` with an 80mm/58mm receipt layout, so any printer connected to Windows will work. Set your printer's paper size accordingly in Windows printer settings.

### Receipt Paper Sizes

- **58mm** — Small portable thermal printers
- **80mm** — Standard POS thermal printers (default)
- **A4** — Full-page invoices for laser/inkjet printers

Change this in **Settings > Bill Display > Receipt Width**.

---

## CSV Import Format

To bulk-import products, prepare a CSV file with these columns:

```csv
Barcode,Name,MRP,Price,GST,Stock,Discount
8901234567890,Amul Milk 1L,72,68,0,50,0
8901234567891,Britannia Bread,45,40,0,30,0
```

Then go to **Settings > Inventory > Import CSV**.

---

## Tech Stack

- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Storage:** Browser localStorage (persistent across sessions)
- **Desktop Wrapper:** Electron + electron-builder
- **APIs Used:** WebUSB, Web Bluetooth, Web Audio, Fetch API

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Scanner not working | Ensure the cursor is in the scan input box. Most scanners output as keyboard — just scan. |
| WebUSB / Web Bluetooth not available | Use Chrome or Edge. These APIs are not available in Firefox or Safari. |
| Printed receipt is cut off | Adjust the **Receipt Width** in Settings (58mm/80mm/A4) to match your printer paper. |
| Logo not showing on print | Ensure the image is under ~500KB. Very large images may not render in print preview. |
| Data lost on app update | Data is stored in localStorage inside the Electron app profile. Backup via **Export CSV** regularly. |

---

## License

MIT — Free for commercial and personal use.
