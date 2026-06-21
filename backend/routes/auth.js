const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { run, get } = require('../database/db')

const router = express.Router()

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Nom d\u2019utilisateur, email et mot de passe sont requis.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  }

  try {
    const existing = await get('SELECT id FROM users WHERE email = ?', [email])
    if (existing) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
    }

    const hash = await bcrypt.hash(password, 10)
    const { id } = await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?) RETURNING id',
      [username, email, hash, 'user']
    )

    res.status(201).json({ id, username, email, role: 'user' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création du compte.', detail: err.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis.' })
  }

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email])
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects.' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants incorrects.' })
    }

    const payload = { id: user.id, username: user.username, email: user.email, role: user.role }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })

    res.json({ token, user: payload })
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la connexion.', detail: err.message })
  }
})

module.exports = router
