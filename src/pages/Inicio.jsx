export default function Inicio() {
  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm bg-white">
          <div className="card-body p-4 p-lg-5">
            <h1 className="h3 mb-3 text-success">CletaEats</h1>
            <p className="text-muted mb-4">
              Consola para la API <strong>ASP.NET + SQLite</strong> en <code>http://localhost:5000</code>. Usa la barra superior
              para clientes, restaurantes, repartidores, pedidos y reportes. La aplicación principal del monorepo (Supabase)
              está en la ruta sin <code>#dotnet</code> o en <a href="#/">App Supabase</a>.
            </p>
            <ul className="list-unstyled">
              <li className="mb-2"><strong>Clientes:</strong> Registrar y listar activos/suspendidos.</li>
              <li className="mb-2"><strong>Restaurantes:</strong> Registrar y ver listado con combos.</li>
              <li className="mb-2"><strong>Repartidores:</strong> Registrar y listar (incl. cero amonestaciones).</li>
              <li className="mb-2"><strong>Pedidos:</strong> Realizar pedido y marcar como entregado.</li>
              <li className="mb-2"><strong>Reportes:</strong> Montos, hora pico, quejas, etc.</li>
            </ul>
            <p className="small text-muted mt-3 mb-0">
              Asegúrate de tener el backend en ejecución en <code>http://localhost:5000</code> (ej. <code>dotnet run</code> en la carpeta del backend).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
