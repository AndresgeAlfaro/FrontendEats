// Creadores: Bayron Parra y Andres Alfaro
import React from 'react'
import ReactDOM from 'react-dom/client'
import * as bootstrap from 'bootstrap'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './App'
import { CletaProvider } from './cleta/CletaContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

window.bootstrap = bootstrap

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CletaProvider>
      <App />
    </CletaProvider>
  </React.StrictMode>
)
