/**
 * Espejo de CletaEatsPrototypeRepository.kt (estado en memoria).
 */
let nextRestauranteId = 3;
let nextPedidoId = 2;
let nextRepartidorId = 3;
let nextReporteClienteId = 1;

let restaurantes = [
  { id: 1, nombre: 'Soda El Cheverísimo', cedulaJuridica: '3-101-123456', direccion: 'San José', tipoComida: 'Casera' },
  { id: 2, nombre: 'Pizza Cleta', cedulaJuridica: '3-102-789012', direccion: 'Heredia', tipoComida: 'Italiana' },
];

let combos = [
  { idRestaurante: 1, numeroCombo: 1, descripcion: 'Casado + refresco', precio: 3500.0 },
  { idRestaurante: 1, numeroCombo: 2, descripcion: 'Olla de carne', precio: 4500.0 },
  { idRestaurante: 2, numeroCombo: 1, descripcion: 'Pizza mediana 2 ingredientes', precio: 8500.0 },
  { idRestaurante: 2, numeroCombo: 2, descripcion: 'Pizza familiar especial', precio: 12500.0 },
];

let clientes = [
  {
    cedula: '108880888',
    nombre: 'María Pérez',
    direccion: 'Desamparados',
    tarjeta: '****1234',
    celular: '88887777',
    correo: 'maria@mail.com',
    suspendido: false,
  },
  {
    cedula: '207770777',
    nombre: 'Juan Rojas',
    direccion: 'Alajuela',
    tarjeta: '****5678',
    celular: '77776666',
    correo: 'juan@mail.com',
    suspendido: true,
  },
];

let repartidores = [
  {
    id: 1,
    idRestaurante: 1,
    cedula: '109990999',
    nombre: 'Carlos Rider',
    correo: 'carlos@mail.com',
    direccion: 'Curridabat',
    celular: '89991111',
    tarjeta: '****9999',
    amonestaciones: 0,
  },
  {
    id: 2,
    idRestaurante: 2,
    cedula: '206660666',
    nombre: 'Ana Express',
    correo: 'ana@mail.com',
    direccion: 'Escazú',
    celular: '66665555',
    tarjeta: '****6666',
    amonestaciones: 2,
  },
];

let reportesCliente = [];

let pedidos = [
  {
    id: 1,
    cedulaCliente: '108880888',
    idRestaurante: 1,
    nombreRestaurante: 'Soda El Cheverísimo',
    items: [{ numeroCombo: 1, descripcion: 'Casado + refresco', precioUnitario: 3500.0, cantidad: 2 }],
    distanciaKm: 2.5,
    esFeriado: false,
    mensaje: 'Pedido #1 registrado. Costo envío estimado aplicado.',
    observacion: '',
  },
];

export function getRestaurantes() {
  return [...restaurantes];
}

export function getCombos(idRestaurante) {
  return combos.filter((c) => c.idRestaurante === idRestaurante);
}

export function getClientesActivos() {
  return clientes.filter((c) => !c.suspendido);
}

export function getClientesSuspendidos() {
  return clientes.filter((c) => c.suspendido);
}

export function getRepartidores() {
  return [...repartidores];
}

export function getRepartidoresCeroAmonestaciones() {
  return repartidores.filter((r) => r.amonestaciones === 0);
}

export function getPedidosRecientes() {
  return [...pedidos].reverse();
}

export function registrarReporteCliente(cedula, titulo, texto) {
  if (!cedula?.trim() || !titulo?.trim()) return 'Error: cédula y título son obligatorios.';
  const id = nextReporteClienteId++;
  reportesCliente.push({
    id,
    cedulaCliente: cedula.trim(),
    titulo: titulo.trim(),
    texto: texto.trim(),
  });
  return 'Reporte enviado.';
}

export function getReportesClienteTodos() {
  return [...reportesCliente];
}

export function realizarPedido(cedulaCliente, idRestaurante, items, distanciaKm, esFeriado) {
  if (!items?.length) return 'Error: se requieren ítems del pedido.';
  const restaurante = restaurantes.find((r) => r.id === idRestaurante);
  if (!restaurante) return 'Error: restaurante no encontrado.';
  if (!clientes.some((c) => c.cedula === cedulaCliente.trim())) {
    return 'Error: cliente no registrado. Registre la cédula en Clientes.';
  }
  const id = nextPedidoId++;
  const total = items.reduce((s, it) => s + it.precioUnitario * it.cantidad, 0);
  const msg = `Pedido #${id}. Restaurante: ${restaurante.nombre}. Distancia ${distanciaKm} km, feriado=${esFeriado}. Total ítems: ${total}.`;
  pedidos.push({
    id,
    cedulaCliente: cedulaCliente.trim(),
    idRestaurante,
    nombreRestaurante: restaurante.nombre,
    items,
    distanciaKm,
    esFeriado,
    mensaje: msg,
    observacion: '',
  });
  return msg;
}

