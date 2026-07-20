import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Le thème initial est appliqué avant le premier rendu par /theme-init.js
// (chargé depuis index.html) ; AnimatedThemeToggler gère la persistance.

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
