import { useState, useEffect } from 'react';
import { repartidores } from '../api';

export default function Repartidores() {
  const [form, setForm] = useState({ cedula: '', nombre: '', correo: '', direccion: '', celular: '', tarjeta: '' });
  const [mensaje, setMensaje] = useState('');
  const [lista, setLista] = useState([]);
  const [tab, setTab] = useState('registrar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const r = await repartidores.registrar(form);
      setMensaje(r.mensaje || 'Registrado.');
      setForm({ cedula: '', nombre: '', correo: '', direccion: '', celular: '', tarjeta: '' });
    } catch (err) {
      setMensaje(err.message || 'Error.');
    }
  };

  const load = async () => {
    try {
      const data = tab === 'todos' ? await repartidores.todos() : await repartidores.ceroAmonestaciones();
      setLista(Array.isArray(data) ? data : []);
    } catch {
      setLista([]);
    }
  };

  useEffect(() => {
    if (tab === 'todos' || tab === 'cero') load();
  }, [tab]);

  return (
    <>
      <h2 className="h4 mb-3">Repartidores</h2>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'registrar' ? 'active' : ''}`} type="button" onClick={() => setTab('registrar')}>Registrar</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'todos' ? 'active' : ''}`} type="button" onClick={() => setTab('todos')}>Todos</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'cero' ? 'active' : ''}`} type="button" onClick={() => setTab('cero')}>0 amonestaciones</button></li>
      </ul>

      {tab === 'registrar' && (
        <div className="card">
          <div className="card-body">
            {mensaje && <div className={`alert ${mensaje.startsWith('Error') ? 'alert-danger' : 'alert-success'}`}>{mensaje}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-2">
                <div className="col-md-6"><label className="form-label">Cédula</label><input className="form-control" value={form.cedula} onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))} required /></div>
                <div className="col-md-6"><label className="form-label">Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
                <div className="col-md-6"><label className="form-label">Correo</label><input type="email" className="form-control" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} /></div>
                <div className="col-md-6"><label className="form-label">Celular</label><input className="form-control" value={form.celular} onChange={e => setForm(f => ({ ...f, celular: e.target.value }))} /></div>
                <div className="col-12"><label className="form-label">Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} /></div>
                <div className="col-12"><label className="form-label">Tarjeta</label><input className="form-control" value={form.tarjeta} onChange={e => setForm(f => ({ ...f, tarjeta: e.target.value }))} /></div>
                <div className="col-12"><button type="submit" className="btn btn-cleta">Registrar repartidor</button></div>
              </div>
            </form>
          </div>
        </div>
      )}

      {(tab === 'todos' || tab === 'cero') && (
        <div className="card">
          <div className="card-body">
            <button type="button" className="btn btn-outline-secondary btn-sm mb-2" onClick={load}>Actualizar</button>
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead><tr><th>Id</th><th>Nombre</th><th>Cédula</th><th>Estado</th><th>Amonestaciones</th></tr></thead>
                <tbody>
                  {lista.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.nombre}</td><td>{r.cedula}</td><td>{String(r.estado)}</td><td>{r.numeroAmonestaciones}</td></tr>)}
                </tbody>
              </table>
            </div>
            {lista.length === 0 && <p className="text-muted mb-0">Sin datos o no se pudo conectar al backend.</p>}
          </div>
        </div>
      )}
    </>
  );
}
