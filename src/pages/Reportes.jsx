import { useState, useEffect } from 'react';
import { reportes } from '../api';

export default function Reportes() {
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const run = async (key, fn) => {
    setLoading(key);
    setError('');
    setResult(null);
    try {
      const data = await fn();
      setResult({ key, data });
    } catch (err) {
      setError(err.message || 'Error al cargar.');
    } finally {
      setLoading(null);
    }
  };

  const reporteList = [
    { key: 'restauranteMasPedidos', label: 'Restaurante con más pedidos', fn: reportes.restauranteMasPedidos },
    { key: 'restauranteMenosPedidos', label: 'Restaurante con menos pedidos', fn: reportes.restauranteMenosPedidos },
    { key: 'montoPorRestaurante', label: 'Monto por restaurante', fn: reportes.montoPorRestaurante },
    { key: 'montoTotal', label: 'Monto total general', fn: reportes.montoTotal },
    { key: 'clienteMasPedidos', label: 'Cliente con más pedidos', fn: reportes.clienteMasPedidos },
    { key: 'horaPico', label: 'Hora pico', fn: reportes.horaPico },
    { key: 'quejasPorRepartidor', label: 'Quejas por repartidor', fn: reportes.quejasPorRepartidor },
    { key: 'pedidosPorCliente', label: 'Pedidos por cliente', fn: reportes.pedidosPorCliente }
  ];

  const renderData = () => {
    if (!result) return null;
    const { key, data } = result;
    if (key === 'restauranteMasPedidos' || key === 'restauranteMenosPedidos' || key === 'clienteMasPedidos' || key === 'horaPico') {
      return <p className="mb-0">{data?.texto ?? JSON.stringify(data)}</p>;
    }
    if (key === 'montoTotal') {
      return <p className="mb-0 fs-5"><strong>Total: ₡ {Number(data?.total ?? 0).toLocaleString('es-CR')}</strong></p>;
    }
    if (key === 'montoPorRestaurante' && Array.isArray(data)) {
      return (
        <ul className="list-group list-group-flush">
          {data.map((x, i) => <li key={i} className="list-group-item d-flex justify-content-between"><span>{x.nombre}</span><span>₡ {Number(x.monto).toLocaleString('es-CR')}</span></li>)}
        </ul>
      );
    }
    if ((key === 'quejasPorRepartidor' || key === 'pedidosPorCliente') && Array.isArray(data)) {
      return <pre className="bg-light p-3 rounded small mb-0" style={{ whiteSpace: 'pre-wrap' }}>{data.join('\n')}</pre>;
    }
    return <pre className="bg-light p-3 rounded small mb-0">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <>
      <h2 className="h4 mb-3">Reportes</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col-md-4">
          <div className="list-group">
            {reporteList.map(({ key, label, fn }) => (
              <button key={key} type="button" className="list-group-item list-group-item-action" onClick={() => run(key, fn)} disabled={loading != null}>
                {loading === key ? 'Cargando...' : label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              {result ? <><h6 className="card-subtitle mb-2 text-muted">{reporteList.find(r => r.key === result.key)?.label}</h6>{renderData()}</> : <p className="text-muted mb-0">Elige un reporte a la izquierda.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
