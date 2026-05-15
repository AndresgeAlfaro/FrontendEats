import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import * as proto from './prototypeRepository';
import * as remote from './backendRemoteRepository';
import {
  UserManagerConstants,
  validateUser,
  getRole as userGetRole,
  getClienteCedula as userGetClienteCedula,
  getRestauranteId as userGetRestauranteId,
  userExists,
  registerClienteCompleto,
} from './userManager';
import {
  sessionLogin,
  sessionLogout as persistLogout,
  getLoggedUser,
  getRole as sessionGetRole,
  getRestauranteId as sessionGetRestauranteId,
  getClienteCedula as sessionGetClienteCedula,
} from './sessionManager';

function buildUiFromPrototype() {
  return {
    restaurantes: proto.getRestaurantes(),
    clientesActivos: proto.getClientesActivos(),
    clientesSuspendidos: proto.getClientesSuspendidos(),
    repartidores: proto.getRepartidores(),
    repartidoresCeroAm: proto.getRepartidoresCeroAmonestaciones(),
    pedidos: proto.getPedidosRecientes(),
    reportes: proto.getReportesMock(),
    reportesCliente: proto.getReportesClienteTodos(),
    isLoading: false,
    errorMessage: null,
    successMessage: null,
    isConnectedToBackend: false,
    userLocation: 'Ubicacion no disponible',
  };
}

const CletaContext = createContext(null);

