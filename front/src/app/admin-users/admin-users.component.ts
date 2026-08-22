import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AppStore } from '../services/app.store';
import { FirestoreService } from '../services/firestore.service';
import { AdminService } from '../services/admin.service';
import { ArcherDoc, UserAccountDoc } from '../model/firestore-types';

interface AccountRow {
  uid: string;
  archer: ArcherDoc | null;
  nom: string;
  prenom: string;
  noLicence: string;
  email: string;
  role: string;
}

interface RoleOption {
  label: string;
  value: 'admin' | 'archer';
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private store = inject(AppStore);
  private firestore = inject(FirestoreService);
  private admin = inject(AdminService);

  loading = true;
  error = '';
  info = '';

  accounts: AccountRow[] = [];
  unlinkedArchers: ArcherDoc[] = [];

  roleOptions: RoleOption[] = [
    { label: 'Administrateur', value: 'admin' },
    { label: 'Archer', value: 'archer' },
  ];

  // Dialog « créer un accès »
  showCreateDialog = false;
  saving = false;
  dialogError = '';
  selectedArcher: ArcherDoc | null = null;
  newEmail = '';
  newRole: 'admin' | 'archer' = 'archer';

  // Dialog « retirer l'accès »
  showRemoveDialog = false;
  removing = false;
  removeTarget: AccountRow | null = null;

  async ngOnInit() {
    await this.fetchData();
  }

  async fetchData() {
    try {
      this.loading = true;
      this.error = '';

      const [archers, users] = await Promise.all([
        this.store.getArchers(),
        this.firestore.getUsers(),
      ]);

      const archersMap = new Map(archers.map(a => [a.id, a]));
      const linkedIds = new Set(users.map(u => u.archerId));

      this.accounts = users
        .map((u: UserAccountDoc) => {
          const archer = archersMap.get(u.archerId) ?? null;
          return {
            uid: u.id,
            archer,
            nom: archer?.nom ?? '(archer supprimé)',
            prenom: archer?.prenom ?? '',
            noLicence: archer?.noLicence ?? '',
            email: u.email ?? archer?.email ?? '',
            role: u.role ?? 'archer',
          };
        })
        .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom));

      this.unlinkedArchers = archers
        .filter(a => !linkedIds.has(a.id))
        .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`));
    } catch (e: any) {
      console.error('Erreur lors du chargement des comptes:', e);
      this.error = 'Erreur lors du chargement des comptes';
    } finally {
      this.loading = false;
    }
  }

  archerLabel(a: ArcherDoc): string {
    return `${a.nom} ${a.prenom} (${a.noLicence})`;
  }

  roleLabel(role: string): string {
    return role === 'admin' ? 'Administrateur' : 'Archer';
  }

  // ── Dialog ────────────────────────────────────────────────────────────────

  openCreateDialog() {
    this.selectedArcher = null;
    this.newEmail = '';
    this.newRole = 'archer';
    this.dialogError = '';
    this.showCreateDialog = true;
  }

  onArcherSelected() {
    // Pré-remplir l'email avec celui de l'archer s'il en a un.
    this.newEmail = this.selectedArcher?.email ?? '';
  }

  async submitCreate() {
    if (!this.selectedArcher || !this.newEmail.trim()) return;
    this.saving = true;
    this.dialogError = '';
    this.info = '';
    try {
      await this.admin.createAccessForArcher(
        this.selectedArcher,
        this.newEmail.trim(),
        this.newRole
      );
      this.info = `Accès créé pour ${this.selectedArcher.nom} ${this.selectedArcher.prenom}. Un email de définition de mot de passe a été envoyé à ${this.newEmail.trim()}.`;
      this.showCreateDialog = false;
      await this.fetchData();
    } catch (e: any) {
      console.error('Erreur lors de la création de l\'accès:', e);
      this.dialogError = this.humanizeError(e);
    } finally {
      this.saving = false;
    }
  }

  // ── Actions par ligne ───────────────────────────────────────────────────────

  async toggleRole(row: AccountRow) {
    const next: 'admin' | 'archer' = row.role === 'admin' ? 'archer' : 'admin';
    this.error = '';
    this.info = '';
    try {
      await this.admin.setRole(row.uid, next);
      row.role = next;
      this.info = `Rôle de ${row.nom} ${row.prenom} changé en « ${this.roleLabel(next)} ». Effectif à sa prochaine connexion.`;
    } catch (e: any) {
      console.error('Erreur lors du changement de rôle:', e);
      this.error = 'Erreur lors du changement de rôle';
    }
  }

  openRemoveDialog(row: AccountRow) {
    this.removeTarget = row;
    this.dialogError = '';
    this.showRemoveDialog = true;
  }

  async confirmRemove() {
    if (!this.removeTarget) return;
    const target = this.removeTarget;
    this.removing = true;
    this.dialogError = '';
    this.info = '';
    try {
      await this.admin.removeAccess(target.uid);
      this.info = `Accès retiré pour ${target.nom} ${target.prenom}. Le compte Firebase Auth${target.email ? ` (${target.email})` : ''} n'a pas été supprimé — pense à le retirer dans Authentication > Users pour révoquer totalement l'accès.`;
      this.showRemoveDialog = false;
      await this.fetchData();
    } catch (e: any) {
      console.error('Erreur lors du retrait de l\'accès:', e);
      this.dialogError = 'Erreur lors du retrait de l\'accès : ' + (e?.message ?? e);
    } finally {
      this.removing = false;
    }
  }

  async resend(row: AccountRow) {
    if (!row.email) return;
    this.error = '';
    this.info = '';
    try {
      await this.admin.resendInvite(row.email);
      this.info = `Email de réinitialisation renvoyé à ${row.email}.`;
    } catch (e: any) {
      console.error('Erreur lors du renvoi de l\'invitation:', e);
      this.error = 'Erreur lors du renvoi de l\'invitation';
    }
  }

  private humanizeError(e: any): string {
    switch (e?.code) {
      case 'auth/email-already-in-use':
        return 'Un compte existe déjà pour cet email.';
      case 'auth/invalid-email':
        return 'Email invalide.';
      case 'auth/weak-password':
        return 'Mot de passe trop faible (erreur interne).';
      default:
        return 'Erreur lors de la création de l\'accès : ' + (e?.message ?? e);
    }
  }
}
