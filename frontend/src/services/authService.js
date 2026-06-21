import api from './api'

export const authService = {
  async register({ username, email, password }) {
    const { data } = await api.post('/auth/register', { username, email, password })
    return data
  },

  async login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password })
    return data // attendu: { token, user: { id, username, email, role } }
  }
}
