import { Routes } from '@angular/router';
import { UserList } from './user-list/user-list';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UserList,
  },
];