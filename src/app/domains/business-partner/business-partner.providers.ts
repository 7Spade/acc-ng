
import { Provider } from '@angular/core';
import { COMPANY_REPOSITORY } from './domain/repositories/company.repository';
import { CompanyFirebaseRepository } from './infrastructure/repositories/company-firebase.repository';

export const BUSINESS_PARTNER_PROVIDERS: Provider[] = [
  {
    provide: COMPANY_REPOSITORY,
    useClass: CompanyFirebaseRepository
  }
];
