import api from './api'

export const commentService = {
  async getBySite(siteId) {
    const { data } = await api.get(`/comments/${siteId}`)
    return data
  },

  async create(comment) {
    // { site_id, comment }
    const { data } = await api.post('/comments', comment)
    return data
  },

  async update(id, comment) {
    const { data } = await api.put(`/comments/${id}`, comment)
    return data
  },

  async remove(id) {
    const { data } = await api.delete(`/comments/${id}`)
    return data
  }
}
