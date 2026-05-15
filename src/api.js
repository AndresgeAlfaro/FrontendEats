// En desarrollo Vite deja rutas relativas y el proxy reenvía a la API.
// En Netlify definir VITE_API_URL=https://TU-SERVICIO.onrender.com (sin barra final).
const raw = import.meta.env.VITE_API_URL ?? '';
const API_BASE = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';

export const auth = {
  login: (email, password) =>
    api('/api/Auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password) =>
    api('/api/Auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

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
  suspendidos: () => api('/api/ClientesApi/suspendidos'),
  actualizar: (cedula, body) =>
    api(`/api/ClientesApi/${encodeURIComponent(cedula)}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (cedula) => api(`/api/ClientesApi/${encodeURIComponent(cedula)}`, { method: 'DELETE' }),
};

export const restaurantes = {
  registrar: (body) => api('/api/RestaurantesApi/registrar', { method: 'POST', body: JSON.stringify(body) }),
  todos: () => api('/api/RestaurantesApi'),
  actualizar: (id, body) =>
    api(`/api/RestaurantesApi/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => api(`/api/RestaurantesApi/${id}`, { method: 'DELETE' }),
  combos: (id) => api(`/api/RestaurantesApi/${id}/combos`),
  agregarCombo: (idRestaurante, body) =>
    api(`/api/RestaurantesApi/${idRestaurante}/combos`, { method: 'POST', body: JSON.stringify(body) }),
  eliminarCombo: (idRestaurante, numeroCombo) =>
    api(`/api/RestaurantesApi/${idRestaurante}/combos/${numeroCombo}`, { method: 'DELETE' }),
  actualizarCombo: (idRestaurante, numeroCombo, body) =>
    api(`/api/RestaurantesApi/${idRestaurante}/combos/${numeroCombo}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

export const repartidores = {
  registrar: (body) => api('/api/RepartidoresApi/registrar', { method: 'POST', body: JSON.stringify(body) }),
  todos: () => api('/api/RepartidoresApi'),
  ceroAmonestaciones: () => api('/api/RepartidoresApi/cero-amonestaciones'),
  actualizar: (id, body) =>
    api(`/api/RepartidoresApi/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => api(`/api/RepartidoresApi/${id}`, { method: 'DELETE' }),
};

export const pedidos = {
  todos: () => api('/api/PedidosApi'),
  realizar: (body) => api('/api/PedidosApi/realizar', { method: 'POST', body: JSON.stringify(body) }),
  marcarEntregado: (body) => api('/api/PedidosApi/marcar-entregado', { method: 'POST', body: JSON.stringify(body) }),
  eliminar: (id) => api(`/api/PedidosApi/${id}`, { method: 'DELETE' }),
  actualizarObservacion: (id, observacion) =>
    api(`/api/PedidosApi/${id}/observacion`, {
      method: 'PATCH',
      body: JSON.stringify({ observacion }),
    }),
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
