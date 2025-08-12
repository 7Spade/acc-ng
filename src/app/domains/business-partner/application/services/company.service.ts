import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, switchMap, tap } from 'rxjs';
import { Company } from '../../domain/entities/company.entity';
import { CompanySearchCriteria, CompanySearchResult } from '../../domain/repositories/company.repository';
import { CreateCompanyUseCase, CreateCompanyRequest, CreateCompanyResponse } from '../use-cases/create-company.use-case';
import { GetCompaniesUseCase, GetCompaniesRequest, GetCompaniesResponse } from '../use-cases/get-companies.use-case';
import { UpdateCompanyUseCase, UpdateCompanyRequest, UpdateCompanyResponse } from '../use-cases/update-company.use-case';

export interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  loading: boolean;
  error: string | null;
  searchCriteria: CompanySearchCriteria;
  pagination: {
    total: number;
    hasMore: boolean;
    currentPage: number;
    pageSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly stateSubject = new BehaviorSubject<CompanyState>({
    companies: [],
    selectedCompany: null,
    loading: false,
    error: null,
    searchCriteria: {
      limit: 20,
      offset: 0,
      sortBy: 'name',
      sortOrder: 'asc'
    },
    pagination: {
      total: 0,
      hasMore: false,
      currentPage: 1,
      pageSize: 20
    }
  });

  public readonly state$ = this.stateSubject.asObservable();
  public readonly companies$ = this.state$.pipe(map(state => state.companies));
  public readonly selectedCompany$ = this.state$.pipe(map(state => state.selectedCompany));
  public readonly loading$ = this.state$.pipe(map(state => state.loading));
  public readonly error$ = this.state$.pipe(map(state => state.error));
  public readonly pagination$ = this.state$.pipe(map(state => state.pagination));

  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getCompaniesUseCase: GetCompaniesUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase
  ) {}

  private updateState(updates: Partial<CompanyState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...updates
    });
  }

  private setLoading(loading: boolean): void {
    this.updateState({ loading, error: loading ? null : this.stateSubject.value.error });
  }

  private setError(error: string | null): void {
    this.updateState({ error, loading: false });
  }

  // Search and load companies
  searchCompanies(criteria: Partial<CompanySearchCriteria> = {}): Observable<CompanySearchResult> {
    const currentCriteria = this.stateSubject.value.searchCriteria;
    const newCriteria = { ...currentCriteria, ...criteria, offset: 0 };
    
    this.updateState({ 
      searchCriteria: newCriteria,
      pagination: { ...this.stateSubject.value.pagination, currentPage: 1 }
    });

    this.setLoading(true);

    return this.getCompaniesUseCase.execute({ criteria: newCriteria }).pipe(
      tap(response => {
        if (response.success && response.result) {
          this.updateState({
            companies: response.result.companies,
            pagination: {
              total: response.result.total,
              hasMore: response.result.hasMore,
              currentPage: 1,
              pageSize: newCriteria.limit || 20
            }
          });
        } else {
          this.setError(response.error || 'Failed to load companies');
        }
      }),
      map(response => response.result!),
      tap(() => this.setLoading(false))
    );
  }

  // Load more companies (pagination)
  loadMoreCompanies(): Observable<CompanySearchResult> {
    const currentState = this.stateSubject.value;
    if (!currentState.pagination.hasMore || currentState.loading) {
      return this.getCompaniesUseCase.execute({ criteria: currentState.searchCriteria }).pipe(
        map(response => response.result!)
      );
    }

    const nextOffset = currentState.searchCriteria.offset! + currentState.searchCriteria.limit!;
    const newCriteria = { ...currentState.searchCriteria, offset: nextOffset };
    
    this.updateState({ 
      searchCriteria: newCriteria,
      pagination: { ...currentState.pagination, currentPage: currentState.pagination.currentPage + 1 }
    });

    this.setLoading(true);

    return this.getCompaniesUseCase.execute({ criteria: newCriteria }).pipe(
      tap(response => {
        if (response.success && response.result) {
          const existingCompanies = this.stateSubject.value.companies;
          this.updateState({
            companies: [...existingCompanies, ...response.result.companies],
            pagination: {
              ...currentState.pagination,
              total: response.result.total,
              hasMore: response.result.hasMore,
              currentPage: currentState.pagination.currentPage + 1
            }
          });
        } else {
          this.setError(response.error || 'Failed to load more companies');
        }
      }),
      map(response => response.result!),
      tap(() => this.setLoading(false))
    );
  }

  // Create new company
  createCompany(request: CreateCompanyRequest): Observable<CreateCompanyResponse> {
    this.setLoading(true);

    return this.createCompanyUseCase.execute(request).pipe(
      tap(response => {
        if (response.success && response.company) {
          const currentCompanies = this.stateSubject.value.companies;
          this.updateState({
            companies: [response.company, ...currentCompanies],
            selectedCompany: response.company
          });
        } else {
          this.setError(response.error || 'Failed to create company');
        }
      }),
      tap(() => this.setLoading(false))
    );
  }

  // Update company
  updateCompany(request: UpdateCompanyRequest): Observable<UpdateCompanyResponse> {
    this.setLoading(true);

    return this.updateCompanyUseCase.execute(request).pipe(
      tap(response => {
        if (response.success && response.company) {
          const currentCompanies = this.stateSubject.value.companies;
          const updatedCompanies = currentCompanies.map(company => 
            company.id === request.id ? response.company! : company
          );
          
          this.updateState({
            companies: updatedCompanies,
            selectedCompany: response.company
          });
        } else {
          this.setError(response.error || 'Failed to update company');
        }
      }),
      tap(() => this.setLoading(false))
    );
  }

  // Select company
  selectCompany(company: Company | null): void {
    this.updateState({ selectedCompany: company });
  }

  // Clear error
  clearError(): void {
    this.setError(null);
  }

  // Refresh companies
  refreshCompanies(): Observable<CompanySearchResult> {
    return this.searchCompanies();
  }
}
