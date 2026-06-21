const express = require('express')
const { run, get, all } = require('../database/db')
const { verifyToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.use(verifyToken, requireAdmin)

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [sites, users, comments, favorites] = await Promise.all([
      get('SELECT COUNT(*) AS count FROM sites'),
      get('SELECT COUNT(*) AS count FROM users'),
      get('SELECT COUNT(*) AS count FROM comments'),
      get('SELECT COUNT(*) AS count FROM favorites')
    ])
    res.json({
      sites: sites.count,
      users: users.count,
      comments: comments.count,
      favorites: favorites.count
    })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques.', detail: err.message })
  }
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await all('SELECT id, username, email, role, created_at FROM users ORDER BY username ASC')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des utilisateurs.', detail: err.message })
  }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const target = await get('SELECT * FROM users WHERE id = ?', [req.params.id])
    if (!target) return res.status(404).json({ message: 'Utilisateur introuvable.' })
    if (target.role === 'admin') {
      return res.status(403).json({ message: 'Impossible de supprimer un compte administrateur.' })
    }

    await run('DELETE FROM users WHERE id = ?', [req.params.id])
    res.json({ message: 'Utilisateur supprimé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\u2019utilisateur.', detail: err.message })
  }
})

// GET /api/admin/comments — tous les commentaires, tous sites confondus
router.get('/comments', async (req, res) => {
  try {
    const comments = await all(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON users.id = comments.user_id
       ORDER BY comments.created_at DESC`
    )
    res.json(comments)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des commentaires.', detail: err.message })
  }
})

module.exports = router
