import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { OptionsProvider } from './contexts/OptionsContext';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <OptionsProvider>
        <App />
      </OptionsProvider>
    </AuthProvider>
  </StrictMode>,
);
