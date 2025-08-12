import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Company } from '../../domain/entities/company.entity';
import { CompanyRepository, COMPANY_REPOSITORY, CompanySearchCriteria, CompanySearchResult } from '../../domain/repositories/company.repository';

export interface GetCompaniesRequest {
  criteria?: CompanySearchCriteria;
}

export interface GetCompaniesResponse {
  success: boolean;
  result?: CompanySearchResult;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GetCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository
  ) {}

  execute(request: GetCompaniesRequest = {}): Observable<GetCompaniesResponse> {
    try {
      const criteria: CompanySearchCriteria = {
        limit: 50,
        offset: 0,
        sortBy: 'name',
        sortOrder: 'asc',
        ...request.criteria
      };

      return this.companyRepository.search(criteria).pipe(
        map(result => ({
          success: true,
          result
        })),
        catchError(error => of({
          success: false,
          error: error.message || 'Failed to retrieve companies'
        }))
      );

    } catch (error) {
      return of({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}
