import api from './api'

export const favoriteService = {
  async getMine() {
    const { data } = await api.get('/favorites')
    return data
  },

  async add(siteId) {
    const { data } = await api.post('/favorites', { site_id: siteId })
    return data
  },

  async remove(id) {
    const { data } = await api.delete(`/favorites/${id}`)
    return data
  }
}
