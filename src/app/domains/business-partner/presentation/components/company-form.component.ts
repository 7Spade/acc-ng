import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Company } from '../../domain/entities/company.entity';
import { CompanyService } from '../../application/services/company.service';
import { CreateCompanyRequest } from '../../application/use-cases/create-company.use-case';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzCardModule,
    NzSpaceModule,
    NzDividerModule,
    NzIconModule
  ],
  template: `
    <nz-card [nzTitle]="isEditMode ? 'Edit Company' : 'Add New Company'">
      <form nz-form [formGroup]="companyForm" (ngSubmit)="onSubmit()">
        <!-- Basic Information -->
        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>Company Name</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Please enter company name">
            <input nz-input formControlName="name" placeholder="Enter company name" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>Legal Name</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Please enter legal name">
            <input nz-input formControlName="legalName" placeholder="Enter legal name" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">Description</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <textarea nz-input formControlName="description" placeholder="Enter company description" [nzAutosize]="{ minRows: 3, maxRows: 5 }"></textarea>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">Website</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <input nz-input formControlName="website" placeholder="https://example.com" />
          </nz-form-control>
        </nz-form-item>

        <nz-divider nzText="Address Information"></nz-divider>

        <!-- Address -->
        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>Street Address</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Please enter street address">
            <input nz-input formControlName="street" placeholder="Enter street address" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>City</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Please enter city">
            <input nz-input formControlName="city" placeholder="Enter city" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">State/Province</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <input nz-input formControlName="state" placeholder="Enter state or province" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">ZIP/Postal Code</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <input nz-input formControlName="zipCode" placeholder="Enter ZIP or postal code" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>Country</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Please enter country">
            <input nz-input formControlName="country" placeholder="Enter country" />
          </nz-form-control>
        </nz-form-item>

        <nz-divider nzText="Financial Information"></nz-divider>

        <!-- Financials -->
        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>Industry</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Please select industry">
            <nz-select formControlName="industry" placeholder="Select industry">
              <nz-option nzValue="Technology" nzLabel="Technology"></nz-option>
              <nz-option nzValue="Healthcare" nzLabel="Healthcare"></nz-option>
              <nz-option nzValue="Finance" nzLabel="Finance"></nz-option>
              <nz-option nzValue="Manufacturing" nzLabel="Manufacturing"></nz-option>
              <nz-option nzValue="Retail" nzLabel="Retail"></nz-option>
              <nz-option nzValue="Education" nzLabel="Education"></nz-option>
              <nz-option nzValue="Other" nzLabel="Other"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">Annual Revenue</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <input nz-input formControlName="annualRevenue" placeholder="Enter annual revenue" type="number" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">Employee Count</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <input nz-input formControlName="employeeCount" placeholder="Enter employee count" type="number" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">Tax ID</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <input nz-input formControlName="taxId" placeholder="Enter tax ID" />
          </nz-form-control>
        </nz-form-item>

        <nz-divider nzText="Partnership Details"></nz-divider>

        <!-- Partnership -->
        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>Status</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Please select status">
            <nz-select formControlName="status" placeholder="Select status">
              <nz-option nzValue="active" nzLabel="Active"></nz-option>
              <nz-option nzValue="inactive" nzLabel="Inactive"></nz-option>
              <nz-option nzValue="pending" nzLabel="Pending"></nz-option>
              <nz-option nzValue="suspended" nzLabel="Suspended"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>Partnership Level</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Please select partnership level">
            <nz-select formControlName="partnershipLevel" placeholder="Select partnership level">
              <nz-option nzValue="bronze" nzLabel="Bronze"></nz-option>
              <nz-option nzValue="silver" nzLabel="Silver"></nz-option>
              <nz-option nzValue="gold" nzLabel="Gold"></nz-option>
              <nz-option nzValue="platinum" nzLabel="Platinum"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">Notes</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <textarea nz-input formControlName="notes" placeholder="Enter additional notes" [nzAutosize]="{ minRows: 3, maxRows: 5 }"></textarea>
          </nz-form-control>
        </nz-form-item>

        <!-- Form Actions -->
        <nz-form-item>
          <nz-form-control [nzOffset]="6" [nzSpan]="18">
            <nz-space>
              <button 
                nz-button 
                nzType="primary" 
                nzSize="large"
                type="submit"
                [nzLoading]="loading()"
              >
                {{ isEditMode ? 'Update' : 'Create' }} Company
              </button>
              <button 
                nz-button 
                nzSize="large"
                type="button"
                (click)="onCancel()"
              >
                Cancel
              </button>
            </nz-space>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-card>
  `,
  styles: [`
    nz-card {
      max-width: 800px;
      margin: 0 auto;
    }
    
    nz-divider {
      margin: 24px 0 16px 0;
    }
    
    nz-form-item {
      margin-bottom: 16px;
    }
  `]
})
export class CompanyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly message = inject(NzMessageService);

  companyForm!: FormGroup;
  isEditMode = false;
  companyId: string | null = null;
  loading = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      legalName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      website: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      zipCode: [''],
      country: ['', Validators.required],
      industry: ['', Validators.required],
      annualRevenue: [null],
      employeeCount: [null],
      taxId: [''],
      status: ['active', Validators.required],
      partnershipLevel: ['bronze', Validators.required],
      notes: ['']
    });
  }

  private checkEditMode(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.companyId;

    if (this.isEditMode && this.companyId) {
      this.loadCompany(this.companyId);
    }
  }

  private loadCompany(id: string): void {
    // Load company data for editing
    // This would typically come from a service
  }

  onSubmit(): void {
    if (this.companyForm.valid) {
      this.loading.set(true);
      
      const formValue = this.companyForm.value;
      const request: CreateCompanyRequest = {
        name: formValue.name,
        legalName: formValue.legalName,
        description: formValue.description,
        website: formValue.website,
        address: {
          street: formValue.street,
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          country: formValue.country
        },
        contacts: [], // Will be added in a separate step
        financials: {
          annualRevenue: formValue.annualRevenue,
          employeeCount: formValue.employeeCount,
          industry: formValue.industry,
          taxId: formValue.taxId
        },
        tags: [],
        status: formValue.status,
        partnershipLevel: formValue.partnershipLevel,
        notes: formValue.notes
      };

      if (this.isEditMode) {
        // Update existing company
        this.companyService.updateCompany({
          id: this.companyId!,
          updates: request
        }).subscribe({
          next: (response) => {
            if (response.success) {
              this.message.success('Company updated successfully');
              this.router.navigate(['/business-partner']);
            } else {
              this.message.error(response.error || 'Failed to update company');
            }
          },
          error: (error) => {
            this.message.error('An error occurred while updating company');
            console.error('Update error:', error);
          },
          complete: () => {
            this.loading.set(false);
          }
        });
      } else {
        // Create new company
        this.companyService.createCompany(request).subscribe({
          next: (response) => {
            if (response.success) {
              this.message.success('Company created successfully');
              this.router.navigate(['/business-partner']);
            } else {
              this.message.error(response.error || 'Failed to create company');
            }
          },
          error: (error) => {
            this.message.error('An error occurred while creating company');
            console.error('Create error:', error);
          },
          complete: () => {
            this.loading.set(false);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/business-partner']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.companyForm.controls).forEach(key => {
      const control = this.companyForm.get(key);
      control?.markAsTouched();
    });
  }
}
