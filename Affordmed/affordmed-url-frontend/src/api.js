import axios from 'axios';
// Change baseURL if your backend runs on a different host/port
const api = axios.create({ baseURL: 'http://localhost:4000' });
export { api };
