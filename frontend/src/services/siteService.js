import api from './api'

export const siteService = {
  async getAll(params = {}) {
    const { data } = await api.get('/sites', { params })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/sites/${id}`)
    return data
  },

  async create(site) {
    const { data } = await api.post('/sites', site)
    return data
  },

  async update(id, site) {
    const { data } = await api.put(`/sites/${id}`, site)
    return data
  },

  async remove(id) {
    const { data } = await api.delete(`/sites/${id}`)
    return data
  },

  async addImage(siteId, { url, attribution }) {
    const { data } = await api.post(`/sites/${siteId}/images`, { url, attribution })
    return data
  },

  async removeImage(siteId, imageId) {
    const { data } = await api.delete(`/sites/${siteId}/images/${imageId}`)
    return data
  }
}
