const { Pool, types } = require('pg')

// Par défaut, node-postgres renvoie les BIGINT (ex: COUNT(*)) et NUMERIC
// (ex: AVG()) sous forme de chaînes de caractères, pour éviter toute perte
// de précision sur de très grands nombres. Pour cette application (compteurs
// et notes moyennes, jamais de calculs financiers), on les reconvertit en
// nombres JS dès la sortie du driver — sinon des comparaisons comme
// `count === 0` échouent silencieusement ('0' !== 0).
types.setTypeParser(20, (val) => parseInt(val, 10)) // OID 20 = int8 / bigint
types.setTypeParser(1700, (val) => parseFloat(val)) // OID 1700 = numeric

const connectionString = process.env.DATABASE_URL
  || 'postgresql://postgres:postgres@localhost:5432/madagascar_tourism'

// La plupart des hébergeurs Postgres gratuits (Render, Supabase, Neon,
// Railway…) exigent SSL sur la connexion sortante mais utilisent un
// certificat auto-signé en interne, d'où rejectUnauthorized: false.
// En local (DATABASE_URL non définie ou PGSSL=false), pas de SSL.
const useSSL = process.env.PGSSL === 'true' || (process.env.DATABASE_URL && process.env.NODE_ENV === 'production')

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false
})

// Les routes et scripts de ce projet écrivent leurs requêtes avec des
// placeholders SQLite (?), comme à l'origine du projet. On les convertit
// ici en placeholders Postgres ($1, $2, …) pour ne pas avoir à réécrire
// chaque requête une à une. Aucun littéral '?' n'apparaît dans les
// requêtes du projet, donc ce remplacement positionnel est sûr.
function toPgQuery(sql) {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

async function run(sql, params = []) {
  const result = await pool.query(toPgQuery(sql), params)
  return {
    id: result.rows[0]?.id ?? null,
    changes: result.rowCount
  }
}

async function get(sql, params = []) {
  const result = await pool.query(toPgQuery(sql), params)
  return result.rows[0]
}

async function all(sql, params = []) {
  const result = await pool.query(toPgQuery(sql), params)
  return result.rows
}

module.exports = { pool, run, get, all }
