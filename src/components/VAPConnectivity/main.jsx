import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import store from '@/components/VAPUtils/features/store.js';
import { Provider } from 'react-redux';

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => console.clear());
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
