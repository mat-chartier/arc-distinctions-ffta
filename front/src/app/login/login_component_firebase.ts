import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from '../services/auth_service_firebase';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  constructor() {
    // Rediriger vers l'accueil si déjà connecté
    if (this.authenticationService.userValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      licence: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  // Getter pour accéder facilement aux champs du formulaire
  get f() {
    return this.loginForm.controls;
  }

  async onSubmit() {
    this.submitted = true;

    // Arrêter si le formulaire est invalide
    if (this.loginForm.invalid) {
      return;
    }

    this.error = '';
    this.loading = true;

    try {
      // Tentative de connexion avec le numéro de licence
      const archer = await this.authenticationService.loginWithLicence(
        this.f['licence'].value,
        this.f['password'].value
      );

      if (archer != null) {
        // Rediriger vers la page d'accueil
        this.router.navigate(['']);
      } else {
        this.error = 'Erreur de connexion';
        this.loading = false;
      }
    } catch (error: any) {
      this.error = error.message || 'Une erreur est survenue lors de la connexion';
      this.loading = false;
    }
  }
}