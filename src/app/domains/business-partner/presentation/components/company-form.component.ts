import { ChangeDetectionStrategy, Component, inject, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

// ng-alain components
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

// Domain imports
import { Company, Contact, ContactUtils } from '../../domain/entities/company.entity';
import { CompanyStatus, CompanyStatusUtils } from '../../domain/value-objects/company-status.vo';
import { RiskLevel, RiskLevelUtils } from '../../domain/value-objects/risk-level.vo';
import { BusinessPartnerService } from '../../application/services/business-partner.service';
import { CreateCompanyDto, SimplifiedContactDto } from '../../application/dto/simplified-company.dto';

/**
 * 現代化的公司表單組件
 * 使用 Angular 20 新特性和響應式表單
 * 支援新增和編輯模式
 */
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
    NzIconModule,
    NzDividerModule,
    NzCheckboxModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-card [nzTitle]="formTitle" class="company-form-card">
      <form nz-form [formGroup]="companyForm" (ngSubmit)="onSubmit()">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="8" nzRequired>公司名稱</nz-form-label>
                <nz-form-control [nzSpan]="16" nzErrorTip="請輸入公司名稱">
                  <input 
                    nz-input 
                    formControlName="companyName"
                    placeholder="請輸入公司名稱" />
                </nz-form-control>
              </nz-form-item>
            </div>
            
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="8" nzRequired>統一編號</nz-form-label>
                <nz-form-control [nzSpan]="16" nzErrorTip="請輸入統一編號">
                  <input 
                    nz-input 
                    formControlName="businessRegistrationNumber"
                    placeholder="請輸入統一編號" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="8" nzRequired>地址</nz-form-label>
                <nz-form-control [nzSpan]="16" nzErrorTip="請輸入地址">
                  <input 
                    nz-input 
                    formControlName="address"
                    placeholder="請輸入地址" />
                </nz-form-control>
              </nz-form-item>
            </div>
            
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="8" nzRequired>電話</nz-form-label>
                <nz-form-control [nzSpan]="16" nzErrorTip="請輸入電話">
                  <input 
                    nz-input 
                    formControlName="businessPhone"
                    placeholder="請輸入電話" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="8">傳真</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <input 
                    nz-input 
                    formControlName="fax"
                    placeholder="請輸入傳真號碼" />
                </nz-form-control>
              </nz-form-item>
            </div>
            
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="8">網站</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <input 
                    nz-input 
                    formControlName="website"
                    placeholder="請輸入網站地址" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="8">狀態</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <nz-select formControlName="status" placeholder="請選擇狀態">
                    <nz-option nzValue="active" nzLabel="啟用"></nz-option>
                    <nz-option nzValue="inactive" nzLabel="停用"></nz-option>
                    <nz-option nzValue="pending" nzLabel="待審核"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
            
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="8">風險等級</nz-form-label>
                <nz-form-control [nzSpan]="16">
                  <nz-select formControlName="riskLevel" placeholder="請選擇風險等級">
                    <nz-option nzValue="low" nzLabel="低風險"></nz-option>
                    <nz-option nzValue="medium" nzLabel="中風險"></nz-option>
                    <nz-option nzValue="high" nzLabel="高風險"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
        </div>

        <!-- 聯絡人信息 -->
        <nz-divider></nz-divider>
        
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">聯絡人信息</h3>
            <button 
              nz-button 
              nzType="dashed" 
              nzSize="small"
              (click)="addContact()">
              <span nz-icon nzType="plus"></span>
              新增聯絡人
            </button>
          </div>

          @if (contactsArray.length === 0) {
            <div class="empty-contacts">
              <p>暫無聯絡人信息，請點擊上方按鈕新增</p>
            </div>
          } @else {
            @for (contact of contactsArray.controls; track $index) {
              <div class="contact-item" [formGroupName]="$index">
                <div class="contact-header">
                  <h4>聯絡人 #{{ $index + 1 }}</h4>
                  <button 
                    nz-button 
                    nzType="text" 
                    nzDanger
                    nzSize="small"
                    (click)="removeContact($index)">
                    <span nz-icon nzType="delete"></span>
                  </button>
                </div>

                <div nz-row [nzGutter]="16">
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label [nzSpan]="8" nzRequired>姓名</nz-form-label>
                      <nz-form-control [nzSpan]="16" nzErrorTip="請輸入姓名">
                        <input 
                          nz-input 
                          formControlName="name"
                          placeholder="請輸入聯絡人姓名" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label [nzSpan]="8" nzRequired>職稱</nz-form-label>
                      <nz-form-control [nzSpan]="16" nzErrorTip="請輸入職稱">
                        <input 
                          nz-input 
                          formControlName="title"
                          placeholder="請輸入職稱" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>

                <div nz-row [nzGutter]="16">
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label [nzSpan]="8" nzRequired>電子郵件</nz-form-label>
                      <nz-form-control [nzSpan]="16" nzErrorTip="請輸入有效的電子郵件">
                        <input 
                          nz-input 
                          formControlName="email"
                          type="email"
                          placeholder="請輸入電子郵件" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label [nzSpan]="8" nzRequired>電話</nz-form-label>
                      <nz-form-control [nzSpan]="16" nzErrorTip="請輸入電話">
                        <input 
                          nz-input 
                          formControlName="phone"
                          placeholder="請輸入電話" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>

                <div nz-row [nzGutter]="16">
                  <div nz-col [nzSpan]="24">
                    <nz-form-item>
                      <nz-form-label [nzSpan]="4">主要聯絡人</nz-form-label>
                      <nz-form-control [nzSpan]="20">
                        <label nz-checkbox formControlName="isPrimary">
                          設為主要聯絡人
                        </label>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>

                @if ($index < contactsArray.length - 1) {
                  <nz-divider></nz-divider>
                }
              </div>
            }
          }
        </div>

        <!-- 表單操作 -->
        <nz-divider></nz-divider>
        
        <div class="form-actions">
          <nz-space>
            <button 
              nz-button 
              nzType="primary" 
              nzSize="large"
              type="submit"
              [nzLoading]="submitting">
              {{ isEditMode ? '更新公司' : '創建公司' }}
            </button>
            
            <button 
              nz-button 
              nzSize="large"
              (click)="onCancel()">
              取消
            </button>
          </nz-space>
        </div>
      </form>
    </nz-card>
  `,
  styles: [`
    .company-form-card {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .section-title {
      margin-bottom: 16px;
      color: #262626;
      font-weight: 600;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .empty-contacts {
      text-align: center;
      padding: 24px;
      color: #8c8c8c;
      background: #fafafa;
      border-radius: 6px;
    }

    .contact-item {
      padding: 16px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      margin-bottom: 16px;
      background: #fafafa;
    }

    .contact-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .contact-header h4 {
      margin: 0;
      color: #262626;
    }

    .form-actions {
      text-align: center;
      padding-top: 16px;
    }

    nz-form-item {
      margin-bottom: 16px;
    }
  `]
})
export class CompanyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input() company?: Company;
  @Input() submitting = false;
  @Output() formSubmit = new EventEmitter<CreateCompanyDto>();
  @Output() formCancel = new EventEmitter<void>();

  companyForm!: FormGroup;
  isEditMode = false;

  get contactsArray(): FormArray {
    return this.companyForm.get('contacts') as FormArray;
  }

  get formTitle(): string {
    return this.isEditMode ? '編輯公司信息' : '新增公司';
  }

  ngOnInit(): void {
    this.isEditMode = !!this.company;
    this.initForm();
    
    if (this.company) {
      this.patchForm();
    }
  }

  private initForm(): void {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      businessRegistrationNumber: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      businessPhone: ['', [Validators.required, Validators.pattern(/^[\d\-\+\(\)\s]+$/)]],
      status: ['active', Validators.required],
      riskLevel: ['low', Validators.required],
      fax: [''],
      website: [''],
      contacts: this.fb.array([])
    });
  }

  private patchForm(): void {
    if (!this.company) return;

    this.companyForm.patchValue({
      companyName: this.company.companyName,
      businessRegistrationNumber: this.company.businessRegistrationNumber,
      address: this.company.address,
      businessPhone: this.company.businessPhone,
      status: this.company.status,
      riskLevel: this.company.riskLevel,
      fax: this.company.fax,
      website: this.company.website
    });

    // 清空現有聯絡人
    while (this.contactsArray.length !== 0) {
      this.contactsArray.removeAt(0);
    }

    // 添加聯絡人
    this.company.contacts.forEach(contact => {
      this.addContact(contact);
    });
  }

  addContact(contact?: Contact): void {
    const contactGroup = this.fb.group({
      name: [contact?.name || '', [Validators.required, Validators.minLength(2)]],
      title: [contact?.title || '', [Validators.required]],
      email: [contact?.email || '', [Validators.required, Validators.email]],
      phone: [contact?.phone || '', [Validators.required]],
      isPrimary: [contact?.isPrimary || false]
    });

    this.contactsArray.push(contactGroup);
  }

  removeContact(index: number): void {
    this.contactsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.companyForm.valid) {
      const formData: CreateCompanyDto = this.companyForm.value;
      
      // 處理主要聯絡人邏輯
      if (formData.contacts && formData.contacts.length > 0) {
        const primaryContacts = formData.contacts.filter(c => c.isPrimary);
        if (primaryContacts.length > 1) {
          // 如果有多個主要聯絡人，只保留第一個
          formData.contacts.forEach((contact, index) => {
            if (index > 0) {
              contact.isPrimary = false;
            }
          });
        }
      }

      this.formSubmit.emit(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.companyForm.controls).forEach(key => {
      const control = this.companyForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }
}
