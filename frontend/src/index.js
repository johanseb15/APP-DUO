import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Workbox } from 'workbox-window';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  const wb = new Workbox(`${process.env.PUBLIC_URL}/service-worker.js`);
  wb.register();
}
