require('dotenv').config()
const express = require('express')
const cors = require('cors')

const { initDb } = require('./database/init')
const authRoutes = require('./routes/auth')
const sitesRoutes = require('./routes/sites')
const commentsRoutes = require('./routes/comments')
const favoritesRoutes = require('./routes/favorites')
const adminRoutes = require('./routes/admin')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/sites', sitesRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' })
})

// Gestionnaire d'erreurs global (filet de sécurité)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Erreur interne du serveur.' })
})

const PORT = process.env.PORT || 5000

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API Madagascar Tourism à l'écoute sur http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Échec de l\u2019initialisation de la base de données :', err)
    process.exit(1)
  })
