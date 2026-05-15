import { UserManagerConstants } from './userManager';

const PREF = 'cleta_session';
const KEY_IS_LOGGED_IN = 'is_logged_in';
const KEY_LOGGED_USER = 'logged_user';
const KEY_ROLE = 'logged_role';
const KEY_REST_ID = 'logged_rest_id';
const KEY_CLIENTE_CEDULA = 'logged_cliente_cedula';

function read() {
  try {
    return JSON.parse(localStorage.getItem(PREF) || '{}');
  } catch {
    return {};
  }
}

function write(data) {
  localStorage.setItem(PREF, JSON.stringify(data));
}

export function sessionLogin(username, role, idRestaurante, clienteCedula) {
  const d = read();
  d[KEY_IS_LOGGED_IN] = true;
  d[KEY_LOGGED_USER] = username;
  d[KEY_ROLE] = role;
  d[KEY_REST_ID] = idRestaurante != null ? idRestaurante : -1;
  d[KEY_CLIENTE_CEDULA] = clienteCedula || '';
  write(d);
}

export function sessionLogout() {
  const d = read();
  d[KEY_IS_LOGGED_IN] = false;
  delete d[KEY_LOGGED_USER];
  delete d[KEY_ROLE];
  delete d[KEY_REST_ID];
  delete d[KEY_CLIENTE_CEDULA];
  write(d);
}

export function isLoggedIn() {
  return !!read()[KEY_IS_LOGGED_IN];
}

export function getLoggedUser() {
  return read()[KEY_LOGGED_USER] || '';
}

export function getRole() {
  const d = read();
  const raw = d[KEY_ROLE];
  if (raw === 'ADMIN' || raw === 'RESTAURANTE' || raw === 'CLIENTE') return raw;
  const u = getLoggedUser();
  if (u.toLowerCase() === UserManagerConstants.DEFAULT_USER.toLowerCase()) return 'ADMIN';
  if (u.toLowerCase() === UserManagerConstants.RESTAURANTE_USER.toLowerCase()) return 'RESTAURANTE';
  return 'CLIENTE';
}

export function getRestauranteId() {
  const d = read();
  const v = d[KEY_REST_ID];
  if (typeof v === 'number' && v >= 0) return v;
  if (getLoggedUser().toLowerCase() === UserManagerConstants.RESTAURANTE_USER.toLowerCase()) {
    return UserManagerConstants.RESTAURANTE_ID_DEMO;
  }
  return null;
}

export function getClienteCedula() {
  return read()[KEY_CLIENTE_CEDULA] || '';
}
