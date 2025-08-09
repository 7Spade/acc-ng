import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Company } from '../entities/company.entity';

export interface CompanyRepository {
  getAll(): Observable<Company[]>;
  getById(id: string): Observable<Company>;
  create(company: Company): Observable<Company>;
  update(company: Company): Observable<Company>;
  delete(id: string): Observable<void>;
  search(query: string): Observable<Company[]>;
}

export const COMPANY_REPOSITORY = new InjectionToken<CompanyRepository>('CompanyRepository');