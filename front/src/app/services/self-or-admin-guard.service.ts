import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthenticationService } from './auth_service_firebase';

/**
 * Guard de la fiche archer (`archer/:id`).
 * Un archer ne peut consulter que **sa propre** fiche ; l'admin voit tout.
 * - non connecté             → redirigé vers /login (avec returnUrl) ;
 * - admin                    → accès autorisé (n'importe quel id) ;
 * - archer sur sa fiche      → accès autorisé (id == son archerId) ;
 * - archer sur une autre fiche → redirigé vers /unauthorized.
 */
@Injectable({
  providedIn: 'root',
})
export class SelfOrAdminGuardService {
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

    const id = route.paramMap.get('id');
    if (this.authenticationService.isAdmin() || id === user.id) {
      return true;
    }

    // Connecté mais tente d'accéder à la fiche d'un autre archer
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
