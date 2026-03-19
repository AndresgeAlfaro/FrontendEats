import { useState, useEffect } from 'react';
import { clientes } from '../api';

export default function Clientes() {
  const [form, setForm] = useState({ cedula: '', nombre: '', direccion: '', tarjeta: '', celular: '', correo: '' });
  const [mensaje, setMensaje] = useState('');
  const [activos, setActivos] = useState([]);
  const [suspendidos, setSuspendidos] = useState([]);
  const [tab, setTab] = useState('registrar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const r = await clientes.registrar(form);
      setMensaje(r.mensaje || 'Registrado.');
      setForm({ cedula: '', nombre: '', direccion: '', tarjeta: '', celular: '', correo: '' });
    } catch (err) {
      setMensaje(err.message || 'Error al registrar.');
    }
  };

  const loadActivos = async () => {
    try {
      const data = await clientes.activos();
      setActivos(Array.isArray(data) ? data : []);
    } catch {
      setActivos([]);
    }
  };

  const loadSuspendidos = async () => {
    try {
      const data = await clientes.suspendidos();
      setSuspendidos(Array.isArray(data) ? data : []);
    } catch {
      setSuspendidos([]);
    }
  };

  useEffect(() => {
    if (tab === 'activos') loadActivos();
    if (tab === 'suspendidos') loadSuspendidos();
  }, [tab]);

  return (
    <>
      <h2 className="h4 mb-3">Clientes</h2>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'registrar' ? 'active' : ''}`} type="button" onClick={() => setTab('registrar')}>Registrar</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'activos' ? 'active' : ''}`} type="button" onClick={() => setTab('activos')}>Activos</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'suspendidos' ? 'active' : ''}`} type="button" onClick={() => setTab('suspendidos')}>Suspendidos</button></li>
      </ul>

      {tab === 'registrar' && (
        <div className="card">
          <div className="card-body">
            {mensaje && <div className={`alert ${mensaje.startsWith('Error') ? 'alert-danger' : 'alert-success'}`}>{mensaje}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-2">
                <div className="col-md-6"><label className="form-label">Cédula</label><input className="form-control" value={form.cedula} onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))} required /></div>
                <div className="col-md-6"><label className="form-label">Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
                <div className="col-12"><label className="form-label">Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} /></div>
                <div className="col-md-6"><label className="form-label">Tarjeta</label><input className="form-control" value={form.tarjeta} onChange={e => setForm(f => ({ ...f, tarjeta: e.target.value }))} /></div>
                <div className="col-md-6"><label className="form-label">Celular</label><input className="form-control" value={form.celular} onChange={e => setForm(f => ({ ...f, celular: e.target.value }))} /></div>
                <div className="col-12"><label className="form-label">Correo</label><input type="email" className="form-control" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} /></div>
                <div className="col-12"><button type="submit" className="btn btn-cleta">Registrar cliente</button></div>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === 'activos' && (
        <div className="card">
          <div className="card-body">
            <button type="button" className="btn btn-outline-secondary btn-sm mb-2" onClick={loadActivos}>Actualizar</button>
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead><tr><th>Id</th><th>Cédula</th><th>Nombre</th><th>Estado</th></tr></thead>
                <tbody>
                  {activos.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.cedula}</td><td>{c.nombre}</td><td>{String(c.estado)}</td></tr>)}
                </tbody>
              </table>
            </div>
            {activos.length === 0 && <p className="text-muted mb-0">Sin clientes activos o no se pudo conectar al backend.</p>}
          </div>
        </div>
      )}

      {tab === 'suspendidos' && (
        <div className="card">
          <div className="card-body">
            <button type="button" className="btn btn-outline-secondary btn-sm mb-2" onClick={loadSuspendidos}>Actualizar</button>
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead><tr><th>Id</th><th>Cédula</th><th>Nombre</th><th>Estado</th></tr></thead>
                <tbody>
                  {suspendidos.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.cedula}</td><td>{c.nombre}</td><td>{String(c.estado)}</td></tr>)}
                </tbody>
              </table>
            </div>
            {suspendidos.length === 0 && <p className="text-muted mb-0">Sin clientes suspendidos o no se pudo conectar al backend.</p>}
          </div>
        </div>
      )}
    </>
  );
}
