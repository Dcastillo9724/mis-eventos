import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'events',
    loadChildren: () =>
      import('./features/events/events.routes').then(m => m.EVENTS_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES),
  },
  {
    path: 'users',
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'events',
  },
];