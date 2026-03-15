import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { EventDetail } from './event-detail/event-detail';
import { EventForm } from './event-form/event-form';
import { EventList } from './event-list/event-list';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    component: EventList,
  },
  {
    path: 'create',
    component: EventForm,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'organizer'] },
  },
  {
    path: ':id',
    component: EventDetail,
  },
  {
    path: ':id/edit',
    component: EventForm,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'organizer'] },
  },
];