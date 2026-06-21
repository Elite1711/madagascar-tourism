const express = require('express')
const { run, get, all } = require('../database/db')
const { verifyToken } = require('../middleware/auth')

const router = express.Router()

// GET /api/favorites — favoris de l'utilisateur connecté, joints aux infos du site
router.get('/', verifyToken, async (req, res) => {
  try {
    const favorites = await all(
      `SELECT favorites.id, favorites.site_id, favorites.created_at,
              sites.name, sites.region, sites.description, sites.image, sites.image_attribution, sites.category
       FROM favorites
       JOIN sites ON sites.id = favorites.site_id
       WHERE favorites.user_id = ?
       ORDER BY favorites.created_at DESC`,
      [req.user.id]
    )
    res.json(favorites)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des favoris.', detail: err.message })
  }
})

router.post('/', verifyToken, async (req, res) => {
  const { site_id } = req.body
  if (!site_id) {
    return res.status(400).json({ message: 'site_id est requis.' })
  }

  try {
    const site = await get('SELECT id FROM sites WHERE id = ?', [site_id])
    if (!site) return res.status(404).json({ message: 'Site introuvable.' })

    const existing = await get(
      'SELECT id FROM favorites WHERE user_id = ? AND site_id = ?',
      [req.user.id, site_id]
    )
    if (existing) {
      return res.status(409).json({ message: 'Ce site est déjà dans vos favoris.' })
    }

    const { id } = await run(
      'INSERT INTO favorites (user_id, site_id) VALUES (?, ?) RETURNING id',
      [req.user.id, site_id]
    )
    res.status(201).json({ id, user_id: req.user.id, site_id })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\u2019ajout aux favoris.', detail: err.message })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM favorites WHERE id = ?', [req.params.id])
    if (!existing) return res.status(404).json({ message: 'Favori introuvable.' })
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez retirer que vos propres favoris.' })
    }

    await run('DELETE FROM favorites WHERE id = ?', [req.params.id])
    res.json({ message: 'Favori supprimé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du favori.', detail: err.message })
  }
})

module.exports = router
