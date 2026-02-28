import { Injectable, inject } from '@angular/core';
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

    // Écouter les changements d'état d'authentification Firebase
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const archerData = await this.loadArcherData(firebaseUser.uid);
        if (archerData) {
          localStorage.setItem('user', JSON.stringify(archerData));
          this.userSubject.next(archerData);
        }
      } else {
        localStorage.removeItem('user');
        this.userSubject.next(null);
      }
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
   * Charge les données complètes de l'archer depuis Firestore
   */
  private async loadArcherData(uid: string): Promise<User | null> {
    try {
      const archerRef = doc(this.firestore, 'archers', uid);
      const archerSnap = await getDoc(archerRef);
      
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
        email: data['email']
      } as User;
    } catch (error) {
      console.error('Erreur lors du chargement des données archer:', error);
      return null;
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem('user');
      this.userSubject.next(null);
      this.router.navigate(['/login']);
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