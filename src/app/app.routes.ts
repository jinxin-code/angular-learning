import { Routes } from '@angular/router';

/** 路由按数组顺序匹配；通配符路由必须放在最后。 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-list/user-list.component').then(module => module.UserListComponent),
  },
  {
    path: 'user/:id',
    loadComponent: () =>
      import('./user-detail/user-detail.component').then(module => module.UserDetailComponent),
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
