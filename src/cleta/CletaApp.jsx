import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCleta } from './CletaContext';
import { DeliveryFoodAssets } from './deliveryAssets';
import {
  CompactChip,
  DrawerThumb,
  HeroBanner,
  ImageOutlinedRow,
  ImagePrimaryRow,
  ToolbarIconButton,
} from './DeliveryUi';
import { isLoggedIn as persistIsLoggedIn } from './sessionManager';
import * as sbRepo from './backendRemoteRepository';

const DrawerPage = {
  HOME: 'HOME',
  RESTAURANTES: 'RESTAURANTES',
  CLIENTES: 'CLIENTES',
  PEDIDOS: 'PEDIDOS',
  REPARTIDORES: 'REPARTIDORES',
  REPORTES: 'REPORTES',
};

const PAGE_TITLE = {
  [DrawerPage.HOME]: 'Inicio',
  [DrawerPage.RESTAURANTES]: 'Restaurantes',
  [DrawerPage.CLIENTES]: 'Clientes',
  [DrawerPage.PEDIDOS]: 'Pedidos',
  [DrawerPage.REPARTIDORES]: 'Repartidores',
  [DrawerPage.REPORTES]: 'Reportes',
};

function thumbForPage(p) {
  const m = {
    [DrawerPage.HOME]: DeliveryFoodAssets.HOME,
    [DrawerPage.RESTAURANTES]: DeliveryFoodAssets.RESTAURANTS,
    [DrawerPage.CLIENTES]: DeliveryFoodAssets.CLIENTS,
    [DrawerPage.PEDIDOS]: DeliveryFoodAssets.ORDERS,
    [DrawerPage.REPARTIDORES]: DeliveryFoodAssets.RIDERS,
    [DrawerPage.REPORTES]: DeliveryFoodAssets.REPORTS,
  };
  return m[p];
}

function drawerPages(role) {
  if (role === 'ADMIN') {
    return [
      DrawerPage.HOME,
      DrawerPage.RESTAURANTES,
      DrawerPage.CLIENTES,
      DrawerPage.PEDIDOS,
      DrawerPage.REPARTIDORES,
      DrawerPage.REPORTES,
    ];
  }
  if (role === 'CLIENTE') {
    return [DrawerPage.HOME, DrawerPage.RESTAURANTES, DrawerPage.PEDIDOS, DrawerPage.REPORTES];
  }
  return [
    DrawerPage.HOME,
    DrawerPage.RESTAURANTES,
    DrawerPage.REPARTIDORES,
    DrawerPage.PEDIDOS,
    DrawerPage.REPORTES,
  ];
}

function roleLabel(role) {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'RESTAURANTE') return 'Restaurante';
  return 'Cliente';
}

export default function CletaApp() {
  const [authView, setAuthView] = useState(() => (persistIsLoggedIn() ? 'main' : 'login'));
  const cleta = useCleta();

  const goMain = useCallback(() => setAuthView('main'), []);
  const goLogin = useCallback(() => setAuthView('login'), []);

  if (authView === 'login') {
    return <LoginRoute onLoggedIn={goMain} onRegister={() => setAuthView('register')} />;
  }
  if (authView === 'register') {
    return <RegisterRoute onBack={() => setAuthView('login')} />;
  }
  return <MainShell onLogout={goLogin} />;
}

function LoginRoute({ onLoggedIn, onRegister }) {
  const {
    loginSupabase,
    sessionLogin,
    validateUser,
    userGetRole,
    userGetRestauranteId,
    userGetClienteCedula,
    loadFromSupabase,
    UserManagerConstants,
  } = useCleta();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [snack, setSnack] = useState('');

  const doLogin = async () => {
    setSnack('');
    const username = usuario.trim();
    const password = clave;
    if (!username || !password) {
      setSnack('Ingrese usuario y contraseña');
      return;
    }
    if (username.includes('@')) {
      const emailNorm = username.toLowerCase();
      const res = await loginSupabase(emailNorm, password);
      if (!res.ok) {
        setSnack(res.message);
        return;
      }
      const cedula =
        (res.clientesActivos || []).find((c) => c.correo.toLowerCase() === emailNorm)?.cedula || '';
      sessionLogin(emailNorm, 'CLIENTE', null, cedula || null);
      onLoggedIn();
      return;
    }
    if (validateUser(username, password)) {
      const role = userGetRole(username);
      const restId = userGetRestauranteId(username);
      const cedula = userGetClienteCedula(username);
      sessionLogin(username, role, restId, cedula || null);
      await loadFromSupabase();
      onLoggedIn();
    } else {
      setSnack('Credenciales incorrectas');
    }
  };

  return (
    <div className="delivery-auth">
      {snack ? <div className="alert alert-warning small mx-3 mt-2 mb-0">{snack}</div> : null}
      <div className="delivery-auth__inner px-4 py-3">
        <HeroBanner imageUrl={DeliveryFoodAssets.HERO_AUTH} compact bottomCaption="CletaEats" />
        <p className="small text-muted mt-3 mb-2">
          Admin: {UserManagerConstants.DEFAULT_USER} / {UserManagerConstants.DEFAULT_PASSWORD} · Restaurante (Pizza Cleta):{' '}
          {UserManagerConstants.RESTAURANTE_USER} / {UserManagerConstants.RESTAURANTE_PASSWORD}
        </p>
        <label className="form-label small mb-1">Usuario o correo</label>
        <input className="form-control mb-2" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <label className="form-label small mb-1">Contraseña</label>
        <input
          type="password"
          className="form-control mb-3"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
        <ImagePrimaryRow
          imageUrl={DeliveryFoodAssets.LOGIN_ACTION}
          title="Iniciar sesión"
          subtitle="Correo con @ para Supabase · sin @ para admin/restaurante"
          onClick={doLogin}
        />
        <div className="mt-2">
          <ImageOutlinedRow
            imageUrl={DeliveryFoodAssets.REGISTER_OUTLINE}
            title="Registrarse como cliente"
            subtitle="Nueva cuenta con correo"
            onClick={onRegister}
          />
        </div>
      </div>
    </div>
  );
}

