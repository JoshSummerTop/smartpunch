import { Routes } from '@angular/router';

/**
 * Application route definitions using lazy-loaded standalone components.
 *
 * Routes:
 * - `""` (exact) - Marketing landing page
 * - `"dashboard"` - Project list / dashboard
 * - `"projects/:id/punch-list"` - Punch items grid for a project
 * - `"projects/:id/punch-list/:itemId"` - Individual punch item detail
 * - `"projects/:id/report"` - AI-generated project report
 * - `"**"` (wildcard) - Redirects to dashboard
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'projects/:id/punch-list',
    loadComponent: () => import('./features/punch-list/punch-list.component').then(m => m.PunchListComponent)
  },
  {
    path: 'projects/:id/punch-list/:itemId',
    loadComponent: () => import('./features/punch-item-detail/punch-item-detail.component').then(m => m.PunchItemDetailComponent)
  },
  {
    path: 'projects/:id/report',
    loadComponent: () => import('./features/report/report.component').then(m => m.ReportComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
