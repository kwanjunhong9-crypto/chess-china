import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { ErrorBoundary } from './components/ErrorBoundary';

// Automatically check and apply PWA updates immediately
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackTitle="华夏象棋系统遇到意外问题" onReset={() => window.location.reload()}>
    <App />
  </ErrorBoundary>
);
