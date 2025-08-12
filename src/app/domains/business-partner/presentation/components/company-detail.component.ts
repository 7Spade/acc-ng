import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { Company } from '../../domain/entities/company.entity';
import { CompanyService } from '../../application/services/company.service';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzTagModule,
    NzSpaceModule,
    NzIconModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzSpinModule,
    NzEmptyModule
  ],
  template: `
    <div class="company-detail-container">
      <!-- Header Actions -->
      <div class="header-actions mb-4">
        <nz-space>
          <button 
            nz-button 
            nzType="default" 
            nzSize="large"
            (click)="goBack()"
          >
            <span nz-icon nzType="arrow-left"></span>
            Back to List
          </button>
          <button 
            nz-button 
            nzType="primary" 
            nzSize="large"
            [routerLink]="['edit']"
          >
            <span nz-icon nzType="edit"></span>
            Edit Company
          </button>
        </nz-space>
      </div>

      <!-- Loading State -->
      <nz-spin *ngIf="loading()" nzSize="large"></nz-spin>

      <!-- Company Details -->
      <div *ngIf="!loading() && company()">
        <!-- Basic Information -->
        <nz-card nzTitle="Company Information" class="mb-4">
          <nz-descriptions nzColumn="2" nzSize="large">
            <nz-descriptions-item nzTitle="Company Name">
              {{ company()?.name }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Legal Name">
              {{ company()?.legalName }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Status">
              <nz-tag [nzColor]="getStatusColor(company()?.status)">
                {{ company()?.status | titlecase }}
              </nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Partnership Level">
              <nz-tag [nzColor]="getPartnershipLevelColor(company()?.partnershipLevel)">
                {{ company()?.partnershipLevel | titlecase }}
              </nz-descriptions-item>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Industry">
              <nz-tag [nzColor]="getIndustryColor(company()?.financials.industry)">
                {{ company()?.financials.industry }}
              </nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Website">
              <a *ngIf="company()?.website" [href]="company()?.website" target="_blank">
                {{ company()?.website }}
              </a>
              <span *ngIf="!company()?.website">Not provided</span>
            </nz-descriptions-item>
          </nz-descriptions>
          
          <div *ngIf="company()?.description" class="description mt-4">
            <h4>Description</h4>
            <p>{{ company()?.description }}</p>
          </div>
        </nz-card>

        <!-- Address Information -->
        <nz-card nzTitle="Address Information" class="mb-4">
          <nz-descriptions nzColumn="2" nzSize="large">
            <nz-descriptions-item nzTitle="Street">
              {{ company()?.address.street }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="City">
              {{ company()?.address.city }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="State/Province">
              {{ company()?.address.state || 'Not provided' }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="ZIP/Postal Code">
              {{ company()?.address.zipCode || 'Not provided' }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Country">
              {{ company()?.address.country }}
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <!-- Financial Information -->
        <nz-card nzTitle="Financial Information" class="mb-4">
          <nz-descriptions nzColumn="2" nzSize="large">
            <nz-descriptions-item nzTitle="Industry">
              {{ company()?.financials.industry }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Annual Revenue">
              {{ company()?.financials.annualRevenue ? '$' + (company()?.financials.annualRevenue | number) : 'Not provided' }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Employee Count">
              {{ company()?.financials.employeeCount || 'Not provided' }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Tax ID">
              {{ company()?.financials.taxId || 'Not provided' }}
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <!-- Contact Information -->
        <nz-card nzTitle="Contact Information" class="mb-4">
          <div *ngIf="company()?.contacts && company()?.contacts.length > 0">
            <div *ngFor="let contact of company()?.contacts" class="contact-item mb-3">
              <nz-descriptions nzColumn="2" nzSize="small">
                <nz-descriptions-item nzTitle="Name">
                  {{ contact.name }}
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Position">
                  {{ contact.position }}
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Email">
                  <a [href]="'mailto:' + contact.email">{{ contact.email }}</a>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Phone">
                  <a [href]="'tel:' + contact.phone">{{ contact.phone }}</a>
                </nz-descriptions-item>
              </nz-descriptions>
            </div>
          </div>
          <nz-empty *ngIf="!company()?.contacts || company()?.contacts.length === 0" nzNotFoundContent="No contacts available"></nz-empty>
        </nz-card>

        <!-- Tags -->
        <nz-card nzTitle="Tags" class="mb-4" *ngIf="company()?.tags && company()?.tags.length > 0">
          <nz-space nzWrap>
            <nz-tag *ngFor="let tag of company()?.tags" [nzColor]="'blue'">
              {{ tag }}
            </nz-tag>
          </nz-space>
        </nz-card>

        <!-- Notes -->
        <nz-card nzTitle="Notes" class="mb-4" *ngIf="company()?.notes">
          <p>{{ company()?.notes }}</p>
        </nz-card>

        <!-- Metadata -->
        <nz-card nzTitle="System Information" class="mb-4">
          <nz-descriptions nzColumn="2" nzSize="small">
            <nz-descriptions-item nzTitle="Created">
              {{ company()?.metadata.createdAt | date:'medium' }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Last Updated">
              {{ company()?.metadata.updatedAt | date:'medium' }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Created By">
              {{ company()?.metadata.createdBy }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Updated By">
              {{ company()?.metadata.updatedBy }}
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>
      </div>

      <!-- Empty State -->
      <nz-empty 
        *ngIf="!loading() && !company()" 
        nzNotFoundImage="simple"
        nzNotFoundContent="Company not found"
      >
      </nz-empty>
    </div>
  `,
  styles: [`
    .company-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mb-4 {
      margin-bottom: 16px;
    }

    .mt-4 {
      margin-top: 16px;
    }

    .description h4 {
      margin-bottom: 8px;
      color: #262626;
    }

    .description p {
      color: #595959;
      line-height: 1.6;
    }

    .contact-item {
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 16px;
    }

    .contact-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  `]
})
export class CompanyDetailComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  company = signal<Company | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const companyId = this.route.snapshot.paramMap.get('id');
    if (companyId) {
      this.loadCompany(companyId);
    }
  }

  private loadCompany(id: string): void {
    this.loading.set(true);
    
    // This would typically come from a service method
    // For now, we'll simulate loading
    setTimeout(() => {
      this.loading.set(false);
      // In a real implementation, you would load the company from the service
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/business-partner']);
  }

  getStatusColor(status: Company['status'] | undefined): string {
    if (!status) return 'default';
    const colors: { [key: string]: string } = {
      'active': 'green',
      'inactive': 'red',
      'pending': 'orange',
      'suspended': 'red'
    };
    return colors[status] || 'default';
  }

  getPartnershipLevelColor(level: Company['partnershipLevel'] | undefined): string {
    if (!level) return 'default';
    const colors: { [key: string]: string } = {
      'bronze': 'brown',
      'silver': 'silver',
      'gold': 'gold',
      'platinum': 'purple'
    };
    return colors[level] || 'default';
  }

  getIndustryColor(industry: string | undefined): string {
    if (!industry) return 'default';
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
}
