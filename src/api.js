// Usar rutas relativas para que el proxy de Vite redirija a la API
const API_BASE = '';

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = res.ok ? await res.json().catch(() => ({})) : null;
  if (!res.ok) {
    const err = data?.mensaje || data?.title || `Error ${res.status}`;
    throw new Error(err);
  }
  return data;
}

export const clientes = {
  registrar: (body) => api('/api/ClientesApi/registrar', { method: 'POST', body: JSON.stringify(body) }),
  verificar: (cedula) => api(`/api/ClientesApi/verificar/${encodeURIComponent(cedula)}`),
  activos: () => api('/api/ClientesApi/activos'),
  suspendidos: () => api('/api/ClientesApi/suspendidos')
};

export const restaurantes = {
  registrar: (body) => api('/api/RestaurantesApi/registrar', { method: 'POST', body: JSON.stringify(body) }),
  todos: () => api('/api/RestaurantesApi'),
  combos: (id) => api(`/api/RestaurantesApi/${id}/combos`)
};

export const repartidores = {
  registrar: (body) => api('/api/RepartidoresApi/registrar', { method: 'POST', body: JSON.stringify(body) }),
  todos: () => api('/api/RepartidoresApi'),
  ceroAmonestaciones: () => api('/api/RepartidoresApi/cero-amonestaciones')
};

export const pedidos = {
  realizar: (body) => api('/api/PedidosApi/realizar', { method: 'POST', body: JSON.stringify(body) }),
  marcarEntregado: (body) => api('/api/PedidosApi/marcar-entregado', { method: 'POST', body: JSON.stringify(body) })
};

export const reportes = {
  restauranteMasPedidos: () => api('/api/ReportesApi/restaurante-mas-pedidos'),
  restauranteMenosPedidos: () => api('/api/ReportesApi/restaurante-menos-pedidos'),
  montoPorRestaurante: () => api('/api/ReportesApi/monto-por-restaurante'),
  montoTotal: () => api('/api/ReportesApi/monto-total'),
  quejasPorRepartidor: () => api('/api/ReportesApi/quejas-por-repartidor'),
  pedidosPorCliente: () => api('/api/ReportesApi/pedidos-por-cliente'),
  clienteMasPedidos: () => api('/api/ReportesApi/cliente-mas-pedidos'),
  horaPico: () => api('/api/ReportesApi/hora-pico')
};
