import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { DiagramProvider } from './contexts/DiagramContext';
import { FeatureStatusProvider } from './contexts/FeatureStatusContext';

import "@xyflow/react/dist/style.css"; // Must import this, else React Flow will not work!
import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/reset.css';
import './styles/index.css';
import './styles/colors.css';
import './styles/bs-overrides.css';
import './nodes/nodes.css';
import './edges/edges.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <FeatureStatusProvider>
            <DiagramProvider>
                <App />
            </DiagramProvider>
        </FeatureStatusProvider>
    </React.StrictMode>,
)
