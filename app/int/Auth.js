import Storage from 'electron-json-storage-sync';
import { getUser } from '../int/Masters';


export function logout() {
  Storage.clear('session');
}

export function auth(username, password) {
  return getUser(username);
}
