import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Company, CompanyEntity } from '../../domain/entities/company.entity';
import { CompanyRepository, COMPANY_REPOSITORY } from '../../domain/repositories/company.repository';

export interface CreateCompanyRequest {
  name: string;
  legalName: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  address: Company['address'];
  contacts: Company['contacts'];
  financials: Company['financials'];
  tags: string[];
  status: Company['status'];
  partnershipLevel: Company['partnershipLevel'];
  notes?: string;
}

export interface CreateCompanyResponse {
  success: boolean;
  company?: Company;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository
  ) {}

  execute(request: CreateCompanyRequest): Observable<CreateCompanyResponse> {
    try {
      // Validate required fields
      if (!request.name || !request.legalName || !request.address || !request.contacts || !request.financials) {
        return of({
          success: false,
          error: 'Required fields are missing'
        });
      }

      // Validate contacts array is not empty
      if (request.contacts.length === 0) {
        return of({
          success: false,
          error: 'At least one contact is required'
        });
      }

      // Validate address fields
      if (!request.address.street || !request.address.city || !request.address.country) {
        return of({
          success: false,
          error: 'Address must include street, city, and country'
        });
      }

      // Validate financials
      if (!request.financials.industry) {
        return of({
          success: false,
          error: 'Industry is required'
        });
      }

      // Create company entity
      const company = CompanyEntity.create(request);

      // Save to repository
      return this.companyRepository.save(company).pipe(
        map(savedCompany => ({
          success: true,
          company: savedCompany
        })),
        catchError(error => of({
          success: false,
          error: error.message || 'Failed to create company'
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
