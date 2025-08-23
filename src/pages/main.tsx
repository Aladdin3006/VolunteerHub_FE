import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '../styles/globals.css';
import '../index.css';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Khi có bản mới
    if (confirm("🚀 Ứng dụng có phiên bản mới, tải lại nhé?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // Khi app đã cache xong => có thể chạy offline
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
