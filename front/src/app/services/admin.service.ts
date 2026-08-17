import { Injectable, inject } from '@angular/core';
import { initializeApp, getApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { environment } from '../../environments/environment';
import { FirestoreService } from './firestore.service';
import { ArcherDoc } from '../model/firestore-types';

/**
 * Administration des comptes (issue #32).
 *
 * Flux 100 % front (pas de backend) : la création d'un compte Firebase Auth se
 * fait via une 2ᵉ app Firebase « secondary » pour ne PAS déconnecter l'admin
 * courant (createUserWithEmailAndPassword connecte l'app qui l'appelle). L'app
 * secondaire est détruite juste après.
 *
 * Le lien compte ↔ archer vit dans la collection `users/{uid}` : l'ID de
 * l'archer reste stable, aucune migration de resultats/distinctions.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private firestore = inject(FirestoreService);

  /**
   * Crée un accès (compte Firebase Auth) pour un archer importé et le lie via
   * `users/{uid}`. L'archer reçoit un email de définition de mot de passe :
   * le mot de passe aléatoire généré ici n'est jamais affiché ni communiqué.
   */
  async createAccessForArcher(
    archer: ArcherDoc,
    email: string,
    role: 'admin' | 'archer'
  ): Promise<void> {
    // 1. Créer le compte Auth sans toucher à la session de l'admin.
    const secondaryApp = initializeApp(environment.firebase, 'secondary');
    let uid: string;
    try {
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        this.randomPassword()
      );
      uid = cred.user.uid;
    } finally {
      // Toujours nettoyer l'app secondaire (évite un 2ᵉ onAuthStateChanged).
      await deleteApp(secondaryApp);
    }

    // 2. Envoyer l'invitation (mail de définition de mot de passe) via l'app principale.
    await sendPasswordResetEmail(getAuth(getApp()), email);

    // 3. Lier le compte à l'archer (un seul document, atomique).
    await this.firestore.createUserAccount(uid, { archerId: archer.id, role, email });
  }

  /** Renvoie l'email d'invitation / de réinitialisation de mot de passe. */
  async resendInvite(email: string): Promise<void> {
    await sendPasswordResetEmail(getAuth(getApp()), email);
  }

  /** Change le rôle d'un compte (effectif à la prochaine connexion de la cible). */
  async setRole(uid: string, role: 'admin' | 'archer'): Promise<void> {
    await this.firestore.updateUserRole(uid, role);
  }

  /** Mot de passe aléatoire jetable — jamais affiché, seul le mail de reset fait foi. */
  private randomPassword(): string {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return 'Aa1!' + btoa(String.fromCharCode(...bytes)).replace(/[^a-zA-Z0-9]/g, '');
  }
}
