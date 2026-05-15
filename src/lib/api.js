import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || (() => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  // Produção: URL fixa do Render
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://eixo-fiscal-backend.onrender.com';
  }
  return 'http://localhost:3001';
})();

const getApiUrl = () => `${BACKEND_URL}/api`;

const SETTINGS_STORAGE_KEY = '9de8e26766b832dce1a75b22ea5bf7f3525e319a85561d733d77dc2f13d2a7fd';
const REFRESH_TOKEN_KEY = 'a53406e1e82fc55d1e59d4c54a0428738c0154669285e6df755d619ed3564ca6';
const USER_STORAGE_KEY = '7f8a2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0';
const DEFAULT_NFSE_VERSION = process.env.NEXT_PUBLIC_NFSE_VERSION || 'v1';

// Access token em memória (não persiste em localStorage)
let accessToken = null;
let refreshToken = null;

const getNfseVersion = () => {
  if (typeof window === 'undefined') return DEFAULT_NFSE_VERSION;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_NFSE_VERSION;
    const parsed = JSON.parse(raw);
    return parsed?.nfseVersion === 'v2' ? 'v2' : 'v1';
  } catch {
    return DEFAULT_NFSE_VERSION;
  }
};

const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch { return null; }
};

const setAccessToken = (token) => { accessToken = token; };
const setRefreshToken = (token) => {
  refreshToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};
const setUser = (user) => {
  if (typeof window !== 'undefined') {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  }
};
const getUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const resp = await axios.post(`${getApiUrl()}/auth/refresh`, { refreshToken });
        const newToken = resp.data.token;
        setAccessToken(newToken);
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        setRefreshToken(null);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      setAccessToken(null);
      setRefreshToken(null);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (token) => api.get(`/auth/verify?token=${token}`),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  profile: () => api.get('/auth/profile'),
  changePassword: (oldPassword, newPassword) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),
  revokeTokens: () => api.post('/auth/revoke-tokens'),
  registerTenant: (data) => api.post('/auth/tenant/register', data),
};

