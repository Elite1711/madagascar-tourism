const { run } = require('./db')

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await run(`
    CREATE TABLE IF NOT EXISTS sites (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT,
      image_attribution TEXT,
      category TEXT NOT NULL DEFAULT 'nature',
      latitude REAL,
      longitude REAL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  // Migration additive : si la table sites existait déjà sans ces colonnes
  // (créée avant l'ajout de la galerie/catégorie/carte), on les ajoute sans
  // tout recréer. IF NOT EXISTS rend ces lignes sûres à rejouer à chaque démarrage.
  await run("ALTER TABLE sites ADD COLUMN IF NOT EXISTS image_attribution TEXT")
  await run("ALTER TABLE sites ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'nature'")
  await run("ALTER TABLE sites ADD COLUMN IF NOT EXISTS latitude REAL")
  await run("ALTER TABLE sites ADD COLUMN IF NOT EXISTS longitude REAL")

  await run(`
    CREATE TABLE IF NOT EXISTS site_images (
      id SERIAL PRIMARY KEY,
      site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      attribution TEXT,
      position INTEGER NOT NULL DEFAULT 0
    )
  `)

  await run(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      rating INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await run("ALTER TABLE comments ADD COLUMN IF NOT EXISTS rating INTEGER")

  await run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, site_id)
    )
  `)
}

module.exports = { initDb }