function RegisterRoute({ onBack }) {
  const { registerSupabase, crearClienteRemoto, userExists, registerClienteCompleto, ui } = useCleta();
  const [form, setForm] = useState({
    clave: '',
    confirm: '',
    cedula: '',
    nombre: '',
    direccion: '',
    tarjeta: '',
    celular: '',
    correo: '',
  });
  const [snack, setSnack] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSnack('');
    const { clave, confirm, cedula, nombre, direccion, tarjeta, celular, correo } = form;
    if (!clave || !confirm || !cedula.trim() || !nombre.trim() || !correo.trim()) {
      setSnack('Complete todos los campos obligatorios');
      return;
    }
    if (!correo.includes('@')) {
      setSnack('Ingrese un correo válido para Supabase');
      return;
    }
    const correoNorm = correo.trim().toLowerCase();
    if (correoNorm.length < 4) {
      setSnack('Correo: mínimo 4 caracteres');
      return;
    }
    if (clave.length < 6) {
      setSnack('Contraseña: mínimo 6 caracteres (Supabase Auth no acepta menos)');
      return;
    }
    if (clave !== confirm) {
      setSnack('Las contraseñas no coinciden');
      return;
    }
    if (userExists(correoNorm)) {
      setSnack('Ya existe una cuenta con ese correo');
      return;
    }
    const reg = await registerSupabase(correoNorm, clave);
    setSnack(reg.message);
    if (!reg.ok) return;
    const msgRepo = await crearClienteRemoto(
      cedula.trim(),
      nombre,
      direccion,
      tarjeta,
      celular,
      correoNorm,
    );
    setSnack(msgRepo);
    if (!msgRepo.startsWith('Error')) {
      registerClienteCompleto(correoNorm, clave, cedula.trim());
      onBack();
    }
  };

  return (
    <div className="delivery-auth">
      <nav className="navbar navbar-light bg-white border-bottom px-3">
        <ToolbarIconButton imageUrl={DeliveryFoodAssets.BACK_ARROW} onClick={onBack} label="Volver" />
        <span className="navbar-brand mb-0 h6">Registro de cliente</span>
      </nav>
      <div className="px-4 py-3">
        {snack ? <div className="alert alert-info small">{snack}</div> : null}
        <HeroBanner imageUrl={DeliveryFoodAssets.HERO_AUTH} compact bottomCaption={null} />
        <p className="small text-muted mt-2">
          El correo es su usuario para iniciar sesión (Supabase). Complete también los datos del cliente.
        </p>
        {[
          ['correo', 'Correo (usuario)'],
          ['clave', 'Contraseña'],
          ['confirm', 'Confirmar contraseña'],
          ['cedula', 'Cédula'],
          ['nombre', 'Nombre'],
          ['direccion', 'Dirección'],
          ['tarjeta', 'Tarjeta'],
          ['celular', 'Celular'],
        ].map(([k, label]) => (
          <div key={k} className="mb-2">
            <label className="form-label small mb-0">{label}</label>
            <input
              type={k === 'clave' || k === 'confirm' ? 'password' : 'text'}
              className="form-control"
              value={form[k]}
              onChange={(e) => set(k, e.target.value)}
            />
          </div>
        ))}
        <ImagePrimaryRow
          imageUrl={DeliveryFoodAssets.NEW_RESTAURANT}
          title={ui.isLoading ? 'Guardando…' : 'Registrar'}
          subtitle="Crear cuenta y cliente en Supabase"
          onClick={submit}
          enabled={!ui.isLoading}
          loading={ui.isLoading}
        />
      </div>
    </div>
  );
}