export const nfseApi = {
  emitir: (dados) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.post('/nfse/emitir-completo', dados);
    return api.post('/v2/nfse/gerar', dados);
  },
  consultarPorRps: (numero, serie = 'A1', tipo = 1) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.get(`/nfse/consultar/rps/${numero}`, { params: { serie, tipo } });
    return api.get(`/v2/nfse/consultar/dps/${numero}`, { params: { serie } });
  },
  consultarPorFaixa: (inicio, fim, pagina = 1) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.get('/nfse/consultar/faixa', { params: { numeroInicial: inicio, numeroFinal: fim, pagina } });
    return api.get('/v2/nfse/consultar/faixa', { params: { inicio, fim, pagina } });
  },
  consultarPrestadas: (pagina = 1, dataInicial, dataFinal) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.get('/nfse/consultar/prestados', { params: { pagina, dataInicial, dataFinal } });
    return api.get('/v2/nfse/consultar/prestados', { params: { pagina, dataInicial, dataFinal } });
  },
  consultarTomados: (pagina = 1, dataInicial, dataFinal, cnpj) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.get('/nfse/consultar/tomados', { params: { pagina, dataInicial, dataFinal, cnpj } });
    return api.get('/v2/nfse/consultar/tomados', { params: { pagina, dataInicial, dataFinal, cnpj } });
  },
  consultarPorDps: (numero, serie = '00001') =>
    api.get(`/v2/nfse/consultar/dps/${numero}`, { params: { serie } }),
  dadosCadastrais: () => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.get('/nfse/dados-cadastrais');
    return api.get('/v2/nfse/dados-cadastrais');
  },
  dpsDisponivel: (pagina = 1) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.get('/nfse/dps-disponivel', { params: { pagina } });
    return api.get('/v2/nfse/dps-disponivel', { params: { pagina } });
  },
  cancelar: (dados) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.post('/nfse/cancelar', dados);
    return api.post('/v2/nfse/cancelar', dados);
  },
  substituir: (dados) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.post('/nfse/substituir', dados);
    return api.post('/v2/nfse/substituir', dados);
  },
  enviarLote: (listaDps, numeroLote) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.post('/nfse/lote', { listaDps, numeroLote });
    return api.post('/v2/nfse/lote', { listaDps, numeroLote });
  },
  enviarLoteSincrono: (listaDps, numeroLote) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.post('/nfse/lote/sincrono', { listaDps, numeroLote });
    return api.post('/v2/nfse/lote/sincrono', { listaDps, numeroLote });
  },
  consultarLote: (protocolo) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.get(`/nfse/consultar/lote/${protocolo}`);
    return api.get(`/v2/nfse/consultar/lote/${protocolo}`);
  },
  consultarSituacaoLote: (protocolo) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') return api.get(`/nfse/consultar/situacao-lote/${protocolo}`);
    return api.get(`/v2/nfse/consultar/situacao-lote/${protocolo}`);
  },
  consultarUrlNfse: (numero) => {
    const nfseVersion = getNfseVersion();
    if (nfseVersion === 'v1') {
      return Promise.reject(new Error('Consultar URL da NFS-e está disponível apenas para v2.'));
    }
    return api.get(`/v2/nfse/consultar/url/${numero}`);
  },
  config: {
    obterNfseUi: () => api.get('/config/nfse-ui'),
    salvarNfseUi: (data) => api.put('/config/nfse-ui', data),
    uploadCertificate: (formData) => api.post('/config/certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getCertificateInfo: () => api.get('/config/certificate'),
    getCertExpiration: () => api.get('/config/certificate/expiration'),
    updateCertAlertDays: (days) => api.put('/config/certificate/alert-days', { days }),
    getTenantInfo: () => api.get('/config/tenant'),
    updateTenant: (data) => api.put('/config/tenant', data),
  },
  health: () => axios.get(`${BACKEND_URL}/health`),
  metricas: () => api.get('/metricas'),

  clientes: {
    listar: () => api.get('/clientes'),
    buscar: (id) => api.get(`/clientes/${id}`),
    criar: (dados) => api.post('/clientes', dados),
    atualizar: (id, dados) => api.put(`/clientes/${id}`, dados),
    deletar: (id) => api.delete(`/clientes/${id}`),
  },

  rascunhos: {
    listar: () => api.get('/rascunhos'),
    buscar: (id) => api.get(`/rascunhos/${id}`),
    criar: (dados) => api.post('/rascunhos', dados),
    atualizar: (id, dados) => api.put(`/rascunhos/${id}`, dados),
    deletar: (id) => api.delete(`/rascunhos/${id}`),
  },

  invoices: {
    listar: (params) => api.get('/invoices', { params }),
    buscar: (id) => api.get(`/invoices/${id}`),
    estatisticas: (params) => api.get('/invoices/estatisticas', { params }),
    listarPorCliente: (clientId) => api.get(`/invoices/cliente/${clientId}`),
    planStatus: () => api.get('/invoices/plan-status'),
  },

  planos: {
    listar: () => api.get('/planos'),
    assinar: (id) => api.post(`/planos/${id}/assinar`),
  },

  admin: {
    dashboard: () => api.get('/admin/dashboard'),
    listarTenants: (params) => api.get('/admin/tenants', { params }),
    atualizarTenant: (id, data) => api.put(`/admin/tenants/${id}`, data),
    listarUsuarios: (params) => api.get('/admin/usuarios', { params }),
    atualizarUsuario: (id, data) => api.put(`/admin/usuarios/${id}`, data),
    getConfiguracoes: () => api.get('/admin/configuracoes'),
    relatorios: () => api.get('/admin/relatorios'),
    listarPlanos: () => api.get('/admin/planos'),
    criarPlano: (data) => api.post('/admin/planos', data),
    atualizarPlano: (id, data) => api.put(`/admin/planos/${id}`, data),
    deletarPlano: (id) => api.delete(`/admin/planos/${id}`),
  },
};

const getAuth = () => ({ user: getUser() });

export { getRefreshToken, setAccessToken, setRefreshToken, setUser, getUser, getAuth };
export default api;