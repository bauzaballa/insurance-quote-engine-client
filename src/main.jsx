import './styles/globals.scss';
import { createRoot } from 'react-dom/client';

import App from './App';

import '../lib/testPreset';

import { QuoteProvider } from '/src/context/QuoteContext';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(
  <QuoteProvider>
    <App />
  </QuoteProvider>
);
