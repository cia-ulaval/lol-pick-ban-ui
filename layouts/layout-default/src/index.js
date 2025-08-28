import React from 'react';
import './index.css';
import App from './App';
import {createRoot} from "react-dom/client";
import * as serviceWorker from './serviceWorker';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

serviceWorker.register();
