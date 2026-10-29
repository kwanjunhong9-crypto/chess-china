import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically check and apply PWA updates immediately
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
