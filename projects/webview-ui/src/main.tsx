import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CompView from './CompView';
import { HashRouter, Routes, Route } from "react-router-dom"
import { initVsCodeApi } from './vscodeApiHandler';

import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/reset.css';
import './styles/index.css';
import './styles/colors.css';
import './nodes/nodes.css';
import './edges/edges.css';

initVsCodeApi();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/compView" element={<CompView />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
