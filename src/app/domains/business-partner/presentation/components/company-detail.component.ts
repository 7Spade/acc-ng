import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { Company, COMPANY_STATUS_LABELS, RISK_LEVEL_LABELS, COMPANY_STATUS_COLORS, RISK_LEVEL_COLORS } from '../../domain/entities/company.entity';

/**
 * 現代化的公司詳情組件
 * 使用 Angular 20 新特性：@if, @for 控制流
 * 實施 OnPush 變更檢測策略提升性能
 */
@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTagModule,
    NzSpaceModule,
    NzIconModule,
    NzButtonModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzAvatarModule,
    NzListModule,
    NzEmptyModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (company) {
      <div class="company-detail-container">
        <!-- 基本信息卡片 -->
        <nz-card [nzTitle]="'公司基本信息'" class="info-card">
          <nz-descriptions [nzColumn]="2" nzBordered>
            <nz-descriptions-item nzTitle="公司名稱">
              {{ company.companyName }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="統一編號">
              {{ company.businessRegistrationNumber }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="地址">
              {{ company.address }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="電話">
              {{ company.businessPhone }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="傳真">
              {{ company.fax || '未提供' }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="網站">
              @if (company.website) {
                <a [href]="company.website" target="_blank" class="website-link">
                  {{ company.website }}
                </a>
              } @else {
                未提供
              }
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="狀態">
              <nz-tag [nzColor]="CompanyStatusColors[company.status]">
                {{ CompanyStatusLabels[company.status] }}
              </nz-tag>
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="風險等級">
              <nz-tag [nzColor]="RiskLevelColors[company.riskLevel]">
                {{ RiskLevelLabels[company.riskLevel] }}
              </nz-tag>
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="創建時間">
              {{ company.createdAt | date:'yyyy-MM-dd HH:mm:ss' }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="更新時間">
              {{ company.updatedAt | date:'yyyy-MM-dd HH:mm:ss' }}
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <!-- 聯絡人信息卡片 -->
        <nz-card [nzTitle]="'聯絡人信息'" class="contacts-card">
          @if (company.contacts.length === 0) {
            <div class="empty-contacts">
              <nz-empty nzNotFoundImage="simple" [nzNotFoundContent]="'暫無聯絡人信息'">
              </nz-empty>
            </div>
          } @else {
            <nz-list 
              [nzDataSource]="company.contacts" 
              [nzRenderItem]="contactItem"
              [nzItemLayout]="'horizontal'">
              
              <ng-template #contactItem let-contact let-index="index">
                <nz-list-item>
                  <nz-list-item-meta>
                    <nz-list-item-meta-avatar>
                      <nz-avatar 
                        [nzText]="contact.name.charAt(0).toUpperCase()"
                        [style.background-color]="getAvatarColor(index)">
                      </nz-avatar>
                    </nz-list-item-meta-avatar>
                    
                    <nz-list-item-meta-title>
                      <nz-space nzSize="small">
                        {{ contact.name }}
                        @if (contact.isPrimary) {
                          <nz-tag nzColor="blue" nzSize="small">主要聯絡人</nz-tag>
                        }
                      </nz-space>
                    </nz-list-item-meta-title>
                    
                    <nz-list-item-meta-description>
                      <nz-space nzSize="small" nzDirection="vertical">
                        <span>
                          <span nz-icon nzType="user" nzTheme="outline"></span>
                          {{ contact.title }}
                        </span>
                        <span>
                          <span nz-icon nzType="mail" nzTheme="outline"></span>
                          {{ contact.email }}
                        </span>
                        <span>
                          <span nz-icon nzType="phone" nzTheme="outline"></span>
                          {{ contact.phone }}
                        </span>
                      </nz-space>
                    </nz-list-item-meta-description>
                  </nz-list-item-meta>
                </nz-list-item>
              </ng-template>
            </nz-list>
          }
        </nz-card>

        <!-- 操作按鈕 -->
        <nz-card class="actions-card">
          <nz-space nzSize="middle">
            <button 
              nz-button 
              nzType="primary" 
              nzSize="large"
              (click)="onEdit()">
              <span nz-icon nzType="edit"></span>
              編輯公司
            </button>
            
            <button 
              nz-button 
              nzSize="large"
              (click)="onBack()">
              <span nz-icon nzType="arrow-left"></span>
              返回列表
            </button>
          </nz-space>
        </nz-card>
      </div>
    } @else {
      <div class="no-company">
        <nz-empty nzNotFoundImage="simple" [nzNotFoundContent]="'請選擇公司查看詳情'">
        </nz-empty>
      </div>
    }
  `,
  styles: [`
    .company-detail-container {
      padding: 16px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .info-card {
      margin-bottom: 16px;
    }

    .contacts-card {
      margin-bottom: 16px;
    }

    .actions-card {
      margin-bottom: 16px;
    }

    .empty-contacts {
      padding: 40px;
      text-align: center;
    }

    .no-company {
      padding: 40px;
      text-align: center;
    }

    .website-link {
      color: #1890ff;
      text-decoration: none;
    }

    .website-link:hover {
      text-decoration: underline;
    }

    nz-descriptions-item {
      padding: 12px 16px;
    }

    nz-list-item {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    nz-list-item:last-child {
      border-bottom: none;
    }
  `]
})
export class CompanyDetailComponent {
  @Input() company: Company | null = null;

  // 工具常數引用
  readonly CompanyStatusLabels = COMPANY_STATUS_LABELS;
  readonly RiskLevelLabels = RISK_LEVEL_LABELS;
  readonly CompanyStatusColors = COMPANY_STATUS_COLORS;
  readonly RiskLevelColors = RISK_LEVEL_COLORS;

  // 事件輸出
  onEdit(): void {
    // 觸發編輯事件
    console.log('編輯公司:', this.company?.id);
  }

  onBack(): void {
    // 觸發返回事件
    console.log('返回列表');
  }

  // 為聯絡人頭像生成不同顏色
  getAvatarColor(index: number): string {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    return colors[index % colors.length];
  }
}

