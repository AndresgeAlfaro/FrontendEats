import { useState } from 'react';
import Inicio from './pages/Inicio';
import Clientes from './pages/Clientes';
import Restaurantes from './pages/Restaurantes';
import Repartidores from './pages/Repartidores';
import Pedidos from './pages/Pedidos';
import Reportes from './pages/Reportes';

const PAGES = {
  inicio: { label: 'Inicio', Component: Inicio },
  clientes: { label: 'Clientes', Component: Clientes },
  restaurantes: { label: 'Restaurantes', Component: Restaurantes },
  repartidores: { label: 'Repartidores', Component: Repartidores },
  pedidos: { label: 'Pedidos', Component: Pedidos },
  reportes: { label: 'Reportes', Component: Reportes }
};

export default function App() {
  const [page, setPage] = useState('inicio');
  const { Component } = PAGES[page] || PAGES.inicio;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
        <div className="container">
          <span className="navbar-brand">CletaEats</span>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Toggle">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="nav">
            <ul className="navbar-nav me-auto">
              {Object.entries(PAGES).map(([key, { label }]) => (
                <li className="nav-item" key={key}>
                  <button
                    className={`nav-link ${page === key ? 'active fw-semibold' : ''}`}
                    onClick={() => setPage(key)}
                    type="button"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Component />
      </main>
    </>
  );
}
