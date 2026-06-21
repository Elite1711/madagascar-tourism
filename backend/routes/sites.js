const express = require('express')
const { run, get, all } = require('../database/db')
const { verifyToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Récupère la galerie de plusieurs sites en une seule requête (évite le N+1)
async function attachImages(sites) {
  if (sites.length === 0) return sites
  const ids = sites.map((s) => s.id)
  const placeholders = ids.map(() => '?').join(',')
  const rows = await all(
    `SELECT id, site_id, url, attribution FROM site_images WHERE site_id IN (${placeholders}) ORDER BY position ASC, id ASC`,
    ids
  )
  const bySite = {}
  for (const row of rows) {
    if (!bySite[row.site_id]) bySite[row.site_id] = []
    bySite[row.site_id].push({ id: row.id, url: row.url, attribution: row.attribution })
  }
  return sites.map((site) => ({ ...site, images: bySite[site.id] || [] }))
}

// Calcule la note moyenne et le nombre d'avis notés pour plusieurs sites
async function attachRatings(sites) {
  if (sites.length === 0) return sites
  const ids = sites.map((s) => s.id)
  const placeholders = ids.map(() => '?').join(',')
  const rows = await all(
    `SELECT site_id, AVG(rating) AS avg_rating, COUNT(rating) AS ratings_count
     FROM comments WHERE site_id IN (${placeholders}) AND rating IS NOT NULL
     GROUP BY site_id`,
    ids
  )
  const bySite = {}
  for (const row of rows) {
    bySite[row.site_id] = { avg_rating: Math.round(row.avg_rating * 10) / 10, ratings_count: row.ratings_count }
  }
  return sites.map((site) => ({
    ...site,
    avg_rating: bySite[site.id]?.avg_rating ?? null,
    ratings_count: bySite[site.id]?.ratings_count ?? 0
  }))
}

// Remplace entièrement la galerie d'un site. `images` est un tableau de
// { url, attribution } (attribution optionnelle).
async function replaceImages(siteId, images) {
  if (!Array.isArray(images)) return
  await run('DELETE FROM site_images WHERE site_id = ?', [siteId])
  let position = 0
  for (const img of images) {
    const url = typeof img === 'string' ? img : img?.url
    if (!url || !url.trim()) continue
    const attribution = typeof img === 'object' ? img.attribution || null : null
    await run(
      'INSERT INTO site_images (site_id, url, attribution, position) VALUES (?, ?, ?, ?) RETURNING id',
      [siteId, url.trim(), attribution, position]
    )
    position += 1
  }
}

// GET /api/sites?region=&search=&category=
router.get('/', async (req, res) => {
  const { region, search, category } = req.query
  const clauses = []
  const params = []

  if (region) {
    clauses.push('region = ?')
    params.push(region)
  }
  if (category) {
    clauses.push('category = ?')
    params.push(category)
  }
  if (search) {
    clauses.push('LOWER(name) LIKE ?')
    params.push(`%${search.toLowerCase()}%`)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

  try {
    const sites = await all(`SELECT * FROM sites ${where} ORDER BY name ASC`, params)
    const withImages = await attachImages(sites)
    res.json(await attachRatings(withImages))
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des sites.', detail: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const site = await get('SELECT * FROM sites WHERE id = ?', [req.params.id])
    if (!site) return res.status(404).json({ message: 'Site introuvable.' })
    const [withImages] = await attachImages([site])
    const [withRating] = await attachRatings([withImages])
    res.json(withRating)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement du site.', detail: err.message })
  }
})

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { name, region, description, image, image_attribution, category, latitude, longitude, images } = req.body
  if (!name || !region || !description) {
    return res.status(400).json({ message: 'Nom, région et description sont requis.' })
  }

  try {
    const { id } = await run(
      'INSERT INTO sites (name, region, description, image, image_attribution, category, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
      [name, region, description, image || '', image_attribution || null, category || 'nature', latitude ?? null, longitude ?? null]
    )
    if (images) await replaceImages(id, images)
    const site = await get('SELECT * FROM sites WHERE id = ?', [id])
    const [withImages] = await attachImages([site])
    res.status(201).json({ ...withImages, avg_rating: null, ratings_count: 0 })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création du site.', detail: err.message })
  }
})

router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { name, region, description, image, image_attribution, category, latitude, longitude, images } = req.body

  try {
    const existing = await get('SELECT * FROM sites WHERE id = ?', [req.params.id])
    if (!existing) return res.status(404).json({ message: 'Site introuvable.' })

    await run(
      'UPDATE sites SET name = ?, region = ?, description = ?, image = ?, image_attribution = ?, category = ?, latitude = ?, longitude = ? WHERE id = ?',
      [
        name ?? existing.name,
        region ?? existing.region,
        description ?? existing.description,
        image ?? existing.image,
        image_attribution ?? existing.image_attribution,
        category ?? existing.category,
        latitude ?? existing.latitude,
        longitude ?? existing.longitude,
        req.params.id
      ]
    )
    if (images !== undefined) {
      await replaceImages(req.params.id, images)
    }
    const updated = await get('SELECT * FROM sites WHERE id = ?', [req.params.id])
    const [withImages] = await attachImages([updated])
    const [withRating] = await attachRatings([withImages])
    res.json(withRating)
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la modification du site.', detail: err.message })
  }
})

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await run('DELETE FROM sites WHERE id = ?', [req.params.id])
    if (result.changes === 0) return res.status(404).json({ message: 'Site introuvable.' })
    res.json({ message: 'Site supprimé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du site.', detail: err.message })
  }
})

// POST /api/sites/:id/images — ajoute une photo à la galerie (admin)
router.post('/:id/images', verifyToken, requireAdmin, async (req, res) => {
  const { url, attribution } = req.body
  if (!url || !url.trim()) {
    return res.status(400).json({ message: 'url est requis.' })
  }
  try {
    const site = await get('SELECT id FROM sites WHERE id = ?', [req.params.id])
    if (!site) return res.status(404).json({ message: 'Site introuvable.' })

    const { max_pos } = await get(
      'SELECT COALESCE(MAX(position), -1) AS max_pos FROM site_images WHERE site_id = ?',
      [req.params.id]
    )
    const { id } = await run(
      'INSERT INTO site_images (site_id, url, attribution, position) VALUES (?, ?, ?, ?) RETURNING id',
      [req.params.id, url.trim(), attribution || null, max_pos + 1]
    )
    res.status(201).json({ id, site_id: Number(req.params.id), url: url.trim(), attribution: attribution || null })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\u2019ajout de la photo.', detail: err.message })
  }
})

// DELETE /api/sites/:id/images/:imageId — retire une photo de la galerie (admin)
router.delete('/:id/images/:imageId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await run(
      'DELETE FROM site_images WHERE id = ? AND site_id = ?',
      [req.params.imageId, req.params.id]
    )
    if (result.changes === 0) return res.status(404).json({ message: 'Photo introuvable.' })
    res.json({ message: 'Photo supprimée.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la photo.', detail: err.message })
  }
})

module.exports = router
