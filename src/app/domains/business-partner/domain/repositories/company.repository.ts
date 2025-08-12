import { Observable } from 'rxjs';
import { Company } from '../entities/company.entity';

export interface CompanySearchCriteria {
  name?: string;
  status?: Company['status'];
  partnershipLevel?: Company['partnershipLevel'];
  industry?: string;
  tags?: string[];
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'partnershipLevel';
  sortOrder?: 'asc' | 'desc';
}

export interface CompanySearchResult {
  companies: Company[];
  total: number;
  hasMore: boolean;
}

export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';

export interface CompanyRepository {
  findById(id: string): Observable<Company | null>;
  findAll(): Observable<Company[]>;
  search(criteria: CompanySearchCriteria): Observable<CompanySearchResult>;
  save(company: Company): Observable<Company>;
  update(id: string, updates: Partial<Omit<Company, 'id' | 'metadata'>>): Observable<Company>;
  delete(id: string): Observable<void>;
  exists(id: string): Observable<boolean>;
  count(): Observable<number>;
  findByStatus(status: Company['status']): Observable<Company[]>;
  findByPartnershipLevel(level: Company['partnershipLevel']): Observable<Company[]>;
  findByIndustry(industry: string): Observable<Company[]>;
  findByTags(tags: string[]): Observable<Company[]>;
  activate(id: string): Observable<Company>;
  deactivate(id: string): Observable<Company>;
  updatePartnershipLevel(id: string, level: Company['partnershipLevel']): Observable<Company>;
  addContact(id: string, contact: Company['contacts'][0]): Observable<Company>;
  removeContact(id: string, contactEmail: string): Observable<Company>;
  addTag(id: string, tag: string): Observable<Company>;
  removeTag(id: string, tag: string): Observable<Company>;
}
