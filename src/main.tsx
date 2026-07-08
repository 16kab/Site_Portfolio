import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Set dark mode as default theme
if (!localStorage.getItem('theme')) {
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
} else if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);