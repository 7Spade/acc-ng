import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, map, catchError, finalize, of, switchMap, tap } from 'rxjs';

import { Company, CreateCompanyProps, Contact, CompanyStatus, RiskLevel } from '../../domain/entities/company.entity';
import { COMPANY_REPOSITORY } from '../../domain/repositories/company.repository';

/**
 * 優化後的 Business Partner 服務
 * 整合所有 Use Cases，使用 Angular Signals 進行狀態管理
 * 遵循 ng-alain V20 現代化實踐
 */
@Injectable({
  providedIn: 'root'
})
export class BusinessPartnerService {
  private readonly repository = inject(COMPANY_REPOSITORY);

  // 核心狀態信號
  private readonly companiesSignal = signal<Company[]>([]);
  private readonly selectedCompanySignal = signal<Company | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly searchQuerySignal = signal('');

  // 計算屬性
  readonly companies = computed(() => this.companiesSignal());
  readonly selectedCompany = computed(() => this.selectedCompanySignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly searchQuery = computed(() => this.searchQuerySignal());

  // 派生狀態
  readonly hasCompanies = computed(() => this.companies().length > 0);
  readonly activeCompanies = computed(() => 
    this.companies().filter(c => c.status === CompanyStatus.Active)
  );
  readonly filteredCompanies = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.companies();
    
    return this.companies().filter(company => 
      company.companyName.toLowerCase().includes(query) ||
      company.businessRegistrationNumber.includes(query) ||
      company.address.toLowerCase().includes(query)
    );
  });

  // 統計信息
  readonly totalCount = computed(() => this.companies().length);
  readonly activeCount = computed(() => this.activeCompanies().length);
  readonly highRiskCount = computed(() => 
    this.companies().filter(c => c.riskLevel === RiskLevel.High).length
  );

  constructor() {
    // 自動載入公司列表
    this.loadCompanies();
  }

  // ==================== 核心 CRUD 操作 ====================

  /**
   * 載入公司列表
   */
  loadCompanies(): void {
    if (this.loading()) return;
    
    this.setLoading(true);
    this.clearError();

    this.repository.getAll().pipe(
      finalize(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('載入公司列表失敗', error);
        return of([]);
      })
    ).subscribe(companies => {
      this.companiesSignal.set(companies);
    });
  }

  /**
   * 創建公司
   */
  createCompany(props: CreateCompanyProps): Observable<Company> {
    this.setLoading(true);
    this.clearError();

    const company = Company.create(props);

    return this.repository.create(company).pipe(
      tap(savedCompany => {
        this.companiesSignal.update(companies => [...companies, savedCompany]);
        this.selectCompany(savedCompany);
      }),
      finalize(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('創建公司失敗', error);
        throw error;
      })
    );
  }

  /**
   * 更新公司
   */
  updateCompany(id: string, props: Partial<CreateCompanyProps>): Observable<Company> {
    this.setLoading(true);
    this.clearError();

    return this.repository.getById(id).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error(`公司 ID ${id} 不存在`);
        }
        
        const updatedCompany = company.update(props);
        return this.repository.update(updatedCompany);
      }),
      tap(savedCompany => {
        this.companiesSignal.update(companies => 
          companies.map(c => c.id === id ? savedCompany : c)
        );
        this.selectCompany(savedCompany);
      }),
      finalize(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('更新公司失敗', error);
        throw error;
      })
    );
  }

  /**
   * 刪除公司
   */
  deleteCompany(companyId: string): void {
    this.setLoading(true);
    this.clearError();

    this.repository.delete(companyId).pipe(
      finalize(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('刪除公司失敗', error);
        return of(null);
      })
    ).subscribe(() => {
      this.companiesSignal.update(companies => 
        companies.filter(c => c.id !== companyId)
      );
      if (this.selectedCompany()?.id === companyId) {
        this.clearSelection();
      }
    });
  }

  // ==================== 聯絡人管理 ====================

  /**
   * 新增聯絡人
   */
  addContact(companyId: string, contact: Contact): Observable<Company> {
    this.setLoading(true);
    this.clearError();

    return this.repository.getById(companyId).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error(`公司 ID ${companyId} 不存在`);
        }
        
        const updatedCompany = company.addContact(contact);
        return this.repository.update(updatedCompany);
      }),
      tap(savedCompany => {
        this.companiesSignal.update(companies => 
          companies.map(c => c.id === companyId ? savedCompany : c)
        );
        this.selectCompany(savedCompany);
      }),
      finalize(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('新增聯絡人失敗', error);
        throw error;
      })
    );
  }

  /**
   * 更新聯絡人
   */
  updateContact(companyId: string, contactIndex: number, contact: Contact): Observable<Company> {
    this.setLoading(true);
    this.clearError();

    return this.repository.getById(companyId).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error(`公司 ID ${companyId} 不存在`);
        }
        
        const updatedCompany = company.updateContact(contactIndex, contact);
        return this.repository.update(updatedCompany);
      }),
      tap(savedCompany => {
        this.companiesSignal.update(companies => 
          companies.map(c => c.id === companyId ? savedCompany : c)
        );
        this.selectCompany(savedCompany);
      }),
      finalize(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('更新聯絡人失敗', error);
        throw error;
      })
    );
  }

  /**
   * 刪除聯絡人
   */
  removeContact(companyId: string, contactIndex: number): Observable<Company> {
    this.setLoading(true);
    this.clearError();

    return this.repository.getById(companyId).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error(`公司 ID ${companyId} 不存在`);
        }
        
        const updatedCompany = company.removeContact(contactIndex);
        return this.repository.update(updatedCompany);
      }),
      tap(savedCompany => {
        this.companiesSignal.update(companies => 
          companies.map(c => c.id === companyId ? savedCompany : c)
        );
        this.selectCompany(savedCompany);
      }),
      finalize(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('刪除聯絡人失敗', error);
        throw error;
      })
    );
  }

  // ==================== 搜尋和篩選 ====================

  /**
   * 搜尋公司
   */
  searchCompanies(query: string): void {
    this.searchQuerySignal.set(query);
  }

  /**
   * 設置搜尋查詢
   */
  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  /**
   * 篩選公司（按狀態）
   */
  filterByStatus(status: CompanyStatus): Company[] {
    return this.companies().filter(c => c.status === status);
  }

  /**
   * 篩選公司（按風險等級）
   */
  filterByRiskLevel(riskLevel: RiskLevel): Company[] {
    return this.companies().filter(c => c.riskLevel === riskLevel);
  }

  // ==================== 狀態管理 ====================

  /**
   * 選擇公司
   */
  selectCompany(company: Company | null): void {
    this.selectedCompanySignal.set(company);
  }

  /**
   * 清除選擇
   */
  clearSelection(): void {
    this.selectedCompanySignal.set(null);
  }

  /**
   * 清除錯誤
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * 重新載入
   */
  refresh(): void {
    this.loadCompanies();
  }

  // ==================== 私有方法 ====================

  private setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorSignal.set(message);
  }
}
