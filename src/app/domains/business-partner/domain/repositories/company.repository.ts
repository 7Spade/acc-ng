import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Company } from '../entities/company.entity';

export abstract class CompanyRepository {
  abstract getAll(): Observable<Company[]>;
  abstract getById(id: string): Observable<Company | null>;
  abstract save(company: Company): Observable<Company>;
  abstract create(company: Company): Observable<Company>;
  abstract update(company: Company): Observable<Company>;
  abstract delete(id: string): Observable<void>;
  abstract search(query: string): Observable<Company[]>;
}

export const COMPANY_REPOSITORY = new InjectionToken<CompanyRepository>('CompanyRepository');
