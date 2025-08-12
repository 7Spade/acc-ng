import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// ng-alain components
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

// Domain imports
import { Company, Contact, CompanyStatus, RiskLevel, COMPANY_STATUS_LABELS, RISK_LEVEL_LABELS, COMPANY_STATUS_COLORS, RISK_LEVEL_COLORS } from '../../domain/entities/company.entity';
import { BusinessPartnerService } from '../../application/services/business-partner.service';

/**
 * 商業夥伴列表組件
 * 使用 Angular 20 新特性：@if, @for, @switch
 * 實施 OnPush 變更檢測策略
 */
@Component({
  selector: 'app-business-partner-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSpaceModule,
    NzTagModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzIconModule,
    NzCardModule,
    NzStatisticModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="business-partner-list">
      <!-- 頁面標題和統計 -->
      <nz-card>
        <div class="page-header">
          <h2>商業夥伴管理</h2>
          <div class="header-actions">
            <button 
              nz-button 
              nzType="primary" 
              nzSize="large"
              (click)="onCreateCompany()">
              <span nz-icon nzType="plus"></span>
              新增公司
            </button>
          </div>
        </div>

        <!-- 統計卡片 -->
        <div class="stats-row">
          <div class="stat-item">
            <nz-statistic 
              nzTitle="總公司數" 
              [nzValue]="businessPartnerService.totalCount()"
              [nzValueStyle]="{ color: '#1890ff' }">
            </nz-statistic>
          </div>
          <div class="stat-item">
            <nz-statistic 
              nzTitle="啟用中" 
              [nzValue]="businessPartnerService.activeCount()"
              [nzValueStyle]="{ color: '#52c41a' }">
            </nz-statistic>
          </div>
          <div class="stat-item">
            <nz-statistic 
              nzTitle="高風險" 
              [nzValue]="businessPartnerService.highRiskCount()"
              [nzValueStyle]="{ color: '#ff4d4f' }">
            </nz-statistic>
          </div>
          <div class="stat-item">
            <nz-statistic 
              nzTitle="聯絡人總數" 
              [nzValue]="totalContacts()"
              [nzValueStyle]="{ color: '#722ed1' }">
            </nz-statistic>
          </div>
        </div>
      </nz-card>

      <!-- 搜尋和篩選 -->
      <nz-card class="search-card">
        <nz-input-group 
          [nzSuffix]="suffixIconSearch" 
          nzSize="large">
          <input 
            nz-input 
            placeholder="搜尋公司名稱、統一編號或地址..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)" />
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <span nz-icon nzType="search"></span>
        </ng-template>
      </nz-card>

      <!-- 公司列表 -->
      <nz-card>
        @if (businessPartnerService.loading()) {
          <div class="loading-container">
            <nz-empty 
              nzNotFoundImage="simple"
              [nzNotFoundContent]="'載入中...'">
            </nz-empty>
          </div>
        } @else if (!businessPartnerService.hasCompanies()) {
          <nz-empty 
            nzNotFoundImage="simple"
            [nzNotFoundContent]="'暫無公司資料'">
          </nz-empty>
        } @else {
          <nz-table 
            #basicTable 
            [nzData]="businessPartnerService.filteredCompanies()"
            [nzPageSize]="pageSize()"
            [nzTotal]="businessPartnerService.filteredCompanies().length"
            [nzShowSizeChanger]="true"
            [nzShowQuickJumper]="true"
            (nzCurrentPageIndexChange)="onPageChange($event)"
            (nzPageSizeChange)="onPageSizeChange($event)">
            
            <thead>
              <tr>
                <th>公司名稱</th>
                <th>統一編號</th>
                <th>狀態</th>
                <th>風險等級</th>
                <th>聯絡人數</th>
                <th>更新時間</th>
                <th>操作</th>
              </tr>
            </thead>
            
            <tbody>
              @for (company of basicTable.data; track company.id) {
                <tr>
                  <td>
                    <a (click)="onCompanySelect(company)" class="company-name-link">
                      {{ company.companyName }}
                    </a>
                  </td>
                  <td>{{ company.businessRegistrationNumber }}</td>
                  <td>
                    <nz-tag [nzColor]="CompanyStatusColors[company.status]">
                      {{ CompanyStatusLabels[company.status] }}
                    </nz-tag>
                  </td>
                  <td>
                    <nz-tag [nzColor]="RiskLevelColors[company.riskLevel]">
                      {{ RiskLevelLabels[company.riskLevel] }}
                    </nz-tag>
                  </td>
                  <td>{{ company.contacts.length }}</td>
                  <td>{{ company.updatedAt | date:'yyyy-MM-dd HH:mm' }}</td>
                  <td>
                    <nz-space nzSize="small">
                      <button 
                        nz-button 
                        nzType="link" 
                        nzSize="small"
                        (click)="onCompanyEdit(company)"
                        nz-tooltip 
                        nzTooltipTitle="編輯">
                        <span nz-icon nzType="edit"></span>
                      </button>
                      
                      <button 
                        nz-button 
                        nzType="link" 
                        nzSize="small"
                        (click)="onCompanyView(company)"
                        nz-tooltip 
                        nzTooltipTitle="查看詳情">
                        <span nz-icon nzType="eye"></span>
                      </button>
                      
                      <nz-popconfirm
                        nzTitle="確定要刪除此公司嗎？"
                        nzOkText="確定"
                        nzCancelText="取消"
                        (nzOnConfirm)="onCompanyDelete(company.id)">
                        <button 
                          nz-button 
                          nzType="link" 
                          nzSize="small"
                          nz-tooltip 
                          nzTooltipTitle="刪除">
                          <span nz-icon nzType="delete"></span>
                        </button>
                      </nz-popconfirm>
                    </nz-space>
                  </td>
                </tr>
              }
            </tbody>
          </nz-table>
        }
      </nz-card>
    </div>
  `,
  styles: [`
    .business-partner-list {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h2 {
      margin: 0;
      color: #262626;
    }

    .stats-row {
      display: flex;
      gap: 24px;
      margin-top: 16px;
    }

    .stat-item {
      flex: 1;
    }

    .search-card {
      margin: 16px 0;
    }

    .loading-container {
      text-align: center;
      padding: 40px 0;
    }

    .company-name-link {
      color: #1890ff;
      cursor: pointer;
      text-decoration: none;
    }

    .company-name-link:hover {
      text-decoration: underline;
    }
  `]
})
export class BusinessPartnerListComponent {
  // 依賴注入
  private readonly router = inject(Router);
  readonly businessPartnerService = inject(BusinessPartnerService);

  // 組件狀態
  readonly searchQuery = signal('');
  readonly pageSize = signal(10);
  readonly currentPage = signal(1);

  // 計算屬性
  readonly totalContacts = computed(() => 
    this.businessPartnerService.companies().reduce(
      (total, company) => total + company.contacts.length, 0
    )
  );

  // 工具常數引用
  readonly CompanyStatusLabels = COMPANY_STATUS_LABELS;
  readonly RiskLevelLabels = RISK_LEVEL_LABELS;
  readonly CompanyStatusColors = COMPANY_STATUS_COLORS;
  readonly RiskLevelColors = RISK_LEVEL_COLORS;

  // 事件處理方法
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.businessPartnerService.setSearchQuery(query);
  }

  onPageChange(event: any): void {
    const page = typeof event === 'number' ? event : 1;
    this.currentPage.set(page);
  }

  onPageSizeChange(event: any): void {
    const size = typeof event === 'number' ? event : 10;
    this.pageSize.set(size);
  }

  onCreateCompany(): void {
    this.router.navigate(['/business-partner/create']);
  }

  onCompanySelect(company: Company): void {
    this.businessPartnerService.selectCompany(company);
    this.router.navigate(['/business-partner', company.id]);
  }

  onCompanyEdit(company: Company): void {
    this.businessPartnerService.selectCompany(company);
    this.router.navigate(['/business-partner', company.id, 'edit']);
  }

  onCompanyView(company: Company): void {
    this.businessPartnerService.selectCompany(company);
    this.router.navigate(['/business-partner', company.id, 'view']);
  }

  onCompanyDelete(companyId: string): void {
    this.businessPartnerService.deleteCompany(companyId);
  }
}
