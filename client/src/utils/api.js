import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 20000 });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('sv_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (!navigator.onLine) {
      err.isOffline = true;
      err.message = 'You are offline. Showing saved data where available.';
    }
    return Promise.reject(err);
  }
);

export default api;
