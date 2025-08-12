import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Company } from '../../domain/entities/company.entity';
import { CompanyRepository, COMPANY_REPOSITORY } from '../../domain/repositories/company.repository';

export interface UpdateCompanyRequest {
  id: string;
  updates: Partial<Omit<Company, 'id' | 'metadata'>>;
}

export interface UpdateCompanyResponse {
  success: boolean;
  company?: Company;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository
  ) {}

  execute(request: UpdateCompanyRequest): Observable<UpdateCompanyResponse> {
    try {
      if (!request.id) {
        return of({
          success: false,
          error: 'Company ID is required'
        });
      }

      if (!request.updates || Object.keys(request.updates).length === 0) {
        return of({
          success: false,
          error: 'No updates provided'
        });
      }

      // Validate updates if they contain address
      if (request.updates.address) {
        const address = request.updates.address;
        if (!address.street || !address.city || !address.country) {
          return of({
            success: false,
            error: 'Address must include street, city, and country'
          });
        }
      }

      // Validate updates if they contain contacts
      if (request.updates.contacts && request.updates.contacts.length === 0) {
        return of({
          success: false,
          error: 'At least one contact is required'
        });
      }

      // Validate updates if they contain financials
      if (request.updates.financials && !request.updates.financials.industry) {
        return of({
          success: false,
          error: 'Industry is required'
        });
      }

      return this.companyRepository.update(request.id, request.updates).pipe(
        map(updatedCompany => ({
          success: true,
          company: updatedCompany
        })),
        catchError(error => of({
          success: false,
          error: error.message || 'Failed to update company'
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
