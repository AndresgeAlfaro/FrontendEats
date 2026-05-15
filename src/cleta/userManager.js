const PREF = 'cleta_users';

const buildPasswordKey = (username) => `user_${username.toLowerCase().trim()}`;
const keyRole = (u) => `role_${u}`;
const keyCedula = (u) => `cedula_${u}`;
const keyRestId = (u) => `rest_id_${u}`;

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(PREF) || '{}');
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(PREF, JSON.stringify(store));
}

export const UserManagerConstants = {
  DEFAULT_USER: 'admin',
  DEFAULT_PASSWORD: '1234',
  RESTAURANTE_USER: 'restaurante',
  RESTAURANTE_PASSWORD: '1234',
  RESTAURANTE_ID_DEMO: 2,
};

export function userExists(username) {
  const s = readStore();
  return Object.prototype.hasOwnProperty.call(s, buildPasswordKey(username));
}

export function validateUser(username, password) {
  const s = readStore();
  const k = buildPasswordKey(username);
  return s[k] != null && s[k] === password;
}

export function getRole(username) {
  const u = username.toLowerCase().trim();
  const s = readStore();
  const r = s[keyRole(u)];
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'RESTAURANTE') return 'RESTAURANTE';
  if (r === 'CLIENTE') return 'CLIENTE';
  return 'CLIENTE';
}

export function getClienteCedula(username) {
  const u = username.toLowerCase().trim();
  return readStore()[keyCedula(u)] || '';
}

export function getRestauranteId(username) {
  const u = username.toLowerCase().trim();
  const v = readStore()[keyRestId(u)];
  if (typeof v === 'number' && v >= 0) return v;
  return null;
}

export function registerClienteCompleto(username, password, cedula) {
  if (userExists(username)) return false;
  const u = username.toLowerCase().trim();
  const s = readStore();
  s[buildPasswordKey(username)] = password;
  s[keyRole(u)] = 'CLIENTE';
  s[keyCedula(u)] = cedula.trim();
  writeStore(s);
  return true;
}

function seedUsers() {
  const { DEFAULT_USER, DEFAULT_PASSWORD, RESTAURANTE_USER, RESTAURANTE_PASSWORD, RESTAURANTE_ID_DEMO } =
    UserManagerConstants;
  const s = readStore();
  if (!userExists(DEFAULT_USER)) {
    s[buildPasswordKey(DEFAULT_USER)] = DEFAULT_PASSWORD;
    s[keyRole(DEFAULT_USER.toLowerCase())] = 'ADMIN';
  } else if (!s[keyRole(DEFAULT_USER.toLowerCase())]) {
    s[keyRole(DEFAULT_USER.toLowerCase())] = 'ADMIN';
  }
  if (!userExists(RESTAURANTE_USER)) {
    s[buildPasswordKey(RESTAURANTE_USER)] = RESTAURANTE_PASSWORD;
    s[keyRole(RESTAURANTE_USER.toLowerCase())] = 'RESTAURANTE';
    s[keyRestId(RESTAURANTE_USER.toLowerCase())] = RESTAURANTE_ID_DEMO;
  } else if (!s[keyRole(RESTAURANTE_USER.toLowerCase())]) {
    s[keyRole(RESTAURANTE_USER.toLowerCase())] = 'RESTAURANTE';
    s[keyRestId(RESTAURANTE_USER.toLowerCase())] = RESTAURANTE_ID_DEMO;
  }
  writeStore(s);
}

seedUsers();
