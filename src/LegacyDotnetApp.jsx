// Consola Bootstrap contra la API ASP.NET (SQLite). Ver README: hash #dotnet
import { useMemo, useState } from 'react';
import Inicio from './pages/Inicio';
import Clientes from './pages/Clientes';
import Restaurantes from './pages/Restaurantes';
import Repartidores from './pages/Repartidores';
import Pedidos from './pages/Pedidos';
import Reportes from './pages/Reportes';

const PAGES = [
  { id: 'inicio', label: 'Inicio', Component: Inicio },
  { id: 'clientes', label: 'Clientes', Component: Clientes },
  { id: 'restaurantes', label: 'Restaurantes', Component: Restaurantes },
  { id: 'repartidores', label: 'Repartidores', Component: Repartidores },
  { id: 'pedidos', label: 'Pedidos', Component: Pedidos },
  { id: 'reportes', label: 'Reportes', Component: Reportes },
];

export default function LegacyDotnetApp() {
  const [page, setPage] = useState('inicio');
  const active = useMemo(() => PAGES.find((p) => p.id === page) ?? PAGES[0], [page]);
  const Body = active.Component;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand">CletaEats · API local (.NET)</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#dotnetNav"
            aria-controls="dotnetNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="dotnetNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {PAGES.map(({ id, label }) => (
                <li className="nav-item" key={id}>
                  <button
                    type="button"
                    className={`nav-link text-start border-0 bg-transparent ${page === id ? 'active fw-semibold' : ''}`}
                    onClick={() => setPage(id)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <a className="btn btn-outline-light btn-sm" href="#/" title="Volver a la app principal (Supabase)">
              App Supabase
            </a>
          </div>
        </div>
      </nav>
      <main className="container py-4 flex-grow-1">
        <Body />
      </main>
    </div>
  );
}
