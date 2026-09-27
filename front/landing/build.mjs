// Génère landing/distinctions.html (référentiel public des distinctions FFTA et
// de leurs barèmes) à partir des données de landing/src/baremes.ts.
//
//   node landing/build.mjs          → (ré)écrit distinctions.html
//   node landing/build.mjs --check  → échoue si distinctions.html n'est pas à jour
//
// Page 100 % statique (bon pour le référencement) : seuls les onglets utilisent
// quelques lignes de JS, et la page reste lisible sans.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ts = require('typescript'); // dépendance déjà présente (Angular)

// ── Chargement des barèmes (TypeScript → module JS en mémoire) ────────────
const source = readFileSync(join(here, 'src/baremes.ts'), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const B = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));

// ── Helpers de rendu ──────────────────────────────────────────────────────
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const imgExists = (slug) => existsSync(join(here, 'images/distinctions', `${slug}.png`));
const img = (slug, alt, cls = 'palier-img') =>
  `<img class="${cls}" src="images/distinctions/${slug}.png" alt="${esc(alt)}" loading="lazy">`;

/** Classe de la pastille de repli d'un palier Salle/TAE (couleur de cible). */
function classePalier(nom) {
  if (nom.includes('étoile')) return 'palier--etoile';
  if (nom.startsWith('Vert')) return 'palier--vert';
  if (nom.startsWith('Blanc')) return 'palier--blanc';
  if (nom.startsWith('Noir')) return 'palier--noir';
  if (nom.startsWith('Bleu')) return 'palier--bleu';
  if (nom.startsWith('Rouge')) return 'palier--rouge';
  if (nom.startsWith('Jaune')) return 'palier--jaune';
  return 'palier--defaut';
}
const etoiles = (nom) => '★'.repeat(Number(nom.match(/^(\d)\s*étoile/)?.[1] ?? 0));

const visuel = (p) =>
  imgExists(p.image) ? img(p.image, p.nom) : `<span class="palier ${classePalier(p.nom)}" aria-hidden="true">${etoiles(p.nom)}</span>`;

const visuelCamp = (p) =>
  imgExists(p.image)
    ? img(p.image, `${p.medaille} sur fond ${p.fond}`)
    : `<span class="camp camp--fond-${p.fond}" aria-hidden="true"><span class="camp-med camp-med--${p.medaille.toLowerCase()}"></span></span>`;

const thead = (colonnes) =>
  `<thead><tr><th scope="col">Distinction</th>${colonnes.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>`;

const note = (bm) => (bm.note ? `<p class="note">${esc(bm.note)}</p>` : '');

/** Carte d'un barème multi-colonnes (Salle, TAE DI, TAE DN, Beursault). */
function carteMulti(bm) {
  const lignes = bm.paliers.map((p) => {
    const badges = [
      p.image ? visuel(p) : '',
      p.images?.length
        ? `<span class="dn-badges">${p.images.filter(imgExists).map((s) => img(s, p.nom, 'dn-badge')).join('')}</span>`
        : '',
    ].join('');
    const cellules = p.colonnes
      .map((c) => `<td class="bm-plage">${c.image && imgExists(c.image) ? img(c.image, p.nom, 'palier-img palier-img--sm') : ''}${esc(c.plage)}</td>`)
      .join('');
    return `<tr><th scope="row"><div class="bm-distinction">${badges}<span class="palier-nom">${esc(p.nom)}</span></div></th>${cellules}</tr>`;
  });
  return carte(bm, lignes);
}

/** Carte d'un barème Campagne / 3D / Nature (médaille sur fond). */
function carteCamp(bm) {
  const lignes = bm.paliers.map(
    (p) =>
      `<tr><th scope="row"><div class="bm-distinction">${visuelCamp(p)}<span class="palier-nom">${esc(p.medaille)} sur fond ${esc(p.fond)}</span></div></th>${p.plages
        .map((pl) => `<td class="bm-plage">${esc(pl)}</td>`)
        .join('')}</tr>`,
  );
  return carte(bm, lignes);
}

const carte = (bm, lignes) => `
        <article class="bareme">
          <h3>${esc(bm.titre)}</h3>
          <div class="table-scroll">
            <table>${thead(bm.colonnes)}<tbody>${lignes.join('')}</tbody></table>
          </div>${note(bm)}
        </article>`;

// ── Onglets ───────────────────────────────────────────────────────────────
const ONGLETS = [
  { id: 'salle', titre: 'Salle', contenu: carteMulti(B.SALLE) },
  {
    id: 'tae',
    titre: 'TAE extérieur',
    contenu: `
        <p class="encart"><strong>Deux distinctions distinctes :</strong> <strong>TAE DI</strong> (Distances Internationales), badges de couleur Vert → 3 étoiles, et <strong>TAE DN</strong> (Distances Nationales), distinctions « Archers ».</p>${carteMulti(B.TAE_DI)}${carteMulti(B.TAE_DN)}`,
  },
  { id: 'campagne', titre: 'Campagne', contenu: carteCamp(B.CAMPAGNE_MARCASSIN) + carteCamp(B.CAMPAGNE_ECUREUIL) },
  { id: '3d', titre: '3D', contenu: carteCamp(B.BROCARD_3D) + carteCamp(B.LYNX_3D) },
  { id: 'nature', titre: 'Nature', contenu: carteCamp(B.SANGLIER_NATURE) + carteCamp(B.MARCASSIN_NATURE) },
  { id: 'beursault', titre: 'Beursault', contenu: carteMulti(B.BEURSAULT) },
];

const tabs = ONGLETS.map((o) => `<a href="#${o.id}" role="tab" aria-controls="panel-${o.id}">${esc(o.titre)}</a>`).join('\n          ');
const panels = ONGLETS.map(
  (o) => `
      <section class="panel" id="panel-${o.id}" role="tabpanel" aria-label="${esc(o.titre)}">
        <h2 class="panel-titre">${esc(o.titre)}</h2>${o.contenu}
      </section>`,
).join('\n');

// ── Page ──────────────────────────────────────────────────────────────────
const template = readFileSync(join(here, 'src/distinctions.template.html'), 'utf8');
const html = template
  .replace('<!-- @TABS -->', tabs)
  .replace('<!-- @PANELS -->', panels);

const out = join(here, 'distinctions.html');
if (process.argv.includes('--check')) {
  const actuel = existsSync(out) ? readFileSync(out, 'utf8') : '';
  if (actuel !== html) {
    console.error('distinctions.html n\'est pas à jour : lancez `npm run build:landing`.');
    process.exit(1);
  }
  console.log('distinctions.html à jour.');
} else {
  writeFileSync(out, html);
  console.log('distinctions.html généré.');
}
