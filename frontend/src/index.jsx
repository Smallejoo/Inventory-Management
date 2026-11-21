import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && (config.url?.startsWith('/getitems') || config.url?.startsWith('/reg/auth'))) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
