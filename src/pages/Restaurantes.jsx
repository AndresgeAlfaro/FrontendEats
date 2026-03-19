import { useState, useEffect } from 'react';
import { restaurantes as api } from '../api';

const TIPOS = ['RAPIDA', 'CHINA', 'SALUDABLE', 'ITALIANA', 'MEXICANA', 'MARISCOS', 'OTRA'];

export default function Restaurantes() {
  const [form, setForm] = useState({ nombre: '', cedulaJuridica: '', direccion: '', tipoComida: 'RAPIDA' });
  const [mensaje, setMensaje] = useState('');
  const [lista, setLista] = useState([]);
  const [combos, setCombos] = useState(null);
  const [tab, setTab] = useState('registrar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const r = await api.registrar(form);
      setMensaje(r.mensaje || 'Registrado.');
      setForm({ nombre: '', cedulaJuridica: '', direccion: '', tipoComida: 'RAPIDA' });
    } catch (err) {
      setMensaje(err.message || 'Error.');
    }
  };

  const loadTodos = async () => {
    try {
      const data = await api.todos();
      setLista(Array.isArray(data) ? data : []);
    } catch {
      setLista([]);
    }
  };

  useEffect(() => {
    if (tab === 'listado') loadTodos();
  }, [tab]);

  const verCombos = async (id) => {
    try {
      const data = await api.combos(id);
      setCombos({ id, items: Array.isArray(data) ? data : [] });
    } catch {
      setCombos({ id, items: [] });
    }
  };

  return (
    <>
      <h2 className="h4 mb-3">Restaurantes</h2>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'registrar' ? 'active' : ''}`} type="button" onClick={() => setTab('registrar')}>Registrar</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'listado' ? 'active' : ''}`} type="button" onClick={() => setTab('listado')}>Listado</button></li>
      </ul>

      {tab === 'registrar' && (
        <div className="card">
          <div className="card-body">
            {mensaje && <div className={`alert ${mensaje.startsWith('Error') ? 'alert-danger' : 'alert-success'}`}>{mensaje}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-2">
                <div className="col-12"><label className="form-label">Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
                <div className="col-md-6"><label className="form-label">Cédula jurídica</label><input className="form-control" value={form.cedulaJuridica} onChange={e => setForm(f => ({ ...f, cedulaJuridica: e.target.value }))} required /></div>
                <div className="col-md-6"><label className="form-label">Tipo comida</label><select className="form-select" value={form.tipoComida} onChange={e => setForm(f => ({ ...f, tipoComida: e.target.value }))}>{TIPOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div className="col-12"><label className="form-label">Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} /></div>
                <div className="col-12"><button type="submit" className="btn btn-cleta">Registrar restaurante</button></div>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === 'listado' && (
        <div className="card">
          <div className="card-body">
            <button type="button" className="btn btn-outline-secondary btn-sm mb-2" onClick={loadTodos}>Actualizar</button>
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead><tr><th>Id</th><th>Nombre</th><th>Céd. jurídica</th><th>Dirección</th><th>Tipo</th><th></th></tr></thead>
                <tbody>
                  {lista.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td>{r.nombre}</td><td>{r.cedulaJuridica}</td><td>{r.direccion}</td><td>{String(r.tipoComida)}</td>
                      <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => verCombos(r.id)}>Combos</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lista.length === 0 && <p className="text-muted mb-0">Sin restaurantes o no se pudo conectar al backend.</p>}
          </div>
        </div>
      )}

      {combos && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" onClick={() => setCombos(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Combos - Restaurante #{combos.id}</h5><button type="button" className="btn-close" onClick={() => setCombos(null)} aria-label="Cerrar" /></div>
              <div className="modal-body">
                <ul className="list-group list-group-flush">
                  {combos.items.length === 0 ? <li className="list-group-item text-muted">Sin combos definidos.</li> : combos.items.map(c => <li key={c.id} className="list-group-item d-flex justify-content-between"><span>#{c.numeroCombo} {c.descripcion}</span><span>{Number(c.precio).toLocaleString('es-CR')} ₡</span></li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
