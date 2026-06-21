import api from './api'

export const adminService = {
  // Le backend peut soit exposer /api/admin/stats directement, soit on
  // calcule les compteurs côté client à partir des autres endpoints.
  async getStats() {
    const { data } = await api.get('/admin/stats')
    return data // { sites, users, comments, favorites }
  },

  async getUsers() {
    const { data } = await api.get('/admin/users')
    return data
  },

  async removeUser(id) {
    const { data } = await api.delete(`/admin/users/${id}`)
    return data
  },

  // Nécessite un endpoint backend qui retourne tous les commentaires,
  // par exemple GET /api/admin/comments (à ajouter côté backend).
  async getAllComments() {
    const { data } = await api.get('/admin/comments')
    return data
  }
}
