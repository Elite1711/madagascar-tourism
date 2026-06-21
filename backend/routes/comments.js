const express = require('express')
const { run, get, all } = require('../database/db')
const { verifyToken } = require('../middleware/auth')

const router = express.Router()

function parseRating(value) {
  if (value === undefined || value === null || value === '') return null
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 5) return undefined // invalide
  return n
}

// GET /api/comments/recent/list — derniers avis tous sites confondus (carrousel accueil)
router.get('/recent/list', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 6, 20)
  try {
    const comments = await all(
      `SELECT comments.id, comments.comment, comments.rating, comments.created_at,
              users.username, sites.id AS site_id, sites.name AS site_name
       FROM comments
       JOIN users ON users.id = comments.user_id
       JOIN sites ON sites.id = comments.site_id
       ORDER BY comments.created_at DESC
       LIMIT ?`,
      [limit]
    )
    res.json(comments)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des avis récents.', detail: err.message })
  }
})

// GET /api/comments/:siteId — commentaires d'un site, avec le nom de l'auteur
router.get('/:siteId', async (req, res) => {
  try {
    const comments = await all(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE comments.site_id = ?
       ORDER BY comments.created_at ASC`,
      [req.params.siteId]
    )
    res.json(comments)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des commentaires.', detail: err.message })
  }
})

router.post('/', verifyToken, async (req, res) => {
  const { site_id, comment, rating } = req.body
  if (!site_id || !comment?.trim()) {
    return res.status(400).json({ message: 'site_id et comment sont requis.' })
  }
  const parsedRating = parseRating(rating)
  if (parsedRating === undefined) {
    return res.status(400).json({ message: 'La note doit être un entier entre 1 et 5.' })
  }

  try {
    const site = await get('SELECT id FROM sites WHERE id = ?', [site_id])
    if (!site) return res.status(404).json({ message: 'Site introuvable.' })

    const { id } = await run(
      'INSERT INTO comments (user_id, site_id, comment, rating) VALUES (?, ?, ?, ?) RETURNING id',
      [req.user.id, site_id, comment.trim(), parsedRating]
    )
    const created = await get(
      `SELECT comments.*, users.username FROM comments JOIN users ON users.id = comments.user_id WHERE comments.id = ?`,
      [id]
    )
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\u2019ajout du commentaire.', detail: err.message })
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  const { comment, rating } = req.body
  if (!comment?.trim()) {
    return res.status(400).json({ message: 'Le commentaire ne peut pas être vide.' })
  }
  const parsedRating = parseRating(rating)
  if (parsedRating === undefined) {
    return res.status(400).json({ message: 'La note doit être un entier entre 1 et 5.' })
  }

  try {
    const existing = await get('SELECT * FROM comments WHERE id = ?', [req.params.id])
    if (!existing) return res.status(404).json({ message: 'Commentaire introuvable.' })

    const isOwner = existing.user_id === req.user.id
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres commentaires.' })
    }

    await run(
      'UPDATE comments SET comment = ?, rating = ? WHERE id = ?',
      [comment.trim(), rating === undefined ? existing.rating : parsedRating, req.params.id]
    )
    const updated = await get(
      `SELECT comments.*, users.username FROM comments JOIN users ON users.id = comments.user_id WHERE comments.id = ?`,
      [req.params.id]
    )
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la modification du commentaire.', detail: err.message })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM comments WHERE id = ?', [req.params.id])
    if (!existing) return res.status(404).json({ message: 'Commentaire introuvable.' })

    const isOwner = existing.user_id === req.user.id
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres commentaires.' })
    }

    await run('DELETE FROM comments WHERE id = ?', [req.params.id])
    res.json({ message: 'Commentaire supprimé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du commentaire.', detail: err.message })
  }
})

module.exports = router
