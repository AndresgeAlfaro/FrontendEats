import { useState, useEffect } from 'react';
import { pedidos, restaurantes, repartidores } from '../api';

export default function Pedidos() {
  const [restList, setRestList] = useState([]);
  const [combos, setCombos] = useState([]);
  const [idRestaurante, setIdRestaurante] = useState('');
  const [cedulaCliente, setCedulaCliente] = useState('');
  const [distanciaKm, setDistanciaKm] = useState(1);
  const [esFeriado, setEsFeriado] = useState(false);
  const [items, setItems] = useState([{ numeroCombo: 1, descripcion: '', precioUnitario: 4000, cantidad: 1 }]);
  const [mensaje, setMensaje] = useState('');
  const [entregado, setEntregado] = useState({ idPedido: '', idRepartidor: '' });
  const [msgEntregado, setMsgEntregado] = useState('');

  useEffect(() => {
    restaurantes.todos().then(data => setRestList(Array.isArray(data) ? data : [])).catch(() => setRestList([]));
  }, []);

  useEffect(() => {
    if (!idRestaurante) { setCombos([]); return; }
    restaurantes.combos(Number(idRestaurante)).then(data => setCombos(Array.isArray(data) ? data : [])).catch(() => setCombos([]));
  }, [idRestaurante]);

  const addItem = () => setItems(i => [...i, { numeroCombo: 1, descripcion: '', precioUnitario: 4000, cantidad: 1 }]);
  const removeItem = (idx) => setItems(i => i.filter((_, k) => k !== idx));
  const updateItem = (idx, field, value) => setItems(prev => prev.map((it, k) => k === idx ? { ...it, [field]: value } : it));

  const handleRealizar = async (e) => {
    e.preventDefault();
    setMensaje('');
    const body = {
      cedulaCliente: cedulaCliente.trim(),
      idRestaurante: Number(idRestaurante),
      distanciaKm: Number(distanciaKm) || 1,
      esFeriado,
      items: items.filter(i => i.cantidad > 0).map(i => ({
        numeroCombo: i.numeroCombo,
        descripcion: i.descripcion || `Combo ${i.numeroCombo}`,
        precioUnitario: Number(i.precioUnitario) || 4000,
        cantidad: i.cantidad
      }))
    };
    if (body.items.length === 0) { setMensaje('Añade al menos un item con cantidad > 0.'); return; }
    try {
      const r = await pedidos.realizar(body);
      setMensaje(r.mensaje || 'Pedido realizado.');
    } catch (err) {
      setMensaje(err.message || 'Error.');
    }
  };

  const handleMarcarEntregado = async (e) => {
    e.preventDefault();
    setMsgEntregado('');
    const idPed = Number(entregado.idPedido);
    const idRep = Number(entregado.idRepartidor);
    if (!idPed || !idRep) { setMsgEntregado('Indica id pedido e id repartidor.'); return; }
    try {
      const r = await pedidos.marcarEntregado({ idPedido: idPed, idRepartidor: idRep });
      setMsgEntregado(r.mensaje || 'Entregado.');
    } catch (err) {
      setMsgEntregado(err.message || 'Error.');
    }
  };

  const preciosFijos = { 1: 4000, 2: 5000, 3: 6000, 4: 7000, 5: 8000, 6: 9000, 7: 10000, 8: 11000, 9: 12000 };
  const getPrecio = (num) => combos.find(c => c.numeroCombo === num)?.precio ?? preciosFijos[num] ?? 4000;

  return (
    <>
      <h2 className="h4 mb-3">Pedidos</h2>
      <div className="row">
        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header">Realizar pedido</div>
            <div className="card-body">
              {mensaje && <div className={`alert alert-sm ${mensaje.startsWith('Error') ? 'alert-danger' : 'alert-success'}`}>{mensaje}</div>}
              <form onSubmit={handleRealizar}>
                <div className="mb-2">
                  <label className="form-label">Restaurante</label>
                  <select className="form-select" value={idRestaurante} onChange={e => setIdRestaurante(e.target.value)} required>
                    <option value="">Seleccione</option>
                    {restList.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
                <div className="mb-2"><label className="form-label">Cédula cliente</label><input className="form-control" value={cedulaCliente} onChange={e => setCedulaCliente(e.target.value)} required /></div>
                <div className="row g-2 mb-2">
                  <div className="col-6"><label className="form-label">Distancia (km)</label><input type="number" step="0.1" min="0" className="form-control" value={distanciaKm} onChange={e => setDistanciaKm(e.target.value)} /></div>
                  <div className="col-6"><label className="form-label">Es feriado</label><div className="form-check mt-2"><input type="checkbox" className="form-check-input" checked={esFeriado} onChange={e => setEsFeriado(e.target.checked)} /><label className="form-check-label">Sí</label></div></div>
                </div>
                <label className="form-label">Items (combo, descripción, precio, cantidad)</label>
                {items.map((it, idx) => (
                  <div key={idx} className="row g-1 align-items-center mb-1">
                    <div className="col-2"><input type="number" min="1" max="9" className="form-control form-control-sm" value={it.numeroCombo} onChange={e => { const n = Number(e.target.value); updateItem(idx, 'numeroCombo', n); updateItem(idx, 'precioUnitario', getPrecio(n)); }} /></div>
                    <div className="col-3"><input className="form-control form-control-sm" placeholder="Descripción" value={it.descripcion} onChange={e => updateItem(idx, 'descripcion', e.target.value)} /></div>
                    <div className="col-2"><input type="number" className="form-control form-control-sm" value={it.precioUnitario} onChange={e => updateItem(idx, 'precioUnitario', Number(e.target.value))} /></div>
                    <div className="col-2"><input type="number" min="1" className="form-control form-control-sm" value={it.cantidad} onChange={e => updateItem(idx, 'cantidad', Number(e.target.value) || 0)} /></div>
                    <div className="col-2"><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(idx)}>Quitar</button></div>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-secondary mb-2" onClick={addItem}>+ Añadir item</button>
                <div><button type="submit" className="btn btn-cleta">Realizar pedido</button></div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">Marcar pedido entregado</div>
            <div className="card-body">
              {msgEntregado && <div className={`alert alert-sm ${msgEntregado.startsWith('Error') ? 'alert-danger' : 'alert-success'}`}>{msgEntregado}</div>}
              <form onSubmit={handleMarcarEntregado}>
                <div className="mb-2"><label className="form-label">Id pedido</label><input type="number" className="form-control" value={entregado.idPedido} onChange={e => setEntregado(prev => ({ ...prev, idPedido: e.target.value }))} /></div>
                <div className="mb-2"><label className="form-label">Id repartidor</label><input type="number" className="form-control" value={entregado.idRepartidor} onChange={e => setEntregado(prev => ({ ...prev, idRepartidor: e.target.value }))} /></div>
                <button type="submit" className="btn btn-cleta">Marcar entregado</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
