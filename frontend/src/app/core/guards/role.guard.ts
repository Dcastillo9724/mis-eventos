import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data['roles'] ?? [];

  if (authService.currentUser()) {
    return requiredRoles.length === 0 || authService.hasAnyRole(...requiredRoles)
      ? true
      : router.createUrlTree(['/events']);
  }

  if (!authService.getToken()) {
    return router.createUrlTree(['/auth/login']);
  }

  return authService.loadMe().pipe(
    map((user) => {
      const userRole = user.role?.name ?? '';
      return requiredRoles.length === 0 || requiredRoles.includes(userRole)
        ? true
        : router.createUrlTree(['/events']);
    }),
    catchError(() => of(router.createUrlTree(['/auth/login'])))
  );
};