export function CletaProvider({ children }) {
  const [ui, setUi] = useState(() => buildUiFromPrototype());

  const loadFromSupabaseSync = useCallback(async () => {
    setUi((u) => ({ ...u, isLoading: true, errorMessage: null }));
    try {
      const data = await remote.loadAllFromSupabase();
      const idsRest = new Set(data.restaurantes.map((r) => r.id));
      const role = sessionGetRole();
      const uid = getLoggedUser();
      const curRest = sessionGetRestauranteId();
      const ced = sessionGetClienteCedula();
      if (
        role === 'RESTAURANTE' &&
        data.restaurantes.length > 0 &&
        (curRest == null || !idsRest.has(curRest))
      ) {
        sessionLogin(uid, 'RESTAURANTE', data.restaurantes[0].id, ced);
      }
      setUi((prev) => ({
        ...prev,
        isLoading: false,
        restaurantes: data.restaurantes,
        clientesActivos: data.clientesActivos,
        clientesSuspendidos: data.clientesSuspendidos,
        repartidores: data.repartidores,
        repartidoresCeroAm: data.repartidoresCeroAm,
        pedidos: data.pedidos,
        isConnectedToBackend: data.isConnectedToBackend,
        errorMessage: data.errorMessage,
        reportesCliente: proto.getReportesClienteTodos(),
        reportes:
          Array.isArray(data.reportes) && data.reportes.length > 0 ? data.reportes : proto.getReportesMock(),
        userLocation: prev.userLocation,
      }));
      return { clientesActivos: data.clientesActivos };
    } catch (e) {
      setUi((u) => ({
        ...u,
        isLoading: false,
        errorMessage: `Sin conexion: ${e?.message || e}`,
      }));
      return { clientesActivos: [] };
    }
  }, []);

  const refreshAll = useCallback(() => {
    void loadFromSupabaseSync();
  }, [loadFromSupabaseSync]);

  const clearMessages = useCallback(() => {
    setUi((u) => ({ ...u, errorMessage: null, successMessage: null }));
  }, []);

  const loginSupabase = useCallback(
    async (email, password) => {
      setUi((u) => ({ ...u, isLoading: true, errorMessage: null }));
      const res = await remote.signIn(email, password);
      if (!res.ok) {
        setUi((u) => ({ ...u, isLoading: false }));
        return { ok: false, message: res.error, clientesActivos: [] };
      }
      const { clientesActivos } = await loadFromSupabaseSync();
      return { ok: true, message: 'Login exitoso', clientesActivos };
    },
    [loadFromSupabaseSync],
  );

  const registerSupabase = useCallback(async (email, password) => {
    setUi((u) => ({ ...u, isLoading: true }));
    const res = await remote.signUp(email, password);
    setUi((u) => ({ ...u, isLoading: false }));
    if (!res.ok) return { ok: false, message: res.error };
    return { ok: true, message: 'Registro exitoso' };
  }, []);

  const crearRestauranteRemoto = useCallback(
    async (nombre, cedulaJuridica, direccion, tipoComida) => {
      const r = await remote.createRestaurante({ nombre, cedulaJuridica, direccion, tipoComida });
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Restaurante registrado.';
    },
    [loadFromSupabaseSync],
  );

  const agregarComboRemoto = useCallback(
    async (idRestaurante, payload) => {
      const r = await remote.insertCombo(idRestaurante, payload);
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Plato agregado.';
    },
    [loadFromSupabaseSync],
  );

  const eliminarComboRemoto = useCallback(
    async (idRestaurante, numeroCombo) => {
      const r = await remote.deleteCombo(idRestaurante, numeroCombo);
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Plato eliminado.';
    },
    [loadFromSupabaseSync],
  );

  const actualizarComboRemoto = useCallback(
    async (idRestaurante, numeroCombo, payload) => {
      const r = await remote.patchCombo(idRestaurante, numeroCombo, payload);
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Plato actualizado.';
    },
    [loadFromSupabaseSync],
  );

  const eliminarRestauranteRemoto = useCallback(
    async (id) => {
      const r = await remote.deleteRestaurante(id);
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Restaurante eliminado.';
    },
    [loadFromSupabaseSync],
  );

  const actualizarRestauranteRemoto = useCallback(
    async (id, nombre, cedulaJuridica, direccion, tipoComida) => {
      const r = await remote.updateRestaurante({ id, nombre, cedulaJuridica, direccion, tipoComida });
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Restaurante actualizado.';
    },
    [loadFromSupabaseSync],
  );

  const crearClienteRemoto = useCallback(
    async (cedula, nombre, direccion, tarjeta, celular, correo) => {
      const r = await remote.createCliente({
        cedula,
        nombre,
        direccion,
        tarjeta,
        celular,
        correo,
        suspendido: false,
      });
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Cliente registrado.';
    },
    [loadFromSupabaseSync],
  );

  const testInternetConnection = useCallback(async (onResult) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        onResult('Error: No hay conexión a internet disponible');
        return;
      }
      onResult(await remote.testSupabaseBackend());
    } catch (e) {
      onResult(`Error en conexión: ${e?.message || e}`);
    }
  }, []);

  const realizarPedido = useCallback(
    async (cedulaCliente, idRestaurante, nombreRestaurante, items, distanciaKm, esFeriado) => {
      const r = await remote.createPedidoWithItems({
        cedulaCliente,
        idRestaurante,
        nombreRestaurante,
        items,
        distanciaKm,
        esFeriado,
      });
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return `Pedido #${r.id ?? '?'} registrado.`;
    },
    [loadFromSupabaseSync],
  );

  const actualizarPedidoObservacion = useCallback(
    async (idPedido, observacion) => {
      const r = await remote.updatePedidoObservacion(idPedido, observacion);
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Observación guardada.';
    },
    [loadFromSupabaseSync],
  );

  const eliminarPedido = useCallback(
    async (idPedido) => {
      const r = await remote.deletePedido(idPedido);
      if (!r.ok) return false;
      await loadFromSupabaseSync();
      return true;
    },
    [loadFromSupabaseSync],
  );

  const marcarPedidoEntregado = useCallback(
    async (idPedido, idRepartidor) => {
      const r = await remote.marcarPedidoEntregado(idPedido, idRepartidor);
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return null;
    },
    [loadFromSupabaseSync],
  );

  const registrarRepartidor = useCallback(
    async (idRestaurante, cedula, nombre, correo, direccion, celular, tarjeta) => {
      const r = await remote.createRepartidor({
        idRestaurante,
        cedula,
        nombre,
        correo,
        direccion,
        celular,
        tarjeta,
        amonestaciones: 0,
      });
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Repartidor registrado.';
    },
    [loadFromSupabaseSync],
  );

  const actualizarRepartidor = useCallback(
    async (rep) => {
      const r = await remote.updateRepartidor(rep);
      if (!r.ok) return remote.sbErr(r.error);
      await loadFromSupabaseSync();
      return 'Repartidor actualizado.';
    },
    [loadFromSupabaseSync],
  );

  const eliminarRepartidorLocal = useCallback(
    async (id) => {
      const r = await remote.deleteRepartidor(id);
      if (!r.ok) return false;
      await loadFromSupabaseSync();
      return true;
    },
    [loadFromSupabaseSync],
  );

  const registrarReporteCliente = useCallback(
    (cedula, titulo, texto) => {
      const msg = proto.registrarReporteCliente(cedula, titulo, texto);
      refreshAll();
      return msg;
    },
    [refreshAll],
  );

  const obtenerUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setUi((u) => ({ ...u, userLocation: 'Geolocalización no disponible en este navegador' }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        setUi((u) => ({ ...u, userLocation: `Lat: ${lat}, Lon: ${lon}` }));
      },
      () => {
        setUi((u) => ({ ...u, userLocation: 'No se pudo obtener ubicacion' }));
      },
    );
  }, []);

  const logout = useCallback(async () => {
    persistLogout();
  }, []);

  const value = useMemo(
    () => ({
      ui,
      refreshAll,
      loadFromSupabase: loadFromSupabaseSync,
      loginSupabase,
      registerSupabase,
      crearRestauranteRemoto,
      agregarComboRemoto,
      eliminarComboRemoto,
      actualizarComboRemoto,
      eliminarRestauranteRemoto,
      actualizarRestauranteRemoto,
      crearClienteRemoto,
      testInternetConnection,
      realizarPedido,
      actualizarPedidoObservacion,
      eliminarPedido,
      marcarPedidoEntregado,
      registrarRepartidor,
      actualizarRepartidor,
      eliminarRepartidorLocal,
      registrarReporteCliente,
      obtenerUbicacion,
      clearMessages,
      logout,
      UserManagerConstants,
      validateUser,
      userGetRole,
      userGetClienteCedula,
      userGetRestauranteId,
      userExists,
      registerClienteCompleto,
      sessionLogin,
      getLoggedUser,
      sessionGetRole,
      sessionGetRestauranteId,
      sessionGetClienteCedula,
    }),
    [
      ui,
      refreshAll,
      loadFromSupabaseSync,
      loginSupabase,
      registerSupabase,
      crearRestauranteRemoto,
      agregarComboRemoto,
      eliminarComboRemoto,
      actualizarComboRemoto,
      eliminarRestauranteRemoto,
      actualizarRestauranteRemoto,
      crearClienteRemoto,
      testInternetConnection,
      realizarPedido,
      actualizarPedidoObservacion,
      eliminarPedido,
      marcarPedidoEntregado,
      registrarRepartidor,
      actualizarRepartidor,
      eliminarRepartidorLocal,
      registrarReporteCliente,
      obtenerUbicacion,
      clearMessages,
      logout,
    ],
  );

  return <CletaContext.Provider value={value}>{children}</CletaContext.Provider>;
}

export function useCleta() {
  const ctx = useContext(CletaContext);
  if (!ctx) throw new Error('useCleta dentro de CletaProvider');
  return ctx;
}
