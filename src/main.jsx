import 'eventsource-polyfill';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// import './mocks/authMock.js';
// import './mocks/dashboardMock.js';
// import './mocks/geometricModelingMock.js';
// import './mocks/partRetrievalMock.js';
// import './mocks/designOptimizationMock.js';
// import './mocks/softwareInterfaceMock.js';
// import './mocks/fileMock.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
