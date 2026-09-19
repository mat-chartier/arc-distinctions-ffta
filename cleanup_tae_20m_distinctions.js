/**
 * Nettoyage (#47) — Supprime les distinctions créées à tort pour des résultats
 * TAE (discipline "T") tirés à 20m.
 *
 * Contexte : avant le correctif de règle, `getTAEDistinctionTemplate` mappait la
 * distance 20m vers TAEDN/TAEDI et attribuait une distinction. Or le TAE à 20m
 * ne donne droit à aucune distinction. Des distinctions ont donc pu être créées
 * à tort en base et doivent être supprimées.
 *
 * SÉCURITÉ :
 *  - DRY-RUN par défaut : le script ne fait que LIRE et lister ce qui serait
 *    supprimé. Aucune écriture tant que le flag --apply n'est pas passé.
 *  - Lancer la suppression réelle :  node cleanup_tae_20m_distinctions.js --apply
 *
 * Pré-requis : ./arc-distinctions-service-account-key.json (compte de service Admin).
 */
const admin = require('firebase-admin');

const serviceAccount = require('./arc-distinctions-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const APPLY = process.argv.includes('--apply');

async function cleanup() {
  console.log(
    APPLY
      ? '⚠️  Mode APPLY : les distinctions concernées seront SUPPRIMÉES.'
      : 'ℹ️  Mode DRY-RUN : lecture seule, aucune suppression. Passer --apply pour supprimer.'
  );

  // 1. Identifier les résultats TAE (discipline "T") tirés à 20m.
  const resultatsSnap = await db
    .collection('resultats')
    .where('discipline', '==', 'T')
    .where('distance', '==', 20)
    .get();

  const tae20mResultatIds = new Set(resultatsSnap.docs.map((d) => d.id));
  console.log(`\nRésultats TAE à 20m trouvés : ${tae20mResultatIds.size}`);

  if (tae20mResultatIds.size === 0) {
    console.log('Rien à nettoyer. Fin.');
    return;
  }

  // 2. Retrouver les distinctions rattachées à ces résultats.
  //    On balaie la collection distinctions et on filtre par resultatId.
  const distinctionsSnap = await db.collection('distinctions').get();
  const aSupprimer = distinctionsSnap.docs.filter((d) =>
    tae20mResultatIds.has(d.data().resultatId)
  );

  console.log(`Distinctions rattachées à supprimer : ${aSupprimer.length}`);
  for (const d of aSupprimer) {
    const data = d.data();
    console.log(
      `  - ${d.id} | archer=${data.archerId} | ${data.discipline} | ` +
        `distance=${data.distance} | nom="${data.nom}" | resultat=${data.resultatId}`
    );
  }

  if (!APPLY) {
    console.log('\nDRY-RUN terminé. Aucune donnée modifiée.');
    return;
  }

  // 3. Suppression par batchs de 500 (limite Firestore).
  let batch = db.batch();
  let count = 0;
  let total = 0;
  for (const d of aSupprimer) {
    batch.delete(d.ref);
    count++;
    total++;
    if (count === 500) {
      await batch.commit();
      console.log(`Supprimé ${total} distinctions...`);
      batch = db.batch();
      count = 0;
    }
  }
  if (count > 0) {
    await batch.commit();
  }
  console.log(`\n✓ ${total} distinctions supprimées.`);
}

cleanup()
  .catch((err) => {
    console.error('Erreur de nettoyage :', err);
    process.exitCode = 1;
  })
  .finally(() => admin.app().delete());
