import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthenticationService } from './auth_service_firebase';

/**
 * Guard réservant une route aux administrateurs.
 * - admin            → accès autorisé ;
 * - connecté non-admin → redirigé vers /unauthorized ;
 * - non connecté      → redirigé vers /login (avec returnUrl).
 */
@Injectable({
  providedIn: 'root',
})
export class AdminGuardService {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authenticationService.userValue;

    if (!user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (this.authenticationService.isAdmin()) {
      return true;
    }

    // Connecté mais pas admin
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
