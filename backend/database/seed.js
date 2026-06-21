require('dotenv').config()
const bcrypt = require('bcryptjs')
const { run, get, all } = require('./db')
const { initDb } = require('./init')

const ADMIN = {
  username: 'Admin',
  email: 'admin@madagascar-tourism.mg',
  password: 'Admin1234!'
}

// Toutes les photos viennent de Wikimedia Commons (licences Creative Commons).
// Special:FilePath redirige vers le fichier original hébergé sur upload.wikimedia.org
// — c'est le moyen standard et stable d'intégrer un média Commons par URL.
function commons(filename) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`
}

const SITES = [
  {
    name: 'Allée des Baobabs',
    region: 'Menabe',
    category: 'nature',
    latitude: -20.25,
    longitude: 44.4167,
    description:
      "Une rangée de baobabs Adansonia grandidieri vieux de plusieurs centaines d'années, le long de la route entre Morondava et Belon'i Tsiribihina. Le coucher de soleil y est l'un des plus photographiés de Madagascar.",
    image: commons('Allée des Baobabs near Morondava, Madagascar (4315249951).jpg'),
    image_attribution: 'Photo : Frank Vassen / Wikimedia Commons (CC BY 2.0)',
    gallery: [
      { url: commons('Allée des Baobabs near Morondava, Madagascar (4315253769).jpg'), attribution: 'Photo : Frank Vassen / Wikimedia Commons (CC BY 2.0)' },
      { url: commons('Sunset Baobab Avenue Morondava Madagascar - panoramio.jpg'), attribution: 'Photo : Wikimedia Commons (CC BY 3.0)' }
    ]
  },
  {
    name: 'Parc national de l\u2019Isalo',
    region: 'Ihorombe',
    category: 'aventure',
    latitude: -22.5667,
    longitude: 45.3667,
    description:
      "Massif gréseux sculpté par l'érosion, canyons, piscines naturelles et palmiers endémiques. Plusieurs jours de randonnée possibles, dont la célèbre Piscine Bleue et la Piscine Noire.",
    image: commons('Nationaal park Isalo 06.JPG'),
    image_attribution: 'Photo : Wikimedia Commons (CC BY-SA)'
  },
  {
    name: 'Nosy Be',
    region: 'Diana',
    category: 'plage',
    latitude: -13.4028,
    longitude: 48.2853,
    description:
      "Île du nord-ouest réputée pour ses plages, ses îlots (Nosy Komba, Nosy Tanikely) et la plongée. Point de départ classique pour observer baleines et tortues marines selon la saison.",
    image: commons('Ambatoloaka village Nosy Bé 2013 !.JPG'),
    image_attribution: 'Photo : Wikimedia Commons (CC BY-SA)'
  },
  {
    name: 'Andasibe-Mantadia',
    region: 'Alaotra-Mangoro',
    category: 'faune',
    latitude: -18.9381,
    longitude: 48.4197,
    description:
      "Forêt humide à quelques heures d'Antananarivo, célèbre pour le chant matinal de l'Indri indri, le plus grand des lémuriens. Riche en orchidées et amphibiens endémiques.",
    image: commons('INDRI-1.JPG'),
    image_attribution: 'Photo : Adam Britt / Wikimedia Commons (CC BY 3.0)',
    gallery: [
      { url: commons('Indri indri 04.jpg'), attribution: 'Photo : Wikimedia Commons (CC BY-SA 2.0)' }
    ]
  },
  {
    name: 'Rova d\u2019Antananarivo',
    region: 'Analamanga',
    category: 'culture',
    latitude: -18.9239,
    longitude: 47.5328,
    description:
      "Ancien palais royal dominant la capitale, témoin de l'histoire du royaume merina. Vue panoramique sur les douze collines sacrées d'Antananarivo.",
    image: commons('Rova Manjakamiadana 2.jpg'),
    image_attribution: 'Photo : Bluerose25 / Wikimedia Commons (CC BY-SA 4.0)'
  },
  {
    name: 'Récif d\u2019Ifaty',
    region: 'Atsimo-Andrefana',
    category: 'plage',
    latitude: -23.1833,
    longitude: 43.5833,
    description:
      "Village de pêcheurs vezo au bord d'un lagon corallien, à une vingtaine de kilomètres de Toliara. Snorkeling, pirogues traditionnelles et forêt d'épineux à proximité.",
    image: commons('Ifaty beach Madagascar.jpg'),
    image_attribution: 'Photo : Wikimedia Commons (CC BY-SA 3.0)'
  },
  {
    name: 'Réserve d\u2019Ankarafantsika',
    region: 'Boeny',
    category: 'faune',
    latitude: -16.3167,
    longitude: 46.8167,
    description:
      "Forêt sèche protégée entre Mahajanga et Antananarivo, abritant des lacs, des crocodiles, des propithèques de Coquerel et plusieurs espèces d'oiseaux endémiques.",
    image: commons('Lake Ravelobe, Ankarafantsika National Park, Madagascar.jpg'),
    image_attribution: 'Photo : Wikimedia Commons (CC BY)'
  },
  {
    name: 'Tsingy de Bemaraha',
    region: 'Melaky',
    category: 'aventure',
    latitude: -18.7667,
    longitude: 44.75,
    description:
      "Labyrinthe karstique classé à l'UNESCO, fait d'aiguilles calcaires acérées (« tsingy » signifie « là où l'on ne peut marcher pieds nus »). Tyrolinnes, ponts suspendus et canyons à explorer avec un guide."
  },
  {
    name: '\u00cele Sainte-Marie',
    region: 'Analanjirofo',
    category: 'plage',
    latitude: -17.0833,
    longitude: 49.8167,
    description:
      "Île étroite de la côte est, ancien repaire de pirates, aujourd'hui prisée pour ses plages de sable blanc et l'observation des baleines à bosse entre juillet et septembre."
  },
  {
    name: 'Parc national de Ranomafana',
    region: 'Haute Matsiatra',
    category: 'faune',
    latitude: -21.25,
    longitude: 47.4167,
    description:
      "Forêt tropicale humide des hautes terres, refuge de douze espèces de lémuriens dont le rare hapalémur doré. Sentiers escarpés, cascades et sources thermales à proximité."
  },
  {
    name: 'R\u00e9serve d\u2019Anja',
    region: 'Haute Matsiatra',
    category: 'faune',
    latitude: -21.8667,
    longitude: 46.9333,
    description:
      "Petite réserve communautaire près d'Ambalavao, célèbre pour ses colonies de makis catta (lémuriens à queue annelée) faciles à observer parmi les rochers de granit."
  },
  {
    name: 'Antsirabe',
    region: 'Vakinankaratra',
    category: 'culture',
    latitude: -19.8667,
    longitude: 47.0333,
    description:
      "Ville thermale d'altitude à l'architecture coloniale, connue pour ses pousse-pousse colorés, ses ateliers d'artisanat (corne zébu, miniatures en boîte de conserve) et son eau minérale."
  },
  {
    name: 'Fianarantsoa',
    region: 'Haute Matsiatra',
    category: 'culture',
    latitude: -21.45,
    longitude: 47.0833,
    description:
      "Capitale culturelle des hautes terres du sud, avec sa vieille ville aux maisons en briques rouges et ses vignobles environnants — une rareté sous les tropiques."
  },
  {
    name: 'Parc national de la Montagne d\u2019Ambre',
    region: 'Diana',
    category: 'nature',
    latitude: -12.5167,
    longitude: 49.1667,
    description:
      "Forêt tropicale en altitude près d'Antsiranana (Diego Suarez), avec cascades, lacs de cratère et une riche biodiversité de chaméléons et d'orchidées endémiques."
  },
  {
    name: 'Tsingy Rouge',
    region: 'Diana',
    category: 'nature',
    latitude: -12.3667,
    longitude: 49.3333,
    description:
      "Formations de latérite rouge sculptées par l'érosion près de Diego Suarez, aux couleurs flamboyantes au lever et au coucher du soleil — un paysage unique au monde, hors des sentiers battus."
  }
]

async function seed() {
  await initDb()

  const existingSites = await get('SELECT COUNT(*) AS count FROM sites')
  if (existingSites.count === 0) {
    for (const site of SITES) {
      const { id } = await run(
        'INSERT INTO sites (name, region, description, image, image_attribution, category, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
        [
          site.name,
          site.region,
          site.description,
          site.image || '',
          site.image_attribution || null,
          site.category,
          site.latitude,
          site.longitude
        ]
      )
      if (site.gallery) {
        for (let i = 0; i < site.gallery.length; i++) {
          const photo = site.gallery[i]
          await run(
            'INSERT INTO site_images (site_id, url, attribution, position) VALUES (?, ?, ?, ?) RETURNING id',
            [id, photo.url, photo.attribution, i]
          )
        }
      }
    }
    console.log(`${SITES.length} sites insérés (avec catégories, coordonnées et photos Wikimedia Commons).`)
  } else {
    console.log('Sites déjà présents, seed ignoré.')
  }

  const existingAdmin = await get('SELECT id FROM users WHERE email = ?', [ADMIN.email])
  if (!existingAdmin) {
    const hash = await bcrypt.hash(ADMIN.password, 10)
    await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?) RETURNING id',
      [ADMIN.username, ADMIN.email, hash, 'admin']
    )
    console.log(`Compte admin créé → email: ${ADMIN.email} / mot de passe: ${ADMIN.password}`)
  } else {
    console.log('Compte admin déjà présent, seed ignoré.')
  }

  const counts = await all('SELECT (SELECT COUNT(*) FROM sites) AS sites, (SELECT COUNT(*) FROM users) AS users')
  console.log('État de la base :', counts[0])
  process.exit(0)
}

seed().catch((err) => {
  console.error('Erreur pendant le seed :', err)
  process.exit(1)
})
