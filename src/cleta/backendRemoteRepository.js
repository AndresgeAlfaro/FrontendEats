/** Datos y auth vía CletaEatsBackend (.NET → Supabase); sustituye el uso directo de supabase-js en la UI. */
import * as api from '../api.js';
import { loadAllFromDotnet, testDotnetBackend } from './backendDotnet.js';

export function sbErr(error) {
  if (!error) return 'Error desconocido';
  return error.message || error.details || error.hint || String(error);
}

export async function signIn(email, password) {
  try {
    await api.auth.login(email.trim().toLowerCase(), password);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function signUp(email, password) {
  try {
    await api.auth.register(email.trim().toLowerCase(), password);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function loadAllFromSupabase() {
  return loadAllFromDotnet();
}

export async function testSupabaseBackend() {
  return testDotnetBackend();
}

export async function createRestaurante(r) {
  try {
    await api.restaurantes.registrar({
      nombre: r.nombre,
      cedulaJuridica: r.cedulaJuridica,
      direccion: r.direccion,
      tipoComida: String(r.tipoComida ?? ''),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function updateRestaurante(r) {
  try {
    await api.restaurantes.actualizar(r.id, {
      nombre: r.nombre,
      cedulaJuridica: r.cedulaJuridica,
      direccion: r.direccion,
      tipoComida: String(r.tipoComida ?? ''),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function deleteRestaurante(id) {
  try {
    await api.restaurantes.eliminar(id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function createCliente(c) {
  try {
    await api.clientes.registrar({
      cedula: c.cedula,
      nombre: c.nombre,
      direccion: c.direccion,
      tarjeta: c.tarjeta,
      celular: c.celular,
      correo: c.correo,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function createRepartidor(r) {
  try {
    await api.repartidores.registrar({
      cedula: r.cedula,
      nombre: r.nombre,
      correo: r.correo,
      direccion: r.direccion,
      celular: r.celular,
      tarjeta: r.tarjeta,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function updateRepartidor(r) {
  try {
    await api.repartidores.actualizar(r.id, {
      cedula: r.cedula,
      nombre: r.nombre,
      correo: r.correo,
      direccion: r.direccion,
      celular: r.celular,
      tarjeta: r.tarjeta,
      amonestaciones: r.amonestaciones ?? 0,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function deleteRepartidor(id) {
  try {
    await api.repartidores.eliminar(id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

function parsePedidoId(mensaje, data) {
  if (data?.id != null) return Number(data.id);
  const m = /#(\d+)/.exec(mensaje || '');
  return m ? Number(m[1]) : null;
}

export async function createPedidoWithItems(payload) {
  try {
    const data = await api.pedidos.realizar({
      cedulaCliente: payload.cedulaCliente,
      idRestaurante: payload.idRestaurante,
      nombreRestaurante: payload.nombreRestaurante,
      distanciaKm: payload.distanciaKm,
      esFeriado: payload.esFeriado,
      items: payload.items.map((line) => ({
        numeroCombo: line.numeroCombo,
        descripcion: line.descripcion,
        precioUnitario: line.precioUnitario,
        cantidad: line.cantidad,
      })),
    });
    const id = parsePedidoId(data?.mensaje, data);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function updatePedidoObservacion(idPedido, observacion) {
  try {
    await api.pedidos.actualizarObservacion(idPedido, observacion);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function deletePedido(idPedido) {
  try {
    await api.pedidos.eliminar(idPedido);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function marcarPedidoEntregado(idPedido, idRepartidor) {
  try {
    await api.pedidos.marcarEntregado({ idPedido, idRepartidor });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function insertCombo(idRestaurante, payload) {
  try {
    await api.restaurantes.agregarCombo(idRestaurante, {
      descripcion: payload.descripcion,
      precio: payload.precio,
      numeroCombo: payload.numeroCombo,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function deleteCombo(idRestaurante, numeroCombo) {
  try {
    await api.restaurantes.eliminarCombo(idRestaurante, numeroCombo);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function patchCombo(idRestaurante, numeroCombo, payload) {
  try {
    await api.restaurantes.actualizarCombo(idRestaurante, numeroCombo, {
      descripcion: payload.descripcion,
      precio: payload.precio,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

export async function getCombos(idRestaurante) {
  try {
    const list = await api.restaurantes.combos(idRestaurante);
    const rows = Array.isArray(list) ? list : [];
    return {
      ok: true,
      list: rows.map((c) => ({
        idRestaurante: c.idRestaurante ?? idRestaurante,
        numeroCombo: c.numeroCombo,
        descripcion: c.descripcion,
        precio: c.precio,
      })),
    };
  } catch (e) {
    return { ok: false, error: { message: e.message }, list: [] };
  }
}
