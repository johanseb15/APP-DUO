import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import AdminApp from './AdminApp.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

const renderApp = () => {
  if (window.location.pathname.startsWith('/admin')) {
    root.render(
      <React.StrictMode>
        <AdminApp />
      </React.StrictMode>
    );
  } else {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

renderApp();

// Listen for URL changes to re-render the correct app
window.addEventListener('popstate', renderApp);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}