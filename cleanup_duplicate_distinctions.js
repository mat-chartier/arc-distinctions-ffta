/**
 * Nettoyage (#46) — Dédoublonne les distinctions : un archer ne doit détenir
 * qu'UN exemplaire par type physique de distinction.
 *
 * Contexte : un même archer peut avoir plusieurs résultats ouvrant droit au même
 * niveau de distinction (même écusson physique). L'écran « à commander » a été
 * corrigé pour n'en compter qu'un ; mais les enregistrements en double persistent
 * en base (ils pèsent sur la fiche archer et le décompte de stock). On ne conserve
 * que l'exemplaire de la saison la plus ANCIENNE (chronologie d'obtention).
 *
 * Identité de type = clé de stock (cf. front/src/app/model/stock-key.ts, source de
 * vérité) : discipline + armeGroup(Salle/TAEDI uniquement) + nom + distance(TAEDI).
 *
 * SÉCURITÉ :
 *  - DRY-RUN par défaut (lecture seule). Suppression réelle : --apply.
 *  - Un doublon dont l'exemplaire à supprimer est au statut « Donnée » N'EST PAS
 *    supprimé (médaille déjà remise) : le cas est signalé pour traitement manuel.
 *
 * Pré-requis : ./arc-distinctions-service-account-key.json
 */
const admin = require('firebase-admin');
const serviceAccount = require('./arc-distinctions-service-account-key.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const APPLY = process.argv.includes('--apply');

// --- Miroir de model/stock-key.ts (garder synchronisé) ---
function armeGroup(discipline, arme) {
  if (discipline === 'Salle' || discipline === 'TAEDI') {
    return arme === 'CO' ? 'CO' : 'CLBB';
  }
  return null;
}
function buildStockKey(t) {
  const ag = armeGroup(t.discipline, t.arme);
  const parts = [t.discipline, ag ?? '', (t.nom ?? '').trim()];
  if (t.discipline === 'TAEDI') parts.push(String(t.distance ?? 0));
  return parts.join('|');
}

async function cleanup() {
  console.log(
    APPLY
      ? '⚠️  Mode APPLY : les doublons (hors « Donnée ») seront SUPPRIMÉS.'
      : 'ℹ️  Mode DRY-RUN : lecture seule. Passer --apply pour supprimer.'
  );

  const [dSnap, aSnap, rSnap] = await Promise.all([
    db.collection('distinctions').get(),
    db.collection('archers').get(),
    db.collection('resultats').get(),
  ]);
  const archers = new Map(); aSnap.forEach((d) => archers.set(d.id, d.data()));
  const resultats = new Map(); rSnap.forEach((d) => resultats.set(d.id, d.data()));

  // Regroupe par (archer, clé de stock)
  const groups = new Map();
  dSnap.forEach((doc) => {
    const x = doc.data();
    const r = resultats.get(x.resultatId);
    const a = archers.get(x.archerId);
    if (!r || !a) return; // orphelin : on ne touche pas
    const key = `${x.archerId}::${buildStockKey({ discipline: x.discipline, nom: x.nom, arme: r.arme, distance: x.distance })}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      ref: doc.ref, docId: doc.id, statut: x.statut,
      saison: r.saison, score: r.score, nom: x.nom, discipline: x.discipline,
      archer: `${a.prenom} ${a.nom}`,
    });
  });

  const aSupprimer = [];
  const bloques = [];
  for (const entries of groups.values()) {
    if (entries.length < 2) continue;
    // plus ancienne saison d'abord ; à saison égale, plus petit score d'abord (arbitraire stable)
    entries.sort((p, q) => (p.saison - q.saison) || (p.score - q.score));
    const garde = entries[0];
    const surplus = entries.slice(1);
    const donneeParmiSurplus = surplus.some((s) => s.statut === 'Donnée');
    console.log(
      `\n[${garde.discipline} | "${garde.nom}"] ${garde.archer} : ${entries.length} exemplaires ` +
        `→ garde ${garde.score}(${garde.saison})[${garde.statut}]`
    );
    for (const s of surplus) {
      console.log(`    surplus : ${s.score}(${s.saison})[${s.statut}] doc=${s.docId}`);
    }
    if (donneeParmiSurplus) {
      console.log('    ⚠️  surplus contient une distinction « Donnée » → NON supprimé (à traiter manuellement).');
      bloques.push(...surplus);
    } else {
      aSupprimer.push(...surplus);
    }
  }

  console.log(`\n=== SYNTHESE ===`);
  console.log(`Documents en doublon à supprimer : ${aSupprimer.length}`);
  console.log(`Doublons bloqués (statut « Donnée ») : ${bloques.length}`);

  if (!APPLY) {
    console.log('\nDRY-RUN terminé. Aucune donnée modifiée.');
    return;
  }
  if (aSupprimer.length === 0) {
    console.log('\nRien à supprimer.');
    return;
  }

  let batch = db.batch();
  let n = 0, total = 0;
  for (const s of aSupprimer) {
    batch.delete(s.ref);
    n++; total++;
    if (n === 500) { await batch.commit(); console.log(`Supprimé ${total}...`); batch = db.batch(); n = 0; }
  }
  if (n > 0) await batch.commit();
  console.log(`\n✓ ${total} distinctions en doublon supprimées.`);
}

cleanup()
  .catch((e) => { console.error('Erreur de nettoyage :', e); process.exitCode = 1; })
  .finally(() => admin.app().delete());
