import { Provider } from '@angular/core';

// Domain Repository Tokens
import { COMPANY_REPOSITORY } from './domain/repositories/company.repository';

// Infrastructure Implementations
import { CompanyFirebaseRepository } from './infrastructure/repositories/company-firebase.repository';

// Application Services
import { CompanyService } from './application/services/company.service';

// Use Cases
import { CreateCompanyUseCase } from './application/use-cases/create-company.use-case';
import { GetCompaniesUseCase } from './application/use-cases/get-companies.use-case';
import { UpdateCompanyUseCase } from './application/use-cases/update-company.use-case';

export const BUSINESS_PARTNER_PROVIDERS: Provider[] = [
  // Repository Implementations
  {
    provide: COMPANY_REPOSITORY,
    useClass: CompanyFirebaseRepository
  },

  // Application Services
  CompanyService,

  // Use Cases
  CreateCompanyUseCase,
  GetCompaniesUseCase,
  UpdateCompanyUseCase
];
