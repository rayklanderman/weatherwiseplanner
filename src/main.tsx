import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA install prompt handler (optional)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  console.log('💾 PWA install prompt available');
  // Store for later use if you want to show a custom install button
  (window as Window & { deferredPrompt?: Event }).deferredPrompt = e;
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully');
});

