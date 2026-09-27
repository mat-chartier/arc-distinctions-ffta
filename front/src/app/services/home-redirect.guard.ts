import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './auth_service_firebase';

/**
 * Racine de l'app : pas de page propre, on aiguille selon l'état de connexion.
 * Le référentiel public des distinctions vit sur distinctarc.fr/distinctions.
 * - admin        → liste des distinctions ;
 * - archer       → sa fiche ;
 * - non connecté → connexion.
 */
export const homeRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthenticationService);
  const user = auth.userValue;

  if (!user) return router.parseUrl('/login');
  if (auth.isAdmin()) return router.parseUrl('/distinctions-list');
  return router.createUrlTree(['/archer', user.id]);
};