function MainShell({ onLogout }) {
  const {
    ui,
    loadFromSupabase,
    clearMessages,
    getLoggedUser,
    sessionGetRole,
    sessionGetRestauranteId,
    sessionGetClienteCedula,
    logout,
  } = useCleta();
  const role = sessionGetRole();
  const pages = useMemo(() => drawerPages(role), [role]);
  const [page, setPage] = useState(DrawerPage.HOME);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  useEffect(() => {
    if (ui.errorMessage) {
      setSnack(ui.errorMessage);
      clearMessages();
    }
  }, [ui.errorMessage, clearMessages]);

  useEffect(() => {
    if (!pages.includes(page)) setPage(DrawerPage.HOME);
  }, [pages, page]);

  const closeDrawer = () => {
    const el = document.getElementById('cletaDrawer');
    if (el && window.bootstrap) {
      const inst = window.bootstrap.Offcanvas.getInstance(el);
      inst?.hide();
    }
  };

  const openDrawer = () => {
    const el = document.getElementById('cletaDrawer');
    if (el && window.bootstrap) {
      window.bootstrap.Offcanvas.getOrCreateInstance(el).show();
    }
  };

  const doLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="delivery-shell d-flex flex-column min-vh-100">
      {snack ? (
        <div className="alert alert-secondary rounded-0 small mb-0 py-2 border-0 border-bottom">
          {snack}
        </div>
      ) : null}
      <nav className="navbar navbar-light bg-white border-bottom shadow-sm sticky-top">
        <div className="container-fluid d-flex align-items-center gap-2">
          <ToolbarIconButton imageUrl={DeliveryFoodAssets.MENU_BURGER} onClick={openDrawer} label="Menú lateral" />
          <span className="navbar-brand mb-0 h6 text-truncate">
            {role === 'RESTAURANTE' && page === DrawerPage.RESTAURANTES ? 'Mi menú' : PAGE_TITLE[page]}
          </span>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="cletaDrawer"
        aria-labelledby="cletaDrawerLabel"
      >
        <div className="offcanvas-header border-bottom">
          <div>
            <h5 className="offcanvas-title" id="cletaDrawerLabel">
              CletaEats
            </h5>
            <div className="small">{getLoggedUser() || 'Usuario'}</div>
            <div className="small text-muted">{roleLabel(role)}</div>
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar" />
        </div>
        <div className="offcanvas-body p-0">
          <div className="list-group list-group-flush">
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  page === p ? 'active' : ''
                }`}
                onClick={() => {
                  setPage(p);
                  closeDrawer();
                }}
              >
                <DrawerThumb imageUrl={thumbForPage(p)} size={44} />
                {role === 'RESTAURANTE' && p === DrawerPage.RESTAURANTES ? 'Mi menú' : PAGE_TITLE[p]}
              </button>
            ))}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center gap-2 text-danger"
              onClick={doLogout}
            >
              <DrawerThumb imageUrl={DeliveryFoodAssets.LOGOUT} size={44} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow-1 delivery-main">
        {ui.isLoading ? (
          <div className="progress rounded-0" style={{ height: 3 }}>
            <div className="progress-bar bg-success progress-bar-striped progress-bar-animated w-100" />
          </div>
        ) : null}
        <div className="container-fluid px-3 py-3">
          {page === DrawerPage.HOME ? (
            <HomeContent role={role} onGo={setPage} />
          ) : null}
          {page === DrawerPage.RESTAURANTES ? (
            <RestaurantesBody
              role={role}
              cedulaCliente={sessionGetClienteCedula()}
              idRestauranteSesion={sessionGetRestauranteId()}
            />
          ) : null}
          {page === DrawerPage.CLIENTES ? <ClientesBody /> : null}
          {page === DrawerPage.PEDIDOS ? (
            <PedidosBody
              role={role}
              idRest={sessionGetRestauranteId()}
              cedulaCliente={sessionGetClienteCedula()}
            />
          ) : null}
          {page === DrawerPage.REPARTIDORES ? (
            <RepartidoresBody role={role} idRest={sessionGetRestauranteId()} />
          ) : null}
          {page === DrawerPage.REPORTES ? (
            <ReportesBody role={role} cedulaCliente={sessionGetClienteCedula()} />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function HomeContent({ role, onGo }) {
  const { testInternetConnection, getLoggedUser } = useCleta();
  const [conn, setConn] = useState(null);
  const [testing, setTesting] = useState(false);
  const user = getLoggedUser();

  const modulos = useMemo(() => {
    if (role === 'ADMIN') {
      return [
        { dest: DrawerPage.RESTAURANTES, t: 'Restaurantes', d: 'Registrar locales', i: DeliveryFoodAssets.RESTAURANTS },
        { dest: DrawerPage.CLIENTES, t: 'Clientes', d: 'Consulta', i: DeliveryFoodAssets.CLIENTS },
        { dest: DrawerPage.PEDIDOS, t: 'Pedidos', d: 'Todos', i: DeliveryFoodAssets.ORDERS },
        { dest: DrawerPage.REPARTIDORES, t: 'Repartidores', d: 'Consulta', i: DeliveryFoodAssets.RIDERS },
        { dest: DrawerPage.REPORTES, t: 'Reportes', d: 'Indicadores', i: DeliveryFoodAssets.REPORTS },
      ];
    }
    if (role === 'CLIENTE') {
      return [
        { dest: DrawerPage.RESTAURANTES, t: 'Restaurantes', d: 'Ver menú y pedir', i: DeliveryFoodAssets.RESTAURANTS },
        { dest: DrawerPage.PEDIDOS, t: 'Mis pedidos', d: 'Historial', i: DeliveryFoodAssets.ORDERS },
        { dest: DrawerPage.REPORTES, t: 'Reportes', d: 'Enviar y consultar', i: DeliveryFoodAssets.REPORTS },
      ];
    }
    return [
      { dest: DrawerPage.RESTAURANTES, t: 'Mi menú', d: 'Platos del local (consulta)', i: DeliveryFoodAssets.RESTAURANTS },
      { dest: DrawerPage.REPARTIDORES, t: 'Repartidores', d: 'Registrar equipo', i: DeliveryFoodAssets.RIDERS },
      { dest: DrawerPage.PEDIDOS, t: 'Pedidos', d: 'De tu local', i: DeliveryFoodAssets.ORDERS },
      { dest: DrawerPage.REPORTES, t: 'Reportes', d: 'Indicadores', i: DeliveryFoodAssets.REPORTS },
    ];
  }, [role]);

  return (
    <div>
      <h1 className="h5 mt-1 mb-2">Hola, {user || 'invitado'}</h1>
      <p className="text-muted small mb-2">Elija un módulo abajo o use el menú lateral (☰).</p>
      <ImageOutlinedRow
        imageUrl={DeliveryFoodAssets.NETWORK}
        title={testing ? 'Probando conexión…' : 'Probar conexión al servidor'}
        subtitle="Backend + Supabase (misma base que la app móvil)"
        enabled={!testing}
        onClick={() => {
          setTesting(true);
          setConn(null);
          testInternetConnection((r) => {
            setConn(r);
            setTesting(false);
          });
        }}
      />
      {conn ? (
        <div
          className={`card border-0 my-2 ${conn.startsWith('Éxito') ? 'bg-success-subtle' : 'bg-danger-subtle'}`}
        >
          <div className="card-body small py-2">{conn}</div>
        </div>
      ) : null}
      <p className="delivery-section-label">Accesos rápidos</p>
      <div className="d-flex flex-column gap-2">
        {modulos.map((m) => (
          <ImageOutlinedRow
            key={m.dest}
            imageUrl={m.i}
            title={m.t}
            subtitle={m.d}
            onClick={() => onGo(m.dest)}
          />
        ))}
      </div>
    </div>
  );
}

function RestaurantesBody({ role, cedulaCliente, idRestauranteSesion }) {
  const {
    ui,
    crearRestauranteRemoto,
    actualizarRestauranteRemoto,
    eliminarRestauranteRemoto,
    realizarPedido,
    agregarComboRemoto,
    eliminarComboRemoto,
    actualizarComboRemoto,
  } = useCleta();
  const [snack, setSnack] = useState('');
  const [nombre, setNombre] = useState('');
  const [cedJur, setCedJur] = useState('');
  const [dir, setDir] = useState('');
  const [tipo, setTipo] = useState('');
  const [edit, setEdit] = useState(null);
  const [borrar, setBorrar] = useState(null);

  const [idRest, setIdRest] = useState(ui.restaurantes[0]?.id ?? 1);
  const [distancia, setDistancia] = useState(1);
  const [feriado, setFeriado] = useState(false);
  const [cartLines, setCartLines] = useState([]);
  const [apiCombos, setApiCombos] = useState([]);
  const [comboReloadTick, setComboReloadTick] = useState(0);
  const [menuDesc, setMenuDesc] = useState('');
  const [menuPrecio, setMenuPrecio] = useState('');
  const [menuNumOpcional, setMenuNumOpcional] = useState('');
  const [editComboNum, setEditComboNum] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editPrecio, setEditPrecio] = useState('');

  const restIdForCombos =
    role === 'RESTAURANTE'
      ? idRestauranteSesion ?? ui.restaurantes[0]?.id ?? 1
      : idRest;

  const bumpComboQty = (combo, delta) => {
    setCartLines((prev) => {
      const idx = prev.findIndex((l) => l.numeroCombo === combo.numeroCombo);
      if (idx < 0) {
        if (delta <= 0) return prev;
        return [
          {
            numeroCombo: combo.numeroCombo,
            descripcion: combo.descripcion,
            precioUnitario: combo.precio,
            cantidad: delta,
          },
          ...prev,
        ];
      }
      const next = [...prev];
      const q = Math.max(0, next[idx].cantidad + delta);
      if (q === 0) next.splice(idx, 1);
      else next[idx] = { ...next[idx], cantidad: q };
      return next;
    });
  };

  const qtyEnCarrito = (numeroCombo) =>
    cartLines.find((l) => l.numeroCombo === numeroCombo)?.cantidad ?? 0;

  const cartSubtotal = cartLines.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0);

  useEffect(() => {
    if (ui.restaurantes.length && !ui.restaurantes.some((r) => r.id === idRest)) {
      setIdRest(ui.restaurantes[0].id);
    }
  }, [ui.restaurantes, idRest]);

  useEffect(() => {
    if (role === 'ADMIN') return;
    let cancel = false;
    (async () => {
      try {
        const r = await sbRepo.getCombos(restIdForCombos);
        if (cancel) return;
        setApiCombos(r.ok ? r.list : []);
      } catch {
        if (!cancel) setApiCombos([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [role, restIdForCombos, comboReloadTick]);

  useEffect(() => {
    if (role !== 'CLIENTE') return;
    setCartLines([]);
  }, [idRest, role]);

  if (role === 'ADMIN') {
    return (
      <div className="delivery-scroll">
        {snack ? <div className="alert alert-secondary small">{snack}</div> : null}
        <h2 className="h6">Nuevo restaurante</h2>
        <input className="form-control mb-2" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input className="form-control mb-2" placeholder="Cédula jurídica" value={cedJur} onChange={(e) => setCedJur(e.target.value)} />
        <input className="form-control mb-2" placeholder="Dirección" value={dir} onChange={(e) => setDir(e.target.value)} />
        <input className="form-control mb-2" placeholder="Tipo de comida" value={tipo} onChange={(e) => setTipo(e.target.value)} />
        <ImagePrimaryRow
          imageUrl={DeliveryFoodAssets.NEW_RESTAURANT}
          title={ui.isLoading ? 'Guardando…' : 'Registrar restaurante'}
          subtitle="Persistido en el servidor (backend)"
          onClick={async () => {
            const msg = await crearRestauranteRemoto(nombre, cedJur, dir, tipo);
            setSnack(msg);
          }}
          enabled={!ui.isLoading}
          loading={ui.isLoading}
        />
        <h2 className="h6 mt-4">Restaurantes registrados</h2>
        {ui.restaurantes.map((r) => (
          <div key={r.id} className="card mb-2 shadow-sm">
            <div className="card-body py-2">
              <div className="fw-medium">
                {r.nombre} (id={r.id})
              </div>
              <div className="small text-muted">
                {r.tipoComida} · {r.direccion}
              </div>
              <div className="small text-muted">Cédula jurídica: {r.cedulaJuridica}</div>
              <div className="d-flex gap-2 mt-2 flex-wrap">
                <CompactChip imageUrl={DeliveryFoodAssets.EDIT} label="Editar" onClick={() => setEdit(r)} />
                <CompactChip
                  imageUrl={DeliveryFoodAssets.DELETE}
                  label="Eliminar"
                  outlined
                  onClick={() => setBorrar(r)}
                />
              </div>
            </div>
          </div>
        ))}

        {edit ? (
          <EditRestauranteModal
            r={edit}
            onClose={() => setEdit(null)}
            onSave={async (payload) => {
              const msg = await actualizarRestauranteRemoto(
                edit.id,
                payload.nombre,
                payload.cedulaJuridica,
                payload.direccion,
                payload.tipoComida,
              );
              setSnack(msg);
              if (!msg.startsWith('Error')) setEdit(null);
            }}
          />
        ) : null}
        {borrar ? (
          <ConfirmModal
            title="Eliminar restaurante"
            text={`¿Eliminar «${borrar.nombre}» y sus combos en la base de datos?`}
            onCancel={() => setBorrar(null)}
            onConfirm={async () => {
              const msg = await eliminarRestauranteRemoto(borrar.id);
              setSnack(msg);
              setBorrar(null);
            }}
          />
        ) : null}
      </div>
    );
  }

  if (role === 'CLIENTE') {
    const selNombre = ui.restaurantes.find((r) => r.id === idRest)?.nombre ?? '';
    return (
      <div className="delivery-scroll">
        {snack ? <div className="alert alert-secondary small">{snack}</div> : null}
        <p className="small text-muted mb-2">
          Elija local → agregue platos al carrito con «−» / «+» → confirme el pedido (como Uber Eats / DiDi).
        </p>
        <h2 className="h6">Locales disponibles</h2>
        {ui.restaurantes.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`card mb-2 w-100 text-start border-0 shadow-sm ${idRest === r.id ? 'border border-success border-2' : ''}`}
            onClick={() => setIdRest(r.id)}
          >
            <div className="card-body py-2 d-flex gap-2">
              <DrawerThumb imageUrl={DeliveryFoodAssets.RESTAURANTS} size={48} />
              <div>
                <div className="fw-medium">{r.nombre}</div>
                <div className="small text-muted">{r.tipoComida}</div>
                <div className="small">{idRest === r.id ? 'Menú activo' : 'Tocar para ver menú'}</div>
              </div>
            </div>
          </button>
        ))}
        <h2 className="h6 mt-3">Menú · {selNombre || `Restaurante #${idRest}`}</h2>
        <div className="small text-muted mb-2">
          Cuenta: <span className="text-dark">{cedulaCliente || '—'}</span>
        </div>
        {apiCombos.length === 0 ? (
          <p className="small text-muted">No hay platos para este local.</p>
        ) : (
          apiCombos.map((c) => (
            <div
              key={c.numeroCombo}
              className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 border-bottom"
            >
              <div className="small flex-grow-1">
                <span className="fw-medium">{c.descripcion}</span>
                <span className="text-muted ms-1">₡{Number(c.precio).toFixed(0)}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => bumpComboQty(c, -1)}
                  disabled={qtyEnCarrito(c.numeroCombo) <= 0}
                  aria-label="Menos"
                >
                  −
                </button>
                <span className="small px-2" style={{ minWidth: '1.5rem', textAlign: 'center' }}>
                  {qtyEnCarrito(c.numeroCombo)}
                </span>
                <button type="button" className="btn btn-sm btn-success" onClick={() => bumpComboQty(c, 1)} aria-label="Más">
                  +
                </button>
              </div>
            </div>
          ))
        )}
        <div className="card mt-3 mb-2 border-0 shadow-sm bg-white">
          <div className="card-body py-2">
            <div className="fw-semibold small mb-2">Tu pedido</div>
            {cartLines.length === 0 ? (
              <p className="small text-muted mb-0">Todavía no agregó ningún plato.</p>
            ) : (
              <>
                {cartLines.map((l) => (
                  <div key={l.numeroCombo} className="d-flex justify-content-between small py-1 border-bottom border-light">
                    <span>
                      {l.descripcion} × {l.cantidad}
                    </span>
                    <span>₡{(l.precioUnitario * l.cantidad).toFixed(0)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-semibold small mt-2">
                  <span>Subtotal</span>
                  <span>₡{cartSubtotal.toFixed(0)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <details className="small mb-2">
          <summary className="fw-medium mb-1">Opciones de envío</summary>
          <label className="small">Distancia (km)</label>
          <input
            type="number"
            className="form-control mb-2"
            value={distancia}
            onChange={(e) => setDistancia(Number(e.target.value) || 0)}
          />
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={feriado}
              onChange={(e) => setFeriado(e.target.checked)}
              id="fer"
            />
            <label className="form-check-label" htmlFor="fer">
              Es feriado (tarifa)
            </label>
          </div>
        </details>
        <ImagePrimaryRow
          imageUrl={DeliveryFoodAssets.CONFIRM_ORDER}
          title={cartLines.length ? `Ir a pagar · ₡${cartSubtotal.toFixed(0)}` : 'Agrega platos al pedido'}
          subtitle="El pedido se registra en el servidor"
          enabled={cartLines.length > 0}
          onClick={async () => {
            if (!cedulaCliente) {
              setSnack('Sesión sin cédula. Vuelva a iniciar sesión.');
              return;
            }
            if (!cartLines.length) {
              setSnack('Agregue al menos un plato.');
              return;
            }
            const nombreRest =
              ui.restaurantes.find((x) => x.id === idRest)?.nombre || '';
            const msg = await realizarPedido(
              cedulaCliente,
              idRest,
              nombreRest,
              cartLines,
              distancia,
              feriado,
            );
            setSnack(msg);
          }}
        />
      </div>
    );
  }

  if (role === 'RESTAURANTE') {
    const rid = idRestauranteSesion ?? ui.restaurantes[0]?.id;
    const nombreLocal = ui.restaurantes.find((r) => r.id === rid)?.nombre ?? '';
    const bumpMenuReload = () => setComboReloadTick((t) => t + 1);
    if (!rid) {
      return (
        <div className="delivery-scroll">
          <p className="small text-muted">No hay restaurante asociado a su cuenta.</p>
        </div>
      );
    }
    return (
      <div className="delivery-scroll">
        {snack ? <div className="alert alert-secondary small">{snack}</div> : null}
        <p className="small text-muted mb-2">
          Gestione el menú en Supabase (máx. 9 platos por local, combos 1–9). Si falla, ejecute el script «supabase_extra.sql» (esquema completo) del Frontend en el SQL Editor de Supabase.
        </p>
        <h2 className="h6">{nombreLocal}</h2>
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="fw-semibold small mb-2">Nuevo plato</div>
            <label className="small text-muted">Nombre</label>
            <input
              className="form-control form-control-sm mb-2"
              value={menuDesc}
              onChange={(e) => setMenuDesc(e.target.value)}
              placeholder="Ej. Pizza mediana"
            />
            <label className="small text-muted">Precio (₡)</label>
            <input
              type="number"
              min="1"
              step="1"
              className="form-control form-control-sm mb-2"
              value={menuPrecio}
              onChange={(e) => setMenuPrecio(e.target.value)}
            />
            <label className="small text-muted">Nº combo (1–9, opcional)</label>
            <input
              type="number"
              min="1"
              max="9"
              className="form-control form-control-sm mb-2"
              value={menuNumOpcional}
              onChange={(e) => setMenuNumOpcional(e.target.value)}
              placeholder="Vacío = primer cupo libre"
            />
            <button
              type="button"
              className="btn btn-success btn-sm"
              disabled={ui.isLoading}
              onClick={async () => {
                setSnack('');
                const precio = Number(menuPrecio);
                const rawNum = menuNumOpcional.trim();
                const numOpt = rawNum === '' ? undefined : Number(rawNum);
                if (!menuDesc.trim()) {
                  setSnack('Indique el nombre del plato.');
                  return;
                }
                if (!Number.isFinite(precio) || precio <= 0) {
                  setSnack('Precio inválido.');
                  return;
                }
                if (
                  numOpt !== undefined &&
                  (!Number.isInteger(numOpt) || numOpt < 1 || numOpt > 9)
                ) {
                  setSnack('Número de combo debe ser entre 1 y 9.');
                  return;
                }
                const payload = { descripcion: menuDesc.trim(), precio };
                if (numOpt !== undefined) payload.numeroCombo = numOpt;
                const msg = await agregarComboRemoto(rid, payload);
                setSnack(msg);
                if (!msg.startsWith('Error')) {
                  setMenuDesc('');
                  setMenuPrecio('');
                  setMenuNumOpcional('');
                  bumpMenuReload();
                }
              }}
            >
              Publicar plato
            </button>
          </div>
        </div>
        {apiCombos.length === 0 ? (
          <p className="small text-muted">No hay platos listados para este local.</p>
        ) : (
          <ul className="list-group list-group-flush shadow-sm rounded">
            {apiCombos
              .slice()
              .sort((a, b) => b.numeroCombo - a.numeroCombo)
              .map((c) => (
                <li key={c.numeroCombo} className="list-group-item">
                  {editComboNum === c.numeroCombo ? (
                    <div className="d-flex flex-column gap-2">
                      <input
                        className="form-control form-control-sm"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="form-control form-control-sm"
                        value={editPrecio}
                        onChange={(e) => setEditPrecio(e.target.value)}
                      />
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          disabled={ui.isLoading}
                          onClick={async () => {
                            setSnack('');
                            const pr = Number(editPrecio);
                            if (!editDesc.trim()) {
                              setSnack('Nombre obligatorio.');
                              return;
                            }
                            if (!Number.isFinite(pr) || pr <= 0) {
                              setSnack('Precio inválido.');
                              return;
                            }
                            const msg = await actualizarComboRemoto(rid, c.numeroCombo, {
                              descripcion: editDesc.trim(),
                              precio: pr,
                            });
                            setSnack(msg);
                            if (!msg.startsWith('Error')) {
                              setEditComboNum(null);
                              bumpMenuReload();
                            }
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setEditComboNum(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <div className="small">
                        <span className="badge bg-secondary me-1">#{c.numeroCombo}</span>
                        <span className="fw-medium">{c.descripcion}</span>
                        <span className="text-muted ms-1">₡{Number(c.precio).toFixed(0)}</span>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setEditComboNum(c.numeroCombo);
                            setEditDesc(c.descripcion);
                            setEditPrecio(String(Number(c.precio)));
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={ui.isLoading}
                          onClick={async () => {
                            setSnack('');
                            const msg = await eliminarComboRemoto(rid, c.numeroCombo);
                            setSnack(msg);
                            bumpMenuReload();
                          }}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>
    );
  }

  return null;
}

function EditRestauranteModal({ r, onClose, onSave }) {
  const [nombre, setNombre] = useState(r.nombre);
  const [cedulaJuridica, setCedulaJuridica] = useState(r.cedulaJuridica);
  const [direccion, setDireccion] = useState(r.direccion);
  const [tipoComida, setTipoComida] = useState(r.tipoComida);
  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar restaurante</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
          </div>
          <div className="modal-body">
            <input className="form-control mb-2" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input className="form-control mb-2" value={cedulaJuridica} onChange={(e) => setCedulaJuridica(e.target.value)} />
            <input className="form-control mb-2" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            <input className="form-control mb-2" value={tipoComida} onChange={(e) => setTipoComida(e.target.value)} />
          </div>
          <div className="modal-footer d-flex justify-content-between">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => onSave({ nombre, cedulaJuridica, direccion, tipoComida })}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, text, onCancel, onConfirm }) {
  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel} />
          </div>
          <div className="modal-body">{text}</div>
          <div className="modal-footer d-flex justify-content-between">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientesBody() {
  const { ui } = useCleta();
  return (
    <div>
      <p className="small text-muted">Los clientes se registran solos en la app. Aquí solo consulta.</p>
      <h2 className="h6">Clientes activos</h2>
      {ui.clientesActivos.map((c) => (
        <div key={c.cedula} className="card mb-2 shadow-sm">
          <div className="card-body py-2 d-flex gap-2">
            <DrawerThumb imageUrl={DeliveryFoodAssets.CLIENTS} size={48} />
            <div>
              <div className="fw-medium">{c.nombre}</div>
              <div className="small text-muted">Cédula: {c.cedula}</div>
              <div className="small text-muted">{c.correo}</div>
            </div>
          </div>
        </div>
      ))}
      <h2 className="h6 mt-3">Suspendidos</h2>
      {ui.clientesSuspendidos.map((c) => (
        <div key={c.cedula} className="card mb-2 shadow-sm">
          <div className="card-body py-2 d-flex gap-2">
            <DrawerThumb imageUrl={DeliveryFoodAssets.CLIENTS} size={48} />
            <div>
              <div className="fw-medium">{c.nombre}</div>
              <div className="small text-muted">Cédula: {c.cedula}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PedidosBody({ role, idRest, cedulaCliente }) {
  const {
    ui,
    obtenerUbicacion,
    actualizarPedidoObservacion,
    eliminarPedido,
    marcarPedidoEntregado,
  } = useCleta();
  const [snack, setSnack] = useState('');
  const pedidosMostrados = useMemo(() => {
    if (role === 'ADMIN') return ui.pedidos;
    if (role === 'CLIENTE') return ui.pedidos.filter((p) => p.cedulaCliente === cedulaCliente);
    const id = idRest ?? -1;
    return ui.pedidos.filter((p) => p.idRestaurante === id);
  }, [ui.pedidos, role, idRest, cedulaCliente]);

  return (
    <div className="delivery-scroll">
      {snack ? <div className="alert alert-secondary small">{snack}</div> : null}
      <h2 className="h6 text-muted">Seguimiento</h2>
      <ImagePrimaryRow
        imageUrl={DeliveryFoodAssets.LOCATION}
        title="Obtener ubicación"
        subtitle="GPS del reparto (opcional)"
        enabled={!ui.isLoading}
        onClick={() => {
          obtenerUbicacion();
        }}
      />
      <p className="small text-muted mt-1 mb-3">{ui.userLocation}</p>
      {role === 'CLIENTE' ? (
        <div className="alert alert-light border small py-2 mb-3">
          <strong>Pedir comida:</strong> pestaña «Restaurantes» → carrito → confirmar. Aquí solo ve el historial.
        </div>
      ) : null}
      <h2 className="h6">
        {role === 'ADMIN' ? 'Todos los pedidos' : role === 'CLIENTE' ? 'Mis pedidos' : 'Pedidos de tu local'}
      </h2>
      {pedidosMostrados.length === 0 ? (
        <p className="small text-muted">No hay pedidos.</p>
      ) : (
        pedidosMostrados.map((p) => (
          <PedidoCard
            key={p.id}
            p={p}
            role={role}
            onObs={async (obs) => {
              const msg = await actualizarPedidoObservacion(p.id, obs);
              setSnack(msg);
            }}
            onMarcarEntregado={
              role === 'ADMIN' || role === 'RESTAURANTE'
                ? async () => {
                    const err = await marcarPedidoEntregado(p.id, p.idRepartidor);
                    setSnack(err || 'Pedido marcado como entregado.');
                  }
                : null
            }
            onDelete={async () => {
              const ok = await eliminarPedido(p.id);
              setSnack(ok ? 'Pedido eliminado' : 'No se pudo eliminar el pedido.');
            }}
          />
        ))
      )}
    </div>
  );
}

function PedidoCard({ p, role, onObs, onDelete, onMarcarEntregado }) {
  const [obs, setObs] = useState(p.observacion || '');
  const puedeEliminar = role === 'ADMIN' || role === 'CLIENTE';
  const yaEntregado =
    String(p.mensaje || '').includes('ENTREGADO') || String(p.estado || '') === 'ENTREGADO';
  const puedeMarcarEntregado =
    typeof onMarcarEntregado === 'function' && (p.idRepartidor ?? 0) > 0 && !yaEntregado;
  return (
    <div className="card mb-2 shadow-sm">
      <div className="card-body py-2">
        <div className="fw-medium">
          #{p.id} · {p.nombreRestaurante}
        </div>
        <div className="small text-muted">Cliente: {p.cedulaCliente}</div>
        {Array.isArray(p.items) && p.items.length > 0 ? (
          <ul className="small mb-1 ps-3">
            {p.items.map((it, idx) => (
              <li key={`${it.numeroCombo}-${idx}`}>
                {it.descripcion} × {it.cantidad}{' '}
                <span className="text-muted">₡{(Number(it.precioUnitario) * Number(it.cantidad)).toFixed(0)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="small">{p.mensaje}</div>
        <label className="small mt-1">Observación</label>
        <textarea className="form-control form-control-sm mb-2" value={obs} onChange={(e) => setObs(e.target.value)} />
        <div className="d-flex gap-2 flex-wrap">
          <CompactChip
            imageUrl={DeliveryFoodAssets.EDIT}
            label="Guardar observación"
            onClick={() => void onObs(obs)}
          />
          {puedeMarcarEntregado ? (
            <CompactChip
              imageUrl={DeliveryFoodAssets.REPORTS}
              label="Marcar entregado"
              onClick={() => void onMarcarEntregado()}
            />
          ) : null}
          {puedeEliminar ? (
            <CompactChip imageUrl={DeliveryFoodAssets.DELETE} label="Eliminar" outlined onClick={onDelete} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RepartidoresBody({ role, idRest }) {
  const { ui, registrarRepartidor, actualizarRepartidor, eliminarRepartidorLocal } = useCleta();
  const [snack, setSnack] = useState('');
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [celular, setCelular] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [edit, setEdit] = useState(null);
  const [borrar, setBorrar] = useState(null);

  const idSession = idRest ?? 0;
  const lista = useMemo(() => {
    if (role === 'ADMIN') return ui.repartidores;
    return ui.repartidores.filter(
      (r) => r.idRestaurante === idSession || r.idRestaurante < 0,
    );
  }, [ui.repartidores, role, idSession]);
  const ceroAm = useMemo(() => {
    if (role === 'ADMIN') return ui.repartidoresCeroAm;
    return ui.repartidoresCeroAm.filter(
      (r) => r.idRestaurante === idSession || r.idRestaurante < 0,
    );
  }, [ui.repartidoresCeroAm, role, idSession]);

  if (role === 'ADMIN') {
    return (
      <div className="delivery-scroll">
        <p className="small text-muted">
          Solo el dueño de cada local registra repartidores. Vista de todos (solo lectura).
        </p>
        {ui.repartidores.map((r) => (
          <div key={r.id} className="card mb-2 shadow-sm">
            <div className="card-body py-2 d-flex gap-2">
              <DrawerThumb imageUrl={DeliveryFoodAssets.RIDERS} size={56} />
              <div>
                <div className="fw-medium">{r.nombre}</div>
                <div className="small text-muted">
                  Local id {r.idRestaurante} · {r.cedula}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="delivery-scroll">
      {snack ? <div className="alert alert-secondary small">{snack}</div> : null}
      <h2 className="h6">Nuevo repartidor</h2>
      <input className="form-control mb-2" placeholder="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} />
      <input className="form-control mb-2" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input className="form-control mb-2" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} />
      <input className="form-control mb-2" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      <input className="form-control mb-2" placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} />
      <input className="form-control mb-2" placeholder="Tarjeta" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} />
      <ImagePrimaryRow
        imageUrl={DeliveryFoodAssets.RIDERS}
        title="Registrar repartidor"
        subtitle="Añadir a tu equipo de delivery"
        onClick={async () => {
          if (idSession <= 0) {
            setSnack('Sesión de restaurante inválida');
            return;
          }
          const msg = await registrarRepartidor(idSession, cedula, nombre, correo, direccion, celular, tarjeta);
          setSnack(msg);
        }}
      />
      <h2 className="h6 mt-3">Tu equipo</h2>
      {lista.map((r) => (
        <div key={r.id} className="card mb-2 shadow-sm">
          <div className="card-body py-2">
            <div className="fw-medium">{r.nombre}</div>
            <div className="small text-muted">
              Cédula: {r.cedula} · Amonestaciones: {r.amonestaciones}
            </div>
            <div className="d-flex gap-2 mt-2">
              <CompactChip imageUrl={DeliveryFoodAssets.EDIT} label="Editar" onClick={() => setEdit(r)} />
              <CompactChip imageUrl={DeliveryFoodAssets.DELETE} label="Eliminar" outlined onClick={() => setBorrar(r)} />
            </div>
          </div>
        </div>
      ))}
      <h2 className="h6 mt-2">Sin amonestaciones</h2>
      {ceroAm.map((r) => (
        <div key={r.id} className="small">
          · {r.nombre}
        </div>
      ))}

      {edit ? (
        <EditRepartidorModal
          r={edit}
          onClose={() => setEdit(null)}
          onSave={async (payload) => {
            const msg = await actualizarRepartidor({ ...edit, ...payload });
            setSnack(msg);
            if (!msg.startsWith('Error')) setEdit(null);
          }}
        />
      ) : null}
      {borrar ? (
        <ConfirmModal
          title="Eliminar repartidor"
          text={`¿Eliminar a ${borrar.nombre}?`}
          onCancel={() => setBorrar(null)}
          onConfirm={async () => {
            const ok = await eliminarRepartidorLocal(borrar.id);
            setSnack(ok ? 'Repartidor eliminado' : 'No se pudo eliminar');
            setBorrar(null);
          }}
        />
      ) : null}
    </div>
  );
}

function EditRepartidorModal({ r, onClose, onSave }) {
  const [cedula, setCedula] = useState(r.cedula);
  const [nombre, setNombre] = useState(r.nombre);
  const [correo, setCorreo] = useState(r.correo);
  const [direccion, setDireccion] = useState(r.direccion);
  const [celular, setCelular] = useState(r.celular);
  const [tarjeta, setTarjeta] = useState(r.tarjeta);
  const [am, setAm] = useState(r.amonestaciones);
  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar repartidor</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <input className="form-control mb-2" value={cedula} onChange={(e) => setCedula(e.target.value)} />
            <input className="form-control mb-2" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input className="form-control mb-2" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            <input className="form-control mb-2" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            <input className="form-control mb-2" value={celular} onChange={(e) => setCelular(e.target.value)} />
            <input className="form-control mb-2" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} />
            <input
              type="number"
              className="form-control mb-2"
              value={am}
              onChange={(e) => setAm(Number(e.target.value) || 0)}
            />
          </div>
          <div className="modal-footer d-flex justify-content-between">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() =>
                onSave({
                  cedula,
                  nombre,
                  correo,
                  direccion,
                  celular,
                  tarjeta,
                  amonestaciones: am,
                })
              }
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportesBody({ role, cedulaCliente }) {
  const { ui, registrarReporteCliente } = useCleta();
  const [titulo, setTitulo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [snack, setSnack] = useState('');
  const misReportes = useMemo(() => {
    if (role !== 'CLIENTE') return [];
    return ui.reportesCliente.filter((r) => r.cedulaCliente === cedulaCliente);
  }, [ui.reportesCliente, role, cedulaCliente]);

  return (
    <div className="delivery-scroll">
      {snack ? <div className="alert alert-secondary small">{snack}</div> : null}
      {role === 'CLIENTE' ? (
        <>
          <h2 className="h6">Nuevo reporte o queja</h2>
          <input className="form-control mb-2" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <textarea className="form-control mb-2" placeholder="Detalle" value={detalle} onChange={(e) => setDetalle(e.target.value)} />
          <ImagePrimaryRow
            imageUrl={DeliveryFoodAssets.SEND_REPORT}
            title="Enviar reporte"
            subtitle="Queja o sugerencia"
            onClick={() => {
              if (!cedulaCliente) {
                setSnack('Sesión sin cédula');
                return;
              }
              const msg = registrarReporteCliente(cedulaCliente, titulo, detalle);
              setSnack(msg);
              if (!msg.startsWith('Error')) {
                setTitulo('');
                setDetalle('');
              }
            }}
          />
          <h2 className="h6 mt-3">Mis envíos</h2>
          {misReportes.map((rc) => (
            <div key={rc.id} className="card mb-2 shadow-sm">
              <div className="card-body py-2">
                <div className="fw-medium">{rc.titulo}</div>
                <div className="small">{rc.texto}</div>
              </div>
            </div>
          ))}
        </>
      ) : null}
      {role === 'ADMIN' || role === 'RESTAURANTE' ? (
        <>
          <h2 className="h6">Indicadores generales</h2>
          {ui.reportes.map((r) => (
            <div key={r.titulo} className="card mb-2 shadow-sm">
              <div className="card-body py-2">
                <div className="fw-medium">{r.titulo}</div>
                <div className="small">{r.texto}</div>
              </div>
            </div>
          ))}
          <h2 className="h6 mt-3">Reportes de clientes</h2>
          {ui.reportesCliente.map((rc) => (
            <div key={rc.id} className="card mb-2 shadow-sm">
              <div className="card-body py-2">
                <div className="fw-medium">{rc.titulo}</div>
                <div className="small text-muted">Cédula {rc.cedulaCliente}</div>
                <div className="small">{rc.texto}</div>
              </div>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}
