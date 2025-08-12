import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Company } from '../../domain/entities/company.entity';
import { CompanyService } from '../../application/services/company.service';
import { CompanySearchCriteria } from '../../domain/repositories/company.repository';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
    NzSpinModule,
    NzEmptyModule,
    NzPaginationModule
  ],
  template: `
    <nz-card nzTitle="Business Partners" [nzExtra]="extraTemplate">
      <!-- Search and Filters -->
      <div class="search-filters mb-4">
        <nz-space nzSize="middle" nzWrap>
          <nz-input-group [nzSuffix]="searchIcon" nzSize="large">
            <input 
              nz-input 
              placeholder="Search companies..." 
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
            />
          </nz-input-group>
          
          <nz-select 
            nzPlaceHolder="Status" 
            nzSize="large"
            [(ngModel)]="selectedStatus"
            (ngModelChange)="onSearchChange()"
            [nzAllowClear]="true"
          >
            <nz-option nzValue="active" nzLabel="Active"></nz-option>
            <nz-option nzValue="inactive" nzLabel="Inactive"></nz-option>
            <nz-option nzValue="pending" nzLabel="Pending"></nz-option>
            <nz-option nzValue="suspended" nzLabel="Suspended"></nz-option>
          </nz-select>
          
          <nz-select 
            nzPlaceHolder="Partnership Level" 
            nzSize="large"
            [(ngModel)]="selectedPartnershipLevel"
            (ngModelChange)="onSearchChange()"
            [nzAllowClear]="true"
          >
            <nz-option nzValue="bronze" nzLabel="Bronze"></nz-option>
            <nz-option nzValue="silver" nzLabel="Silver"></nz-option>
            <nz-option nzValue="gold" nzLabel="Gold"></nz-option>
            <nz-option nzValue="platinum" nzLabel="Platinum"></nz-option>
          </nz-select>
          
          <nz-button 
            nzType="primary" 
            nzSize="large"
            (click)="refreshCompanies()"
            [nzLoading]="loading()"
          >
            <span nz-icon nzType="reload"></span>
            Refresh
          </nz-button>
        </nz-space>
      </div>

      <!-- Companies Table -->
      <nz-table
        #basicTable
        [nzData]="companies()"
        [nzLoading]="loading()"
        [nzTotal]="pagination().total"
        [nzPageSize]="pagination().pageSize"
        [nzPageIndex]="pagination().currentPage"
        [nzShowSizeChanger]="true"
        [nzShowQuickJumper]="true"
        [nzShowTotal]="totalTemplate"
        (nzPageIndexChange)="onPageIndexChange($event)"
        (nzPageSizeChange)="onPageSizeChange($event)"
        nzShowPagination="true"
      >
        <thead>
          <tr>
            <th>Company</th>
            <th>Industry</th>
            <th>Partnership Level</th>
            <th>Status</th>
            <th>Contacts</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let company of basicTable.data">
            <td>
              <div class="company-info">
                <div class="company-name">{{ company.name }}</div>
                <div class="company-legal">{{ company.legalName }}</div>
                <div class="company-location" *ngIf="company.address">
                  {{ company.address.city }}, {{ company.address.country }}
                </div>
              </div>
            </td>
            <td>
              <nz-tag [nzColor]="getIndustryColor(company.financials.industry)">
                {{ company.financials.industry }}
              </nz-tag>
            </td>
            <td>
              <nz-tag [nzColor]="getPartnershipLevelColor(company.partnershipLevel)">
                {{ company.partnershipLevel | titlecase }}
              </nz-tag>
            </td>
            <td>
              <nz-tag [nzColor]="getStatusColor(company.status)">
                {{ company.status | titlecase }}
              </nz-tag>
            </td>
            <td>
              <div class="contacts-info">
                <div *ngFor="let contact of company.contacts.slice(0, 2)">
                  <div class="contact-name">{{ contact.name }}</div>
                  <div class="contact-position">{{ contact.position }}</div>
                </div>
                <div *ngIf="company.contacts.length > 2" class="more-contacts">
                  +{{ company.contacts.length - 2 }} more
                </div>
              </div>
            </td>
            <td>
              <div class="date-info">
                {{ company.metadata.createdAt | date:'shortDate' }}
              </div>
            </td>
            <td>
              <nz-space nzSize="small">
                <button 
                  nz-button 
                  nzType="primary" 
                  nzSize="small"
                  nz-tooltip="View Details"
                  [routerLink]="['/business-partner', company.id]"
                >
                  <span nz-icon nzType="eye"></span>
                </button>
                <button 
                  nz-button 
                  nzType="default" 
                  nzSize="small"
                  nz-tooltip="Edit"
                  [routerLink]="['/business-partner', company.id, 'edit']"
                >
                  <span nz-icon nzType="edit"></span>
                </button>
                <button 
                  nz-button 
                  [nzType]="company.status === 'active' ? 'default' : 'primary'"
                  nzSize="small"
                  nz-tooltip
                  [nzTooltipTitle]="company.status === 'active' ? 'Deactivate' : 'Activate'"
                  (click)="toggleCompanyStatus(company)"
                >
                  <span nz-icon [nzType]="company.status === 'active' ? 'stop' : 'play-circle'"></span>
                </button>
              </nz-space>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <!-- Empty State -->
      <nz-empty 
        *ngIf="!loading() && companies().length === 0" 
        nzNotFoundImage="simple"
        [nzNotFoundContent]="emptyContent"
      >
      </nz-empty>
    </nz-card>

    <!-- Templates -->
    <ng-template #extraTemplate>
      <nz-button 
        nzType="primary" 
        nzSize="large"
        routerLink="/business-partner/new"
      >
        <span nz-icon nzType="plus"></span>
        Add Company
      </nz-button>
    </ng-template>

    <ng-template #searchIcon>
      <span nz-icon nzType="search"></span>
    </ng-template>

    <ng-template #totalTemplate>
      Total {{ pagination().total }} companies
    </ng-template>

    <ng-template #emptyContent>
      <span>No companies found. Try adjusting your search criteria or add a new company.</span>
    </ng-template>
  `,
  styles: [`
    .search-filters {
      background: #fafafa;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid #d9d9d9;
    }

    .company-info {
      .company-name {
        font-weight: 600;
        color: #262626;
        margin-bottom: 4px;
      }
      
      .company-legal {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 2px;
      }
      
      .company-location {
        font-size: 12px;
        color: #595959;
      }
    }

    .contacts-info {
      .contact-name {
        font-weight: 500;
        font-size: 13px;
        margin-bottom: 2px;
      }
      
      .contact-position {
        font-size: 11px;
        color: #8c8c8c;
        margin-bottom: 4px;
      }
      
      .more-contacts {
        font-size: 11px;
        color: #1890ff;
        font-style: italic;
      }
    }

    .date-info {
      font-size: 12px;
      color: #595959;
    }

    .mb-4 {
      margin-bottom: 16px;
    }
  `]
})
export class CompanyListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);

  // Signals for reactive state management
  companies = signal<Company[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  pagination = signal({
    total: 0,
    hasMore: false,
    currentPage: 1,
    pageSize: 20
  });

  // Search and filter state
  searchTerm = '';
  selectedStatus: Company['status'] | null = null;
  selectedPartnershipLevel: Company['partnershipLevel'] | null = null;

  // Computed values
  filteredCompanies = computed(() => {
    let filtered = this.companies();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(term) ||
        company.legalName.toLowerCase().includes(term) ||
        company.financials.industry.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  });

  ngOnInit(): void {
    this.loadCompanies();
    
    // Subscribe to service state changes
    this.companyService.companies$.subscribe(companies => {
      this.companies.set(companies);
    });
    
    this.companyService.loading$.subscribe(loading => {
      this.loading.set(loading);
    });
    
    this.companyService.error$.subscribe(error => {
      this.error.set(error);
    });
    
    this.companyService.pagination$.subscribe(pagination => {
      this.pagination.set(pagination);
    });
  }

  loadCompanies(): void {
    const criteria: Partial<CompanySearchCriteria> = {
      limit: this.pagination().pageSize,
      offset: 0
    };

    if (this.selectedStatus) {
      criteria.status = this.selectedStatus;
    }

    if (this.selectedPartnershipLevel) {
      criteria.partnershipLevel = this.selectedPartnershipLevel;
    }

    this.companyService.searchCompanies(criteria);
  }

  onSearchChange(): void {
    this.loadCompanies();
  }

  refreshCompanies(): void {
    this.companyService.refreshCompanies();
  }

  onPageIndexChange(page: number): void {
    const criteria: Partial<CompanySearchCriteria> = {
      limit: this.pagination().pageSize,
      offset: (page - 1) * this.pagination().pageSize
    };

    if (this.selectedStatus) {
      criteria.status = this.selectedStatus;
    }

    if (this.selectedPartnershipLevel) {
      criteria.partnershipLevel = this.selectedPartnershipLevel;
    }

    this.companyService.searchCompanies(criteria);
  }

  onPageSizeChange(pageSize: number): void {
    this.pagination.update(p => ({ ...p, pageSize, currentPage: 1 }));
    this.loadCompanies();
  }

  toggleCompanyStatus(company: Company): void {
    if (company.status === 'active') {
      this.companyService.updateCompany({
        id: company.id,
        updates: { status: 'inactive' }
      });
    } else {
      this.companyService.updateCompany({
        id: company.id,
        updates: { status: 'active' }
      });
    }
  }

  getIndustryColor(industry: string): string {
    const colors: { [key: string]: string } = {
      'Technology': 'blue',
      'Healthcare': 'green',
      'Finance': 'gold',
      'Manufacturing': 'orange',
      'Retail': 'purple',
      'Education': 'cyan'
    };
    return colors[industry] || 'default';
  }

  getPartnershipLevelColor(level: Company['partnershipLevel']): string {
    const colors: { [key: string]: string } = {
      'bronze': 'brown',
      'silver': 'silver',
      'gold': 'gold',
      'platinum': 'purple'
    };
    return colors[level] || 'default';
  }

  getStatusColor(status: Company['status']): string {
    const colors: { [key: string]: string } = {
      'active': 'green',
      'inactive': 'red',
      'pending': 'orange',
      'suspended': 'red'
    };
    return colors[status] || 'default';
  }
}
