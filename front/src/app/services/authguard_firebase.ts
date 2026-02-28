import { Injectable, inject } from '@angular/core';
import { 
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  CanActivateFn 
} from '@angular/router';
import { AuthenticationService } from './auth_service_firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(
      private router: Router,
      private authenticationService: AuthenticationService
    ) {}


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authenticationService.userValue;
    
    if (user) {
      // L'utilisateur est connecté, autoriser l'accès
      return true;
    }

    // L'utilisateur n'est pas connecté, rediriger vers la page de login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

// // Fonction guard pour les routes (Angular moderne)
// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthenticationService);
//   const router = inject(Router);

//   const user = authService.userValue;
  
//   if (user) {
//     return true;
//   }

//   router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
//   return false;
// };