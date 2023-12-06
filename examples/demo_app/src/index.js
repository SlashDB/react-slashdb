import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { SlashDBProvider } from '@slashdb/react-slashdb';

const host = "http://host.docker.internal:8000";	// set SlashDB host here
const username = "test";	// set SlashDB username here
const apiKey = "03zhx63tfaaj35zgesbikqg5uiqdla70";	// set SlashDB API key here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

