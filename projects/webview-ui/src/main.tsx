import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CompView from './CompView';
import { MemoryRouter, Routes, Route } from "react-router-dom"

import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/reset.css';
import './styles/index.css';
import './styles/colors.css';
import './styles/bs-overrides.css';
import './nodes/nodes.css';
import './edges/edges.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/compView" element={<CompView />} />
      </Routes>
    </MemoryRouter>
  </React.StrictMode>,
)
