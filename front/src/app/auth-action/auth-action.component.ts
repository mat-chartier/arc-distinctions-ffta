import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthenticationService } from '../services/auth_service_firebase';

/**
 * Page d'action Firebase personnalisée (issue #41).
 *
 * Remplace la page par défaut de Firebase (`/__/auth/action`) pour la
 * réinitialisation de mot de passe (aussi utilisée pour l'invitation initiale) :
 * page brandée, deux champs (mot de passe + confirmation), messages clairs.
 *
 * L'« action URL » configurée dans la console Firebase doit pointer vers
 * `/auth/action`. Firebase y ajoute les paramètres `mode` et `oobCode`.
 */
@Component({
  selector: 'app-auth-action',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth-action.component.html',
  styleUrl: './auth-action.component.scss',
})
export class AuthActionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthenticationService);
  private fb = inject(FormBuilder);

  /** États de la page. */
  verifying = true; // vérification du code en cours
  submitting = false; // enregistrement du nouveau mot de passe en cours
  success = false; // mot de passe changé avec succès
  error = ''; // erreur bloquante (code invalide/expiré, mode non géré)

  mode: string | null = null;
  email = ''; // email associé au code (affiché à titre indicatif)
  private oobCode: string | null = null;

  form: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]],
    },
    { validators: [AuthActionComponent.passwordsMatch] }
  );

  get f() {
    return this.form.controls;
  }

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;
    this.mode = params.get('mode');
    this.oobCode = params.get('oobCode');

    if (this.mode !== 'resetPassword' || !this.oobCode) {
      this.error =
        "Lien invalide ou action non prise en charge. Utilisez le lien reçu par email.";
      this.verifying = false;
      return;
    }

    try {
      this.email = await this.auth.verifyResetCode(this.oobCode);
    } catch (e: any) {
      this.error = this.humanizeError(e);
    } finally {
      this.verifying = false;
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || !this.oobCode) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.error = '';
    try {
      await this.auth.confirmReset(this.oobCode, this.f['password'].value);
      this.success = true;
    } catch (e: any) {
      this.error = this.humanizeError(e);
    } finally {
      this.submitting = false;
    }
  }

  /** Validateur : le mot de passe et sa confirmation doivent être identiques. */
  private static passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pwd = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;
    return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
  }

  private humanizeError(e: any): string {
    switch (e?.code) {
      case 'auth/expired-action-code':
        return "Ce lien a expiré. Demandez un nouvel email de réinitialisation.";
      case 'auth/invalid-action-code':
        return "Ce lien n'est plus valide (déjà utilisé ou incorrect). Demandez un nouvel email.";
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé. Contactez un administrateur.';
      case 'auth/user-not-found':
        return "Aucun compte ne correspond à ce lien.";
      case 'auth/weak-password':
        return 'Mot de passe trop faible (8 caractères minimum).';
      default:
        return 'Une erreur est survenue : ' + (e?.message ?? e);
    }
  }
}