export function actualizarPedidoObservacion(idPedido, observacion) {
  const i = pedidos.findIndex((p) => p.id === idPedido);
  if (i < 0) return 'Error: pedido no encontrado.';
  pedidos[i] = { ...pedidos[i], observacion: observacion.trim() };
  return 'Observación actualizada.';
}

export function eliminarPedido(idPedido) {
  const idx = pedidos.findIndex((p) => p.id === idPedido);
  if (idx < 0) return false;
  pedidos.splice(idx, 1);
  return true;
}

export function registrarRepartidor(idRestaurante, cedula, nombre, correo, direccion, celular, tarjeta) {
  if (!restaurantes.some((r) => r.id === idRestaurante)) return 'Error: restaurante no existe.';
  if (!cedula?.trim() || !nombre?.trim()) return 'Error: cédula y nombre son obligatorios.';
  if (repartidores.some((r) => r.cedula === cedula.trim())) return 'Error: cédula ya registrada.';
  const id = nextRepartidorId++;
  repartidores.push({
    id,
    idRestaurante,
    cedula: cedula.trim(),
    nombre: nombre.trim(),
    correo: correo.trim(),
    direccion: direccion.trim(),
    celular: celular.trim(),
    tarjeta: tarjeta.trim(),
    amonestaciones: 0,
  });
  return 'Repartidor registrado.';
}

export function actualizarRepartidor(id, cedula, nombre, correo, direccion, celular, tarjeta, amonestaciones) {
  const i = repartidores.findIndex((r) => r.id === id);
  if (i < 0) return 'Error: repartidor no encontrado.';
  if (!nombre?.trim() || !cedula?.trim()) return 'Error: cédula y nombre obligatorios.';
  if (repartidores.some((r) => r.cedula === cedula.trim() && r.id !== id)) {
    return 'Error: cédula ya usada por otro repartidor.';
  }
  const prev = repartidores[i];
  repartidores[i] = {
    id,
    idRestaurante: prev.idRestaurante,
    cedula: cedula.trim(),
    nombre: nombre.trim(),
    correo: correo.trim(),
    direccion: direccion.trim(),
    celular: celular.trim(),
    tarjeta: tarjeta.trim(),
    amonestaciones: Math.max(0, Number(amonestaciones) || 0),
  };
  return 'Repartidor actualizado.';
}

export function eliminarRepartidor(id) {
  const idx = repartidores.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  repartidores.splice(idx, 1);
  return true;
}

export function registrarRestaurante(nombre, cedulaJuridica, direccion, tipoComida) {
  if (!nombre?.trim() || !cedulaJuridica?.trim()) return 'Error: nombre y cédula jurídica son obligatorios.';
  const id = nextRestauranteId++;
  restaurantes.push({
    id,
    nombre: nombre.trim(),
    cedulaJuridica: cedulaJuridica.trim(),
    direccion: (direccion || '').trim(),
    tipoComida: (tipoComida || '').trim(),
  });
  return 'Restaurante registrado.';
}

export function actualizarRestaurante(id, nombre, cedulaJuridica, direccion, tipoComida) {
  const i = restaurantes.findIndex((r) => r.id === id);
  if (i < 0) return 'Error: restaurante no encontrado.';
  if (!nombre?.trim()) return 'Error: nombre obligatorio.';
  restaurantes[i] = {
    id,
    nombre: nombre.trim(),
    cedulaJuridica: cedulaJuridica.trim(),
    direccion: direccion.trim(),
    tipoComida: tipoComida.trim(),
  };
  return 'Restaurante actualizado.';
}

export function eliminarRestaurante(id) {
  const before = restaurantes.length;
  restaurantes = restaurantes.filter((r) => r.id !== id);
  if (restaurantes.length < before) {
    combos = combos.filter((c) => c.idRestaurante !== id);
    return true;
  }
  return false;
}

export function getReportesMock() {
  return [
    { titulo: 'Restaurante con más pedidos', texto: 'Pizza Cleta — mayor volumen en el período.' },
    { titulo: 'Restaurante con menos pedidos', texto: 'Soda El Cheverísimo — menor volumen.' },
    { titulo: 'Monto total general', texto: '₡ 142 350,00' },
    { titulo: 'Cliente con más pedidos', texto: 'María Pérez (108880888).' },
    { titulo: 'Hora pico', texto: 'Entre 12:00 y 14:00.' },
    { titulo: 'Quejas por repartidor', texto: 'Ana Express: 2; Carlos Rider: 0.' },
  ];
}
