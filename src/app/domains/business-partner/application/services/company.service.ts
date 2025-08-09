import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, map, catchError, finalize, of, switchMap } from 'rxjs';

import { Company, CreateCompanyProps, Contact } from '../../domain/entities/company.entity';
import { COMPANY_REPOSITORY } from '../../domain/repositories/company.repository';

/**
 * 公司應用服務
 * 極簡設計，使用 Angular Signals 進行狀態管理
 * 直接與 Repository 互動，移除不必要的 UseCase 層
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly repository = inject(COMPANY_REPOSITORY);

  // Simple state management
  private readonly companiesSignal = signal<Company[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  // Computed 派生狀態
  readonly companies = computed(() => this.companiesSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly hasCompanies = computed(() => this.companies().length > 0);

  constructor() {
    // 延遲載入，避免不必要的初始化
  }

  /**
   * 載入公司列表
   */
  loadCompanies(): void {
    // 如果已經載入過且沒有錯誤，直接返回
    if (this.companies().length > 0 && !this.errorSignal()) {
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.repository
      .getAll()
      .pipe(
        finalize(() => this.loadingSignal.set(false)),
        catchError(error => {
          console.error('載入公司列表失敗:', error);
          this.errorSignal.set('載入公司列表失敗');
          return of([]);
        })
      )
      .subscribe(companies => {
        this.companiesSignal.set(companies);
      });
  }

  /**
   * 創建公司
   */
  createCompany(props: CreateCompanyProps): Observable<Company> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const company = Company.create(props);

    return this.repository.create(company).pipe(
      map(savedCompany => {
        // 更新本地狀態
        this.companiesSignal.update(companies => [...companies, savedCompany]);
        return savedCompany;
      }),
      finalize(() => this.loadingSignal.set(false)),
      catchError(error => {
        console.error('創建公司失敗:', error);
        this.errorSignal.set('創建公司失敗');
        throw error;
      })
    );
  }

  /**
   * 搜尋公司
   */
  searchCompanies(query: string): Observable<Company[]> {
    if (!query.trim()) {
      return of(this.companies());
    }

    const filteredCompanies = this.companies().filter(
      company => company.companyName.toLowerCase().includes(query.toLowerCase()) || company.businessRegistrationNumber.includes(query)
    );

    return of(filteredCompanies);
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

  /**
   * 更新公司
   */
  updateCompany(id: string, props: Partial<CreateCompanyProps>): Observable<Company> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Fetch the existing company to apply updates
    return this.repository.getById(id).pipe(
      switchMap(company => {
        const updatedCompany = company.update(props);
        return this.repository.update(updatedCompany).pipe(
          map(savedCompany => {
            // Update local state
            this.companiesSignal.update(companies => companies.map(c => (c.id === id ? savedCompany : c)));
            return savedCompany;
          })
        );
      }),
      finalize(() => this.loadingSignal.set(false)),
      catchError(error => {
        console.error('更新公司失敗:', error);
        this.errorSignal.set('更新公司失敗');
        throw error;
      })
    );
  }

  /**
   * 刪除公司
   */
  deleteCompany(id: string): Observable<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.repository.delete(id).pipe(
      map(() => {
        // Update local state
        this.companiesSignal.update(companies => companies.filter(c => c.id !== id));
      }),
      finalize(() => this.loadingSignal.set(false)),
      catchError(error => {
        console.error('刪除公司失敗:', error);
        this.errorSignal.set('刪除公司失敗');
        throw error;
      })
    );
  }

  /**
   * 新增聯絡人
   */
  addContact(companyId: string, contact: Contact): Observable<Company> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Fetch the company, add contact, and update
    return this.repository.getById(companyId).pipe(
      switchMap(company => {
        const updatedCompany = company.addContact(contact);
        return this.repository.update(updatedCompany).pipe(
          map(savedCompany => {
            // Update local state
            this.companiesSignal.update(companies => companies.map(c => (c.id === companyId ? savedCompany : c)));
            return savedCompany;
          })
        );
      }),
      finalize(() => this.loadingSignal.set(false)),
      catchError(error => {
        console.error('新增聯絡人失敗:', error);
        this.errorSignal.set('新增聯絡人失敗');
        throw error;
      })
    );
  }

  /**
   * 更新聯絡人
   */
  updateContact(companyId: string, contactIndex: number, contact: Contact): Observable<Company> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Fetch the company, update contact, and save
    return this.repository.getById(companyId).pipe(
      switchMap(company => {
        const updatedCompany = company.updateContact(contactIndex, contact);
        return this.repository.update(updatedCompany).pipe(
          map(savedCompany => {
            // Update local state
            this.companiesSignal.update(companies => companies.map(c => (c.id === companyId ? savedCompany : c)));
            return savedCompany;
          })
        );
      }),
      finalize(() => this.loadingSignal.set(false)),
      catchError(error => {
        console.error('更新聯絡人失敗:', error);
        this.errorSignal.set('更新聯絡人失敗');
        throw error;
      })
    );
  }

  /**
   * 刪除聯絡人
   */
  removeContact(companyId: string, contactIndex: number): Observable<Company> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Fetch the company, remove contact, and save
    return this.repository.getById(companyId).pipe(
      switchMap(company => {
        const updatedCompany = company.removeContact(contactIndex);
        return this.repository.update(updatedCompany).pipe(
          map(savedCompany => {
            // Update local state
            this.companiesSignal.update(companies => companies.map(c => (c.id === companyId ? savedCompany : c)));
            return savedCompany;
          })
        );
      }),
      finalize(() => this.loadingSignal.set(false)),
      catchError(error => {
        console.error('刪除聯絡人失敗:', error);
        this.errorSignal.set('刪除聯絡人失敗');
        throw error;
      })
    );
  }
}
