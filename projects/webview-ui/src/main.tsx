import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/reset.css';
import './styles/index.css';
import './styles/colors.css';
import './nodes/nodes.css';
import './edges/edges.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
