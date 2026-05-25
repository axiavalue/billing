import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Splash from './components/Splash';
import Header from './components/Header';
import ScanBox from './components/ScanBox';
import SessionTable from './components/SessionTable';
import ReceiptPreview from './components/ReceiptPreview';
import ToastContainer from './components/ToastContainer';
import UnknownProductModal from './components/UnknownProductModal';
import SettingsModal from './components/SettingsModal';

function AppContent() {
  const { splashHidden } = useApp();

  return (
    <>
      <Splash hidden={splashHidden} />
      {splashHidden && (
        <div className="app">
          <Header />
          <div className="main">
            <div className="left">
              <ScanBox />
              <SessionTable />
            </div>
            <div className="right">
              <ReceiptPreview />
            </div>
          </div>
          <ToastContainer />
          <UnknownProductModal />
          <SettingsModal />
          <div id="print-area" style={{ display: 'none' }}></div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
