// Business Partner Routes - 極簡主義實現
import { Routes } from '@angular/router';

export const BUSINESS_PARTNER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/partner-list/partner-list.component')
      .then(m => m.PartnerListComponent),
    title: '合作夥伴管理'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/partner-form/partner-form.component')
      .then(m => m.PartnerFormComponent),
    title: '新增合作夥伴'
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/partner-detail/partner-detail.component')
      .then(m => m.PartnerDetailComponent),
    title: '合作夥伴詳情'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/partner-form/partner-form.component')
      .then(m => m.PartnerFormComponent),
    title: '編輯合作夥伴'
  }
];