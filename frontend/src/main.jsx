import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import './index.css';
import Navbar from './components/layouts/Navbar';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SearchProvider>
      <AuthProvider> 
        <AppRoutes />
      </AuthProvider>
    </SearchProvider>
  </React.StrictMode>
);