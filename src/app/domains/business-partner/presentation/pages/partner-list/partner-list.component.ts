// Partner List Component - 極簡主義實現
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

// ng-zorro-antd imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { PartnerFirebaseService } from '../../../infrastructure/repositories/partner-firebase.service';
import { Partner } from '../../../domain/entities/partner.entity';
import { PARTNER_STATUSES, getStatusColor, getPrimaryContact } from '../../../domain/value-objects';

@Component({
  selector: 'app-partner-list',
  template: `
    <nz-card nzTitle="合作夥伴管理">
      <!-- 搜尋和過濾控制項 -->
      <div class="search-controls mb-4">
        <div class="flex flex-wrap gap-4 items-center">
          <!-- 搜尋框 -->
          <div class="flex-1 min-w-64">
            <nz-input-group nzPrefixIcon="search">
              <input 
                nz-input 
                placeholder="搜尋公司名稱、行業或聯絡人..." 
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
                class="w-full">
            </nz-input-group>
          </div>
          
          <!-- 狀態過濾 -->
          <div class="w-48">
            <nz-select 
              nzPlaceHolder="篩選狀態" 
              nzAllowClear
              [ngModel]="statusFilter()"
              (ngModelChange)="statusFilter.set($event)"
              class="w-full">
              @for (status of partnerStatuses; track status) {
                <nz-option [nzValue]="status" [nzLabel]="status"></nz-option>
              }
            </nz-select>
          </div>
          
          <!-- 新增按鈕 -->
          <button 
            nz-button 
            nzType="primary" 
            (click)="createPartner()"
            class="flex items-center">
            <nz-icon nzType="plus"></nz-icon>
            新增合作夥伴
          </button>
        </div>
      </div>

      <!-- 合作夥伴表格 -->
      <nz-table 
        [nzData]="filteredPartners()" 
        [nzPageSize]="10"
        [nzShowPagination]="true"
        [nzShowSizeChanger]="true"
        [nzPageSizeOptions]="[10, 20, 50]"
        nzShowQuickJumper>
        
        <thead>
          <tr>
            <th>公司資訊</th>
            <th>主要聯絡人</th>
            <th>狀態</th>
            <th>加入日期</th>
            <th nzWidth="120px">操作</th>
          </tr>
        </thead>
        
        <tbody>
          @if (filteredPartners().length === 0) {
            <tr>
              <td colspan="5" class="text-center py-8">
                <nz-empty 
                  nzNotFoundImage="simple" 
                  [nzNotFoundContent]="searchTerm() || statusFilter() ? '沒有找到符合條件的合作夥伴' : '尚未新增任何合作夥伴'">
                </nz-empty>
              </td>
            </tr>
          } @else {
            @for (partner of filteredPartners(); track partner.id) {
              <tr 
                (click)="viewPartner(partner.id)"
                class="cursor-pointer hover:bg-gray-50 transition-colors">
                
                <!-- 公司資訊 -->
                <td>
                  <div>
                    <div class="font-medium text-base">{{ partner.companyName }}</div>
                    <div class="text-gray-500 text-sm">{{ partner.industry }}</div>
                    @if (partner.website) {
                      <div class="text-blue-500 text-sm">{{ partner.website }}</div>
                    }
                  </div>
                </td>
                
                <!-- 主要聯絡人 -->
                <td>
                  @if (getPrimaryContact(partner.contacts); as primaryContact) {
                    <div>
                      <div class="font-medium">{{ primaryContact.name }}</div>
                      <div class="text-gray-500 text-sm">{{ primaryContact.role }}</div>
                      <div class="text-blue-500 text-sm">{{ primaryContact.email }}</div>
                    </div>
                  } @else {
                    <span class="text-gray-400">無聯絡人</span>
                  }
                </td>
                
                <!-- 狀態 -->
                <td>
                  <nz-tag [nzColor]="getStatusColor(partner.status)">
                    {{ getStatusText(partner.status) }}
                  </nz-tag>
                </td>
                
                <!-- 加入日期 -->
                <td>
                  <span class="text-gray-600">
                    {{ partner.joinedDate | date:'yyyy/MM/dd' }}
                  </span>
                </td>
                
                <!-- 操作 -->
                <td (click)="$event.stopPropagation()">
                  <div class="flex gap-2">
                    <button 
                      nz-button 
                      nzType="text" 
                      nzSize="small"
                      (click)="viewPartner(partner.id)"
                      title="檢視">
                      <nz-icon nzType="eye"></nz-icon>
                    </button>
                    <button 
                      nz-button 
                      nzType="text" 
                      nzSize="small"
                      (click)="editPartner(partner.id)"
                      title="編輯">
                      <nz-icon nzType="edit"></nz-icon>
                    </button>
                    <button 
                      nz-button 
                      nzType="text" 
                      nzSize="small"
                      nzDanger
                      (click)="deletePartner(partner)"
                      title="刪除">
                      <nz-icon nzType="delete"></nz-icon>
                    </button>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </nz-table>
    </nz-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    NzCardModule,
    NzTableModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule
  ]
})
export class PartnerListComponent {
  // Signals for reactive state
  searchTerm = signal('');
  statusFilter = signal<string | null>(null);

  // Static data
  partnerStatuses = PARTNER_STATUSES;

  // Direct Firebase data through signals
  private allPartners = this.partnerService.getPartnersSignal();
  
  // Computed filtered partners - automatically updates when filters change
  filteredPartners = computed(() => {
    const partners = this.allPartners();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return partners.filter(partner => {
      // 搜尋匹配
      const matchesSearch = !search || 
        partner.companyName.toLowerCase().includes(search) ||
        partner.industry.toLowerCase().includes(search) ||
        partner.contacts.some(contact => 
          contact.name.toLowerCase().includes(search) ||
          contact.email.toLowerCase().includes(search)
        );
      
      // 狀態匹配
      const matchesStatus = !status || partner.status === status;
      
      return matchesSearch && matchesStatus;
    });
  });

  constructor(
    private partnerService: PartnerFirebaseService,
    private router: Router,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  // 導航方法
  createPartner(): void {
    this.router.navigate(['/business-partners/create']);
  }

  viewPartner(id: string): void {
    this.router.navigate(['/business-partners', id]);
  }

  editPartner(id: string): void {
    this.router.navigate(['/business-partners', id, 'edit']);
  }

  // 刪除合作夥伴
  deletePartner(partner: Partner): void {
    this.modal.confirm({
      nzTitle: '確認刪除',
      nzContent: `確定要刪除合作夥伴「${partner.companyName}」嗎？此操作無法復原。`,
      nzOkText: '刪除',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: '取消',
      nzOnOk: async () => {
        try {
          await this.partnerService.deletePartner(partner.id);
          this.message.success('合作夥伴已成功刪除');
        } catch (error) {
          console.error('Delete partner error:', error);
          this.message.error('刪除合作夥伴失敗，請稍後再試');
        }
      }
    });
  }

  // 工具方法
  getStatusColor(status: string): string {
    return getStatusColor(status as any);
  }

  getStatusText(status: string): string {
    const statusMap = {
      'Active': '活躍',
      'Inactive': '非活躍',
      'Pending': '待審核'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  getPrimaryContact = getPrimaryContact;
}