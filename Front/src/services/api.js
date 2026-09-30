const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const getAuthHeaders = (isJson = false) => {
  const token = localStorage.getItem('Token');
  const headers = {
    'ngrok-skip-browser-warning': 'true',};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, // Login doesn't need token
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem("Token",res.token);
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async logout() {
    try {
      const res = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders(true)
      });
      return await res.json()
    } catch(err) {
      return {success: false, message: 'No se pudo conectar con el servidor backend'}
    }
  },

  async registrarUsuario(usuarioData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(usuarioData)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async getRoles() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/roles`, { headers: getAuthHeaders() })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() })
      return await res.json()
    } catch (e) {
      return { success: false }
    }
  },

  async getDestinos() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/destinos`, { headers: getAuthHeaders() })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getProductos() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/productos`, { headers: getAuthHeaders() })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getRepartidores() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/repartidores`, { headers: getAuthHeaders() })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getProveedores() {
    try {
      const res = await fetch(`${API_BASE_URL}/catalogos/proveedores`, { headers: getAuthHeaders() })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async getPedidos() {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, { headers: getAuthHeaders() })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  },

  async crearPedido(pedidoData) {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(pedidoData)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async actualizarTracking(pedidoId, trackingData) {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/tracking`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(trackingData)
      })
      return await res.json()
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' }
    }
  },

  async getHistorialTracking(pedidoId) {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/tracking`, { headers: getAuthHeaders() })
      return await res.json()
    } catch (e) {
      return { success: false, data: [] }
    }
  }
}
