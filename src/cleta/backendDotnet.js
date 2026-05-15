/** Mapeo de respuestas JSON de la API .NET (→ Supabase) al modelo usado por la UI Cleta. */
import * as api from '../api.js';

async function safe(call, fallback) {
  try {
    const v = await call();
    return { ok: true, data: v };
  } catch (e) {
    return { ok: false, error: e, data: fallback };
  }
}

export function mapRestaurante(r) {
  return {
    id: r.id,
    nombre: r.nombre,
    cedulaJuridica: r.cedulaJuridica,
    direccion: r.direccion,
    tipoComida: r.tipoComida != null ? String(r.tipoComida) : '',
  };
}

export function mapCliente(c) {
  const est = c.estado;
  const susp =
    est === 'SUSPENDIDO' ||
    est === 'Suspendido' ||
    est === 1 ||
    est === '1';
  return {
    cedula: c.cedula,
    nombre: c.nombre,
    direccion: c.direccionExacta ?? c.direccion ?? '',
    tarjeta: c.numeroTarjeta ?? c.tarjeta ?? '',
    celular: c.numeroCelular ?? c.celular ?? '',
    correo: c.correoElectronico ?? c.correo ?? '',
    suspendido: susp,
  };
}

/** La API .NET no asocia repartidor a un restaurante concreto; usamos -1 para “desconocido”. */
export function mapRepartidor(r) {
  return {
    id: r.id,
    idRestaurante: -1,
    cedula: r.cedula,
    nombre: r.nombre,
    correo: r.correoElectronico ?? r.correo ?? '',
    direccion: r.direccionExacta ?? r.direccion ?? '',
    celular: r.numeroCelular ?? r.celular ?? '',
    tarjeta: r.numeroTarjeta ?? r.tarjeta ?? '',
    amonestaciones: r.numeroAmonestaciones ?? r.amonestaciones ?? 0,
  };
}

export function mapPedido(p) {
  const items = Array.isArray(p.items)
    ? p.items.map((i) => ({
        numeroCombo: i.numeroCombo,
        descripcion: i.descripcion,
        precioUnitario: i.precioUnitario,
        cantidad: i.cantidad,
      }))
    : [];
  return {
    id: p.id,
    cedulaCliente: p.cedulaCliente,
    idRestaurante: p.idRestaurante,
    nombreRestaurante: p.nombreRestaurante,
    idRepartidor: p.idRepartidor != null ? p.idRepartidor : 0,
    items,
    distanciaKm: p.distanciaKm ?? 0,
    esFeriado: !!p.esFeriado,
    mensaje: p.mensaje,
    observacion: p.observacion ?? '',
  };
}

export function mapCombo(c) {
  return {
    idRestaurante: c.idRestaurante,
    numeroCombo: c.numeroCombo,
    descripcion: c.descripcion,
    precio: c.precio,
  };
}

/**
 * Reportes agregados desde CletaEatsBackend (.NET).
 */
export async function loadReportesFromDotnet() {
  const filas = [];

  const add = async (titulo, fn) => {
    try {
      const data = await fn();
      let texto = '';
      if (data?.texto != null) texto = String(data.texto);
      else if (typeof data?.total === 'number') texto = `₡ ${data.total.toFixed(2)}`;
      else if (Array.isArray(data)) {
        texto = data
          .slice(0, 20)
          .map((row) =>
            typeof row === 'object'
              ? Object.values(row)
                  .filter((v) => v != null)
                  .join(' · ')
              : String(row),
          )
          .join('; ');
      } else texto = JSON.stringify(data);
      filas.push({ titulo, texto: texto || 'Sin datos.' });
    } catch (e) {
      filas.push({ titulo, texto: `Error: ${e?.message || e}` });
    }
  };

  await add('Restaurante con más pedidos', () => api.reportes.restauranteMasPedidos());
  await add('Restaurante con menos pedidos', () => api.reportes.restauranteMenosPedidos());
  await add('Monto por restaurante', async () => {
    const rows = await api.reportes.montoPorRestaurante();
    return Array.isArray(rows)
      ? rows.map((x) => ({ linea: `${x.nombre}: ₡${Number(x.monto).toFixed(0)}` }))
      : rows;
  });
  await add('Monto total general', () => api.reportes.montoTotal());
  await add('Quejas por repartidor', () => api.reportes.quejasPorRepartidor());
  await add('Pedidos por cliente (extracto)', () => api.reportes.pedidosPorCliente());
  await add('Cliente con más pedidos', () => api.reportes.clienteMasPedidos());
  await add('Hora pico', () => api.reportes.horaPico());

  return filas;
}

/**
 * Carga restaurantes, clientes, repartidores y pedidos desde CletaEatsBackend (.NET).
 */
export async function loadAllFromDotnet() {
  const [rRest, rAct, rSus, rRep, rPed, rRepSql] = await Promise.all([
    safe(() => api.restaurantes.todos(), []),
    safe(() => api.clientes.activos(), []),
    safe(() => api.clientes.suspendidos(), []),
    safe(() => api.repartidores.todos(), []),
    safe(() => api.pedidos.todos(), []),
    safe(() => loadReportesFromDotnet(), []),
  ]);

  const restaurantesOk = rRest.ok && Array.isArray(rRest.data);
  const restaurantes = restaurantesOk ? rRest.data.map(mapRestaurante) : [];

  const mapList = (res, mapper) =>
    res.ok && Array.isArray(res.data) ? res.data.map(mapper) : [];

  const clientesActivos = mapList(rAct, mapCliente);
  const clientesSuspendidos = mapList(rSus, mapCliente);
  const repartidores = mapList(rRep, mapRepartidor);
  const pedidos = mapList(rPed, mapPedido).reverse();

  const repartidoresCeroAm = repartidores.filter((x) => x.amonestaciones === 0);

  const reportes =
    rRepSql.ok && Array.isArray(rRepSql.data) && rRepSql.data.length > 0 ? rRepSql.data : [];

  const errorMessage = !restaurantesOk
    ? `Sin conexión al backend: ${rRest.error?.message || 'no se pudo cargar restaurantes'}`
    : null;

  return {
    restaurantes,
    clientesActivos,
    clientesSuspendidos,
    repartidores,
    repartidoresCeroAm,
    pedidos,
    reportes,
    isConnectedToBackend: restaurantesOk,
    errorMessage,
  };
}

export async function testDotnetBackend() {
  const r = await safe(() => api.restaurantes.todos(), []);
  if (!r.ok) return `Error: ${r.error?.message || 'fallo'}`;
  return `Éxito: API .NET OK (${(r.data || []).length} restaurantes).`;
}
