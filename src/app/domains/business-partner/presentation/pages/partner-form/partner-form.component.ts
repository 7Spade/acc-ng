// Partner Form Component - 極簡主義實現
import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// ng-zorro-antd imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { PartnerFirebaseService } from '../../../infrastructure/repositories/partner-firebase.service';
import { INDUSTRIES } from '../../../domain/value-objects/constants';
import { isValidEmail } from '../../../domain/value-objects/utils';

@Component({
  selector: 'app-partner-form',
  template: `
    <nz-card [nzTitle]="isEdit() ? '編輯合作夥伴' : '新增合作夥伴'">
      <form nz-form [formGroup]="form" (ngSubmit)="onSubmit()" nzLayout="vertical">
        
        <!-- 基本資訊 -->
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>公司名稱</nz-form-label>
              <nz-form-control nzErrorTip="請輸入公司名稱">
                <input 
                  nz-input 
                  formControlName="companyName" 
                  placeholder="請輸入公司名稱"
                  maxlength="100">
              </nz-form-control>
            </nz-form-item>
          </div>
          
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>行業類別</nz-form-label>
              <nz-form-control nzErrorTip="請選擇行業類別">
                <nz-select 
                  formControlName="industry" 
                  nzPlaceHolder="請選擇行業類別"
                  nzShowSearch>
                  @for (industry of industries; track industry) {
                    <nz-option [nzValue]="industry" [nzLabel]="industry"></nz-option>
                  }
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label>網站</nz-form-label>
              <nz-form-control>
                <input 
                  nz-input 
                  formControlName="website" 
                  placeholder="https://example.com"
                  type="url">
              </nz-form-control>
            </nz-form-item>
          </div>
          
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label>地址</nz-form-label>
              <nz-form-control>
                <textarea 
                  nz-input 
                  formControlName="address" 
                  rows="3" 
                  placeholder="請輸入公司地址"
                  maxlength="500">
                </textarea>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <nz-divider nzText="聯絡人資訊"></nz-divider>

        <!-- 聯絡人列表 -->
        <nz-form-item>
          <nz-form-label nzRequired>聯絡人</nz-form-label>
          <nz-form-control [nzErrorTip]="getContactsErrorTip()">
            <div formArrayName="contacts" class="space-y-4">
              @for (contact of contactsArray.controls; track $index; let i = $index) {
                <nz-card 
                  nzSize="small" 
                  [formGroupName]="i"
                  [nzTitle]="'聯絡人 ' + (i + 1)"
                  [nzExtra]="contactCardExtra"
                  class="contact-card">
                  
                  <ng-template #contactCardExtra>
                    @if (contactsArray.length > 1) {
                      <button 
                        nz-button 
                        nzType="text" 
                        nzDanger 
                        nzSize="small"
                        (click)="removeContact(i)" 
                        type="button">
                        <nz-icon nzType="delete"></nz-icon>
                        移除
                      </button>
                    }
                  </ng-template>
                  
                  <div nz-row [nzGutter]="16">
                    <div nz-col [nzSpan]="12">
                      <nz-form-item>
                        <nz-form-label nzRequired>姓名</nz-form-label>
                        <nz-form-control nzErrorTip="請輸入聯絡人姓名">
                          <input 
                            nz-input 
                            formControlName="name" 
                            placeholder="請輸入姓名"
                            maxlength="50">
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    
                    <div nz-col [nzSpan]="12">
                      <nz-form-item>
                        <nz-form-label nzRequired>職位</nz-form-label>
                        <nz-form-control nzErrorTip="請輸入職位">
                          <input 
                            nz-input 
                            formControlName="role" 
                            placeholder="請輸入職位"
                            maxlength="50">
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                  </div>
                  
                  <div nz-row [nzGutter]="16">
                    <div nz-col [nzSpan]="12">
                      <nz-form-item>
                        <nz-form-label nzRequired>電子郵件</nz-form-label>
                        <nz-form-control nzErrorTip="請輸入有效的電子郵件">
                          <input 
                            nz-input 
                            formControlName="email" 
                            placeholder="請輸入電子郵件" 
                            type="email"
                            maxlength="100">
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    
                    <div nz-col [nzSpan]="12">
                      <nz-form-item>
                        <nz-form-label>電話</nz-form-label>
                        <nz-form-control>
                          <input 
                            nz-input 
                            formControlName="phone" 
                            placeholder="請輸入電話號碼"
                            maxlength="20">
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                  </div>
                  
                  <div class="mt-4">
                    <label nz-checkbox formControlName="isPrimary">
                      設為主要聯絡人
                    </label>
                  </div>
                </nz-card>
              }
            </div>
            
            <button 
              nz-button 
              nzType="dashed" 
              (click)="addContact()" 
              type="button" 
              class="w-full mt-4"
              [disabled]="contactsArray.length >= maxContacts">
              <nz-icon nzType="plus"></nz-icon>
              新增聯絡人
            </button>
          </nz-form-control>
        </nz-form-item>

        <!-- 操作按鈕 -->
        <nz-form-item class="mt-6">
          <nz-form-control>
            <div class="flex gap-4">
              <button 
                nz-button 
                nzType="primary" 
                [nzLoading]="loading()" 
                [disabled]="form.invalid"
                type="submit"
                class="min-w-24">
                {{ isEdit() ? '更新' : '建立' }}
              </button>
              
              <button 
                nz-button 
                type="button" 
                (click)="cancel()"
                [disabled]="loading()">
                取消
              </button>
            </div>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzGridModule,
    NzDividerModule
  ],
  styles: [`
    .contact-card {
      border: 1px solid #d9d9d9;
      border-radius: 6px;
    }
    
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
    
    .min-w-24 {
      min-width: 6rem;
    }
  `]
})
export class PartnerFormComponent implements OnInit {
  // Signals for state management
  loading = signal(false);
  isEdit = signal(false);
  partnerId = signal<string | null>(null);

  // Static data
  industries = INDUSTRIES;
  maxContacts = 10;

  // Reactive form
  form = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    industry: ['', Validators.required],
    website: [''],
    address: ['', Validators.maxLength(500)],
    contacts: this.fb.array([this.createContactForm()]) // Start with one contact
  });

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerFirebaseService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {}

  async ngOnInit(): Promise<void> {
    // Check if editing existing partner
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.partnerId.set(id);
      await this.loadPartner(id);
    }
  }

  get contactsArray(): FormArray {
    return this.form.get('contacts') as FormArray;
  }

  private createContactForm() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      role: ['', [Validators.required, Validators.maxLength(50)]],
      phone: ['', Validators.maxLength(20)],
      isPrimary: [false]
    });
  }

  addContact(): void {
    if (this.contactsArray.length < this.maxContacts) {
      this.contactsArray.push(this.createContactForm());
    }
  }

  removeContact(index: number): void {
    if (this.contactsArray.length > 1) {
      this.contactsArray.removeAt(index);
    } else {
      this.message.warning('至少需要保留一個聯絡人');
    }
  }

  private async loadPartner(id: string): Promise<void> {
    try {
      this.loading.set(true);
      const partner = await this.partnerService.getPartnerById(id);
      
      if (partner) {
        // Clear existing contacts
        while (this.contactsArray.length) {
          this.contactsArray.removeAt(0);
        }
        
        // Add partner contacts
        partner.contacts.forEach(contact => {
          this.contactsArray.push(this.fb.group({
            name: [contact.name, [Validators.required, Validators.maxLength(50)]],
            email: [contact.email, [Validators.required, Validators.email, Validators.maxLength(100)]],
            role: [contact.role, [Validators.required, Validators.maxLength(50)]],
            phone: [contact.phone || '', Validators.maxLength(20)],
            isPrimary: [contact.isPrimary]
          }));
        });

        // Patch form values
        this.form.patchValue({
          companyName: partner.companyName,
          industry: partner.industry,
          website: partner.website || '',
          address: partner.address || ''
        });
      } else {
        this.message.error('找不到指定的合作夥伴');
        this.router.navigate(['/business-partners']);
      }
    } catch (error) {
      console.error('Load partner error:', error);
      this.message.error('載入合作夥伴資料失敗');
      this.router.navigate(['/business-partners']);
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message.warning('請檢查表單內容並修正錯誤');
      return;
    }

    // Validate at least one primary contact
    const contacts = this.form.value.contacts || [];
    const hasPrimaryContact = contacts.some((contact: any) => contact.isPrimary);
    
    if (!hasPrimaryContact && contacts.length > 0) {
      // Automatically set first contact as primary
      const firstContactControl = this.contactsArray.at(0);
      firstContactControl.patchValue({ isPrimary: true });
    }

    this.loading.set(true);
    try {
      const formValue = this.form.value;
      
      if (this.isEdit()) {
        await this.partnerService.updatePartner(this.partnerId()!, {
          companyName: formValue.companyName!,
          industry: formValue.industry!,
          website: formValue.website || undefined,
          address: formValue.address || undefined,
          contacts: formValue.contacts as any[]
        });
        this.message.success('合作夥伴已成功更新');
      } else {
        await this.partnerService.createPartner({
          companyName: formValue.companyName!,
          industry: formValue.industry!,
          website: formValue.website || undefined,
          address: formValue.address || undefined,
          contacts: formValue.contacts as any[]
        });
        this.message.success('合作夥伴已成功建立');
      }
      
      this.router.navigate(['/business-partners']);
    } catch (error) {
      console.error('Save partner error:', error);
      this.message.error(this.isEdit() ? '更新合作夥伴失敗' : '建立合作夥伴失敗');
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/business-partners']);
  }

  getContactsErrorTip(): string {
    const contactsControl = this.form.get('contacts');
    if (contactsControl?.hasError('required')) {
      return '至少需要一個聯絡人';
    }
    return '';
  }
}