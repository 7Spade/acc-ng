// Partner Detail Component - 極簡主義實現
import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

// ng-zorro-antd imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { PartnerFirebaseService } from '../../../infrastructure/repositories/partner-firebase.service';
import { Partner, Contact } from '../../../domain/entities/partner.entity';
import { getStatusColor, getPrimaryContact } from '../../../domain/value-objects';

@Component({
  selector: 'app-partner-detail',
  template: `
    <div class="partner-detail-container">
      @if (loading()) {
        <nz-spin nzTip="載入中..." class="loading-container">
          <div class="loading-content"></div>
        </nz-spin>
      } @else if (partner()) {
        <!-- 合作夥伴基本資訊 -->
        <nz-card 
          [nzTitle]="partner()!.companyName" 
          [nzExtra]="cardExtra"
          class="mb-4">
          
          <ng-template #cardExtra>
            <div class="flex gap-2">
              <button 
                nz-button 
                nzType="primary" 
                (click)="editPartner()"
                class="flex items-center">
                <nz-icon nzType="edit"></nz-icon>
                編輯
              </button>
              <button 
                nz-button 
                nzDanger 
                (click)="deletePartner()"
                class="flex items-center">
                <nz-icon nzType="delete"></nz-icon>
                刪除
              </button>
            </div>
          </ng-template>

          <nz-descriptions nzBordered [nzColumn]="2">
            <nz-descriptions-item nzTitle="公司狀態">
              <nz-tag [nzColor]="getStatusColor(partner()!.status)">
                {{ getStatusText(partner()!.status) }}
              </nz-tag>
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="行業類別">
              {{ partner()!.industry }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="加入日期">
              {{ partner()!.joinedDate | date:'yyyy年MM月dd日' }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="建立時間">
              {{ partner()!.createdAt | date:'yyyy年MM月dd日 HH:mm' }}
            </nz-descriptions-item>
            
            @if (partner()!.website) {
              <nz-descriptions-item nzTitle="網站" [nzSpan]="2">
                <a [href]="partner()!.website" target="_blank" class="text-blue-500 hover:text-blue-700">
                  {{ partner()!.website }}
                  <nz-icon nzType="link" class="ml-1"></nz-icon>
                </a>
              </nz-descriptions-item>
            }
            
            @if (partner()!.address) {
              <nz-descriptions-item nzTitle="地址" [nzSpan]="2">
                {{ partner()!.address }}
              </nz-descriptions-item>
            }
          </nz-descriptions>
        </nz-card>

        <!-- 聯絡人資訊 -->
        <nz-card nzTitle="聯絡人資訊">
          @if (partner()!.contacts.length > 0) {
            <div nz-row [nzGutter]="[16, 16]">
              @for (contact of partner()!.contacts; track contact.id) {
                <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="8">
                  <nz-card 
                    nzSize="small" 
                    [nzTitle]="contact.name"
                    [nzExtra]="contact.isPrimary ? primaryBadge : undefined"
                    class="contact-card">
                    
                    <ng-template #primaryBadge>
                      <nz-tag nzColor="blue" class="text-xs">主要聯絡人</nz-tag>
                    </ng-template>
                    
                    <div class="contact-info">
                      <div class="contact-item">
                        <nz-icon nzType="user" class="contact-icon"></nz-icon>
                        <span class="contact-label">職位：</span>
                        <span>{{ contact.role }}</span>
                      </div>
                      
                      <div class="contact-item">
                        <nz-icon nzType="mail" class="contact-icon"></nz-icon>
                        <span class="contact-label">郵件：</span>
                        <a [href]="'mailto:' + contact.email" class="text-blue-500 hover:text-blue-700">
                          {{ contact.email }}
                        </a>
                      </div>
                      
                      @if (contact.phone) {
                        <div class="contact-item">
                          <nz-icon nzType="phone" class="contact-icon"></nz-icon>
                          <span class="contact-label">電話：</span>
                          <a [href]="'tel:' + contact.phone" class="text-blue-500 hover:text-blue-700">
                            {{ contact.phone }}
                          </a>
                        </div>
                      }
                    </div>
                  </nz-card>
                </div>
              }
            </div>
          } @else {
            <nz-empty 
              nzNotFoundImage="simple" 
              nzNotFoundContent="尚未新增聯絡人">
            </nz-empty>
          }
        </nz-card>

        <!-- 返回按鈕 -->
        <div class="mt-4 text-center">
          <button 
            nz-button 
            nzType="default" 
            (click)="goBack()"
            class="min-w-24">
            <nz-icon nzType="arrow-left"></nz-icon>
            返回列表
          </button>
        </div>
      } @else {
        <!-- 找不到合作夥伴 -->
        <nz-card>
          <nz-empty 
            nzNotFoundImage="simple" 
            nzNotFoundContent="找不到指定的合作夥伴">
            <div nz-empty-footer>
              <button nz-button nzType="primary" (click)="goBack()">
                返回列表
              </button>
            </div>
          </nz-empty>
        </nz-card>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NzCardModule,
    NzDescriptionsModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzGridModule,
    NzDividerModule
  ],
  styles: [`
    .partner-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .loading-content {
      width: 100%;
      height: 200px;
    }
    
    .contact-card {
      height: 100%;
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
    }
    
    .contact-card:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    
    .contact-icon {
      color: #666;
      width: 16px;
    }
    
    .contact-label {
      color: #666;
      min-width: 40px;
    }
    
    .min-w-24 {
      min-width: 6rem;
    }
    
    @media (max-width: 768px) {
      .partner-detail-container {
        padding: 16px;
      }
      
      .contact-item {
        font-size: 13px;
      }
    }
  `]
})
export class PartnerDetailComponent implements OnInit {
  // Signals for state management
  partner = signal<Partner | null>(null);
  loading = signal(false);
  partnerId = signal<string | null>(null);

  constructor(
    private partnerService: PartnerFirebaseService,
    private router: Router,
    private route: ActivatedRoute,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.partnerId.set(id);
      await this.loadPartner(id);
    } else {
      this.message.error('無效的合作夥伴 ID');
      this.goBack();
    }
  }

  private async loadPartner(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const partner = await this.partnerService.getPartnerById(id);
      this.partner.set(partner);
      
      if (!partner) {
        this.message.error('找不到指定的合作夥伴');
      }
    } catch (error) {
      console.error('Load partner error:', error);
      this.message.error('載入合作夥伴資料失敗');
    } finally {
      this.loading.set(false);
    }
  }

  editPartner(): void {
    const id = this.partnerId();
    if (id) {
      this.router.navigate(['/business-partners', id, 'edit']);
    }
  }

  deletePartner(): void {
    const partner = this.partner();
    if (!partner) return;

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
          this.goBack();
        } catch (error) {
          console.error('Delete partner error:', error);
          this.message.error('刪除合作夥伴失敗，請稍後再試');
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/business-partners']);
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