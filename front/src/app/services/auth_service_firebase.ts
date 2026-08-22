import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../model/user';
import { Router } from '@angular/router';

// Import Firebase directement (sans @angular/fire)
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  Auth,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Firestore
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  
  private app: FirebaseApp;
  private auth: Auth;
  private firestore: Firestore;

  constructor() {
    // Initialiser Firebase
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);

    // Récupérer l'utilisateur du localStorage au démarrage
    const storedUser = localStorage.getItem('user');
    this.userSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.user = this.userSubject.asObservable();

    // Écouter les changements d'état d'authentification Firebase.
    // Le callback est exécuté hors de la zone Angular : on le ré-entre via
    // NgZone.run() pour que la détection de changement se déclenche (menu, etc.).
    onAuthStateChanged(this.auth, (firebaseUser) => {
      this.ngZone.run(async () => {
        if (firebaseUser) {
          try {
            const archerData = await this.loadArcherData(firebaseUser.uid);
            if (archerData) {
              localStorage.setItem('user', JSON.stringify(archerData));
              this.userSubject.next(archerData);
            } else {
              // Compte de connexion supprimé (users/{uid} confirmé absent, pas
              // une erreur réseau) : révoquer la session. Le signOut relance ce
              // callback avec firebaseUser=null → nettoyage du cache ci-dessous.
              console.warn('[Auth] Compte introuvable pour', firebaseUser.uid, '— déconnexion.');
              await signOut(this.auth);
            }
          } catch (error) {
            // Erreur réseau/Firestore : ne PAS déconnecter, conserver l'état
            // courant (évite de vider les sessions à la moindre coupure).
            console.error('[Auth] Chargement du compte échoué (session conservée):', error);
          }
        } else {
          localStorage.removeItem('user');
          this.userSubject.next(null);
        }
      });
    });
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  /**
   * Login avec email et mot de passe
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const archerData = await this.loadArcherData(userCredential.user.uid);

      if (archerData) {
        localStorage.setItem('user', JSON.stringify(archerData));
        this.userSubject.next(archerData);
        return archerData;
      }

      throw new Error('Données utilisateur introuvables');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/user-not-found') {
        throw new Error('Email et/ou mot de passe incorrect');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives. Réessayez plus tard.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Erreur réseau. Vérifiez votre connexion.');
      }
      
      throw new Error('Erreur de connexion: ' + error.message);
    }
  }

  /**
   * Login avec numéro de licence (pour garder la compatibilité)
   * Recherche l'email associé au numéro de licence puis fait le login
   */
  async loginWithLicence(noLicence: string, password: string): Promise<User | null> {
    try {
      const archersRef = collection(this.firestore, 'archers');
      const q = query(archersRef, where('noLicence', '==', noLicence));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Numéro de licence inconnu');
      }

      const archerDoc = querySnapshot.docs[0];
      const archerData = archerDoc.data();

      if (!archerData['email']) {
        throw new Error('Aucun email associé à cette licence. Contactez l\'administrateur.');
      }

      return await this.login(archerData['email'], password);

    } catch (error: any) {
      console.error('Erreur de connexion avec licence:', error);
      throw error;
    }
  }

  /**
   * Charge les données complètes de l'utilisateur connecté.
   *
   * Modèle courant : un document `users/{uid}` porte le rôle et pointe vers
   * l'archer via `archerId` (l'ID de l'archer reste stable, cf. issue #32).
   * Fallback legacy : si aucun `users/{uid}` n'existe encore (ex. compte admin
   * pas encore seedé), on retombe sur l'ancien schéma `archers/{uid}`.
   *
   * Retourne `null` uniquement quand le compte est **réellement absent**
   * (aucun `users/{uid}` ni `archers/{uid}`) : l'appelant peut alors révoquer la
   * session. Les erreurs réseau/Firestore sont **propagées** (et non converties
   * en `null`) pour ne pas confondre « compte supprimé » et « lecture échouée ».
   */
  private async loadArcherData(uid: string): Promise<User | null> {
    // Schéma courant : users/{uid} → archerId + role
    const userSnap = await getDoc(doc(this.firestore, 'users', uid));
    if (userSnap.exists()) {
      const account = userSnap.data();
      const archerId = account['archerId'];
      const archerSnap = await getDoc(doc(this.firestore, 'archers', archerId));
      if (!archerSnap.exists()) {
        console.error('Compte lié à un archer introuvable:', archerId);
        return null;
      }
      const archer = archerSnap.data();
      return {
        id: archerId,
        noLicence: archer['noLicence'],
        nom: archer['nom'],
        prenom: archer['prenom'],
        role: account['role'] || 'archer',
        email: account['email'] || archer['email'],
      } as User;
    }

    // Fallback legacy : archers/{uid} (docID == uid)
    const archerSnap = await getDoc(doc(this.firestore, 'archers', uid));
    if (!archerSnap.exists()) {
      return null;
    }
    const data = archerSnap.data();
    return {
      id: uid,
      noLicence: data['noLicence'],
      nom: data['nom'],
      prenom: data['prenom'],
      role: data['role'] || 'archer',
      email: data['email'],
    } as User;
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem('user');
      this.userSubject.next(null);
      this.router.navigate(['/']); // retour à l'accueil public
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.userValue?.role === 'admin';
  }
}