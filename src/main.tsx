// Polyfill Buffer for gray-matter (uses Buffer.from in browser)
import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).Buffer = Buffer;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthGate from './components/common/AuthGate';
import { ThemeContextProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </ThemeContextProvider>
  </React.StrictMode>
);
