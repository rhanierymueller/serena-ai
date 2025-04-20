import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { I18nProvider } from './i18n/I18nContext';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </I18nProvider>
  </React.StrictMode>
);
