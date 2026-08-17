// Seed one-off du compte admin dans la collection `users` (issue #32).
//
// Contexte : le modèle de comptes vit désormais dans `users/{uid}` qui pointe
// vers l'archer via `archerId` (l'ID de l'archer reste stable). Le compte admin
// historique était lié par la convention `archers/{docID == uid}`. Ce script crée
// le document `users/{uid} = { archerId: uid, role: 'admin' }` correspondant.
//
// À exécuter UNE fois par l'admin (écrit en PROD) :
//   node seed_admin_user.js
//
// Le login garde un fallback vers `archers/{uid}` : ce seed n'est pas bloquant,
// mais il assure la cohérence (et évite que l'admin apparaisse « non lié » dans
// l'IHM de gestion des comptes).

const admin = require('firebase-admin');
const serviceAccount = require('./arc-distinctions-service-account-key.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();
const auth = admin.auth();

const ADMIN_EMAIL = 'mat.chartier.public@gmail.com'; // email du compte admin

async function seedAdmin() {
  try {
    console.log(`Recherche du compte Auth : ${ADMIN_EMAIL}`);
    const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
    const uid = userRecord.uid;
    console.log(`✓ uid = ${uid}`);

    // Déterminer l'archerId : le doc archer historique a docID == uid.
    const archerByUid = await db.collection('archers').doc(uid).get();
    if (!archerByUid.exists) {
      console.error(`❌ Aucun archers/${uid} : archerId inconnu. Abandon.`);
      return;
    }
    const archerId = uid;

    // Ne pas écraser un compte existant.
    const existing = await db.collection('users').doc(uid).get();
    if (existing.exists) {
      console.log(`ℹ️  users/${uid} existe déjà :`, existing.data());
      console.log('Rien à faire.');
      return;
    }

    await db.collection('users').doc(uid).set({
      archerId,
      role: 'admin',
      email: ADMIN_EMAIL,
      linkedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ users/${uid} créé (archerId=${archerId}, role=admin)`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

seedAdmin();
