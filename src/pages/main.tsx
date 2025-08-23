import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '../styles/globals.css';
import '../index.css';
import { registerSW } from 'virtual:pwa-register';

// Gọi 1 lần duy nhất
const updateSW = registerSW({
  immediate: true, // SW active ngay
  onNeedRefresh() {
    if (confirm("🚀 Ứng dụng có phiên bản mới, tải lại nhé?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("✅ App đã sẵn sàng chạy offline");
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
