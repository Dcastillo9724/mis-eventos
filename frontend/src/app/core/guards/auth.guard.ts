import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  if (!authService.getToken()) {
    return router.createUrlTree(['/auth/login']);
  }

  return authService.loadMe().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/auth/login'])))
  );
};