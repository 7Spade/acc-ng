import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { WorkflowDesignerComponent } from './workflow-designer.component';
import { CreateCompanyDto, UpdateCompanyDto, CompanyResponseDto, ContactDto } from '../../application/dto/company.dto';
import { CompanyService } from '../../application/services/company.service';
import { CompanyStatusEnum } from '../../domain/value-objects/company-status.vo';
import { RiskLevelEnum } from '../../domain/value-objects/risk-level.vo';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzSpinModule,
    NzEmptyModule,
    NzIconModule,
    NzDividerModule,
    NzPopconfirmModule,
    NzSwitchModule,
    WorkflowDesignerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="company-list-container">
      <!-- 標題和操作區 -->
      <div class="header">
        <h2>合作夥伴管理</h2>
        <div class="actions">
          <nz-input-group nzSearch [nzAddOnAfter]="searchButton" class="search-input">
            <input nz-input placeholder="搜尋公司名稱或統編..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
          </nz-input-group>
          <ng-template #searchButton>
            <button nz-button nzType="primary" nzSearch>
              <span nz-icon nzType="search"></span>
            </button>
          </ng-template>

          <button nz-button nzType="primary" (click)="openModal('create')">
            <span nz-icon nzType="plus"></span>
            新增合作夥伴
          </button>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div *ngIf="isLoading()" class="loading-container">
        <nz-spin nzSize="large" nzTip="載入中..."></nz-spin>
      </div>

      <!-- 空狀態 -->
      <nz-empty *ngIf="!isLoading() && !hasCompanies()" nzNotFoundImage="simple" nzNotFoundContent="尚無合作夥伴資料">
        <div nz-empty-footer>
          <button nz-button nzType="primary" (click)="openModal('create')"> 立即新增 </button>
        </div>
      </nz-empty>

      <!-- 公司列表 -->
      <nz-table
        *ngIf="!isLoading() && hasCompanies()"
        [nzData]="filteredCompanies()"
        [nzPageSize]="10"
        [nzShowSizeChanger]="true"
        [nzShowQuickJumper]="true"
      >
        <thead>
          <tr>
            <th nzWidth="50px"></th>
            <th>公司名稱</th>
            <th>統一編號</th>
            <th>地址</th>
            <th>電話</th>
            <th>狀態</th>
            <th>風險等級</th>
            <th>聯絡人數</th>
            <th nzWidth="160px">操作</th>
          </tr>
        </thead>
        <tbody>
          @for (company of filteredCompanies(); track company.id) {
            <tr>
              <td [nzExpand]="expandSet().has(company.id)" (nzExpandChange)="toggleExpand(company.id, $event)"></td>
              <td>{{ company.companyName }}</td>
              <td>{{ company.businessRegistrationNumber }}</td>
              <td>{{ company.address }}</td>
              <td>{{ company.businessPhone }}</td>
              <td
                ><nz-tag>{{ company.status }}</nz-tag></td
              >
              <td
                ><nz-tag>{{ company.riskLevel }}</nz-tag></td
              >
              <td>{{ company.contacts.length }}</td>
              <td>
                <button nz-button nzType="link" nzSize="small" (click)="openWorkflowDesigner(company.id)">
                  <span nz-icon nzType="setting"></span>
                  工作流程
                </button>
                <button nz-button nzType="link" nzSize="small" (click)="openModal('edit', company)">
                  <span nz-icon nzType="edit"></span>
                </button>
                <button
                  nz-button
                  nzType="link"
                  nzSize="small"
                  nzDanger
                  nz-popconfirm
                  nzPopconfirmTitle="確定要刪除此合作夥伴嗎？"
                  (nzOnConfirm)="deleteCompany(company.id)"
                >
                  <span nz-icon nzType="delete"></span>
                </button>
              </td>
            </tr>

            <!-- 聯絡人子表 -->
            @if (expandSet().has(company.id)) {
              <tr>
                <td colspan="9" class="contact-table-container">
                  <div class="contact-section">
                    <h4>聯絡人管理</h4>

                    <nz-table [nzData]="company.contacts" [nzShowPagination]="false" nzSize="small">
                      <thead>
                        <tr>
                          <th>姓名</th>
                          <th>職稱</th>
                          <th>Email</th>
                          <th>電話</th>
                          <th>主要聯絡人</th>
                          <th nzWidth="120px">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (contact of company.contacts; track $index) {
                          <tr>
                            <td>{{ contact.name }}</td>
                            <td>{{ contact.title }}</td>
                            <td>{{ contact.email }}</td>
                            <td>{{ contact.phone }}</td>
                            <td
                              ><nz-tag>{{ contact.isPrimary ? '是' : '否' }}</nz-tag></td
                            >
                            <td>
                              <a (click)="editContact(company.id, $index, contact)">編輯</a>
                              <nz-divider nzType="vertical"></nz-divider>
                              <a nz-popconfirm nzPopconfirmTitle="是否要刪除此聯絡人？" (nzOnConfirm)="deleteContact(company.id, $index)"
                                >刪除</a
                              >
                            </td>
                          </tr>
                        }
                      </tbody>
                    </nz-table>

                    <button nz-button nzType="dashed" nzBlock class="add-contact-btn" (click)="addContact(company.id)">
                      <span nz-icon nzType="plus"></span>
                      新增聯絡人
                    </button>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </nz-table>

      <!-- 統一模態框 -->
      <nz-modal
        [(nzVisible)]="modalVisible"
        [nzTitle]="modalTitle()"
        nzWidth="600px"
        [nzOkLoading]="isSubmitting()"
        (nzOnOk)="handleSubmit()"
        (nzOnCancel)="closeModal()"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="form" nzLayout="vertical">
            <nz-form-item>
              <nz-form-label nzRequired>公司名稱</nz-form-label>
              <nz-form-control nzErrorTip="請輸入公司名稱">
                <input nz-input formControlName="companyName" placeholder="請輸入公司名稱" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>統一編號</nz-form-label>
              <nz-form-control nzErrorTip="請輸入統一編號">
                <input nz-input formControlName="businessRegistrationNumber" placeholder="請輸入統一編號" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>公司地址</nz-form-label>
              <nz-form-control nzErrorTip="請輸入公司地址">
                <input nz-input formControlName="address" placeholder="請輸入公司地址" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>聯絡電話</nz-form-label>
              <nz-form-control nzErrorTip="請輸入聯絡電話">
                <input nz-input formControlName="businessPhone" placeholder="請輸入聯絡電話" />
              </nz-form-control>
            </nz-form-item>

            <div nz-row [nzGutter]="16">
              <div nz-col nzSpan="12">
                <nz-form-item>
                  <nz-form-label>狀態</nz-form-label>
                  <nz-form-control>
                    <nz-select formControlName="status">
                      <nz-option *ngFor="let status of statusOptions" [nzLabel]="status" [nzValue]="status"> </nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
              </div>
              <div nz-col nzSpan="12">
                <nz-form-item>
                  <nz-form-label>風險等級</nz-form-label>
                  <nz-form-control>
                    <nz-select formControlName="riskLevel">
                      <nz-option *ngFor="let risk of riskOptions" [nzLabel]="risk" [nzValue]="risk"> </nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
              </div>
            </div>

            <div nz-row [nzGutter]="16">
              <div nz-col nzSpan="12">
                <nz-form-item>
                  <nz-form-label>傳真</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="fax" placeholder="請輸入傳真" />
                  </nz-form-control>
                </nz-form-item>
              </div>
              <div nz-col nzSpan="12">
                <nz-form-item>
                  <nz-form-label>網站</nz-form-label>
                  <nz-form-control>
                    <input nz-input formControlName="website" placeholder="請輸入網站" />
                  </nz-form-control>
                </nz-form-item>
              </div>
            </div>
          </form>
        </ng-container>
      </nz-modal>

      <!-- 聯絡人模態框 -->
      <nz-modal
        [(nzVisible)]="contactModalVisible"
        [nzTitle]="contactModalTitle()"
        nzWidth="500px"
        [nzOkLoading]="isSubmitting()"
        (nzOnOk)="handleContactSubmit()"
        (nzOnCancel)="closeContactModal()"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="contactForm" nzLayout="vertical">
            <nz-form-item>
              <nz-form-label nzRequired>姓名</nz-form-label>
              <nz-form-control nzErrorTip="請輸入姓名">
                <input nz-input formControlName="name" placeholder="請輸入姓名" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>職稱</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="title" placeholder="請輸入職稱" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>Email</nz-form-label>
              <nz-form-control nzErrorTip="請輸入有效的Email">
                <input nz-input formControlName="email" placeholder="請輸入Email" type="email" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>電話</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="phone" placeholder="請輸入電話" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>主要聯絡人</nz-form-label>
              <nz-form-control>
                <nz-switch formControlName="isPrimary"></nz-switch>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- 工作流程設計器模態框 -->
      <nz-modal
        [nzVisible]="workflowModalVisible()"
        nzTitle="工作流程設計器"
        nzWidth="90%"
        [nzFooter]="null"
        (nzOnCancel)="closeWorkflowDesigner()"
      >
        <ng-container *nzModalContent>
          <app-workflow-designer [companyId]="workflowCompanyId()"></app-workflow-designer>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [
    `
      .company-list-container {
        padding: 24px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .header h2 {
        margin: 0;
      }

      .actions {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .search-input {
        width: 300px;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
      }

      .contact-table-container {
        padding: 0 !important;
      }

      .contact-section {
        padding: 16px;
      }

      .contact-section h4 {
        margin: 0 0 16px 0;
        font-weight: 600;
      }

      .add-contact-btn {
        margin-top: 12px;
        border-style: dashed;
      }
    `
  ]
})
export class CompanyListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  // 簡化狀態管理
  readonly searchQuery = signal('');
  readonly expandSet = signal(new Set<string>());
  readonly isSubmitting = signal(false);

  // 模態框狀態
  modalVisible = false;
  modalMode: 'create' | 'edit' = 'create';
  editingCompanyId: string | null = null;

  contactModalVisible = false;
  contactMode: 'add' | 'edit' = 'add';
  editingContactCompanyId: string | null = null;
  editingContactIndex = -1;

  readonly workflowModalVisible = signal(false);
  readonly workflowCompanyId = signal('');

  // 表單
  form = this.fb.group({
    companyName: ['', [Validators.required]],
    businessRegistrationNumber: ['', [Validators.required]],
    address: ['', [Validators.required]],
    businessPhone: ['', [Validators.required]],
    status: [CompanyStatusEnum.Active],
    riskLevel: [RiskLevelEnum.Low],
    fax: [''],
    website: ['']
  });

  contactForm = this.fb.group({
    name: ['', [Validators.required]],
    title: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    isPrimary: [false]
  });

  // 選項
  readonly statusOptions = Object.values(CompanyStatusEnum);
  readonly riskOptions = Object.values(RiskLevelEnum);

  // Computed
  readonly isLoading = computed(() => this.companyService.loading());
  readonly hasCompanies = computed(() => this.companyService.hasCompanies());
  readonly filteredCompanies = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const companies = this.companyService.companies();

    if (!query) return companies;

    return companies.filter(
      company => company.companyName.toLowerCase().includes(query) || company.businessRegistrationNumber.includes(query)
    );
  });

  readonly modalTitle = computed(() => (this.modalMode === 'create' ? '新增合作夥伴' : '編輯合作夥伴'));

  readonly contactModalTitle = computed(() => (this.contactMode === 'add' ? '新增聯絡人' : '編輯聯絡人'));

  ngOnInit() {
    this.companyService.loadCompanies();
  }

  // 模態框操作
  openModal(mode: 'create' | 'edit', company?: CompanyResponseDto): void {
    this.modalMode = mode;
    this.modalVisible = true;

    if (mode === 'edit' && company) {
      this.editingCompanyId = company.id;
      this.form.patchValue(company);
    } else {
      this.form.reset({
        status: CompanyStatusEnum.Active,
        riskLevel: RiskLevelEnum.Low
      });
    }
  }

  closeModal(): void {
    this.modalVisible = false;
    this.form.reset();
    this.editingCompanyId = null;
  }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.markFormTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.value;

    const operation =
      this.modalMode === 'create'
        ? this.companyService.createCompany(formValue as CreateCompanyDto)
        : this.companyService.updateCompany(this.editingCompanyId!, formValue as UpdateCompanyDto);

    operation.subscribe({
      next: () => {
        this.message.success(`${this.modalMode === 'create' ? '新增' : '更新'}合作夥伴成功`);
        this.closeModal();
      },
      error: () => {
        this.message.error(`${this.modalMode === 'create' ? '新增' : '更新'}合作夥伴失敗`);
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  // 聯絡人操作
  addContact(companyId: string): void {
    this.contactMode = 'add';
    this.editingContactCompanyId = companyId;
    this.contactModalVisible = true;
    this.contactForm.reset({ isPrimary: false });
  }

  editContact(companyId: string, contactIndex: number, contact: ContactDto): void {
    this.contactMode = 'edit';
    this.editingContactCompanyId = companyId;
    this.editingContactIndex = contactIndex;
    this.contactModalVisible = true;
    this.contactForm.patchValue(contact);
  }

  closeContactModal(): void {
    this.contactModalVisible = false;
    this.contactForm.reset();
    this.editingContactCompanyId = null;
    this.editingContactIndex = -1;
  }

  handleContactSubmit(): void {
    if (this.contactForm.invalid) {
      this.markFormTouched(this.contactForm);
      return;
    }

    this.isSubmitting.set(true);
    const contact = this.contactForm.value as ContactDto;

    const operation =
      this.contactMode === 'add'
        ? this.companyService.addContact(this.editingContactCompanyId!, contact)
        : this.companyService.updateContact(this.editingContactCompanyId!, this.editingContactIndex, contact);

    operation.subscribe({
      next: () => {
        this.message.success(`${this.contactMode === 'add' ? '新增' : '更新'}聯絡人成功`);
        this.closeContactModal();
      },
      error: () => {
        this.message.error(`${this.contactMode === 'add' ? '新增' : '更新'}聯絡人失敗`);
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  deleteContact(companyId: string, contactIndex: number): void {
    this.companyService.removeContact(companyId, contactIndex).subscribe({
      next: () => {
        this.message.success('刪除聯絡人成功');
      },
      error: () => {
        this.message.error('刪除聯絡人失敗');
      }
    });
  }

  // 其他操作
  toggleExpand(companyId: string, expanded: boolean): void {
    const currentSet = new Set(this.expandSet());
    if (expanded) {
      currentSet.add(companyId);
    } else {
      currentSet.delete(companyId);
    }
    this.expandSet.set(currentSet);
  }

  deleteCompany(companyId: string): void {
    this.companyService.deleteCompany(companyId).subscribe({
      next: () => {
        this.message.success('刪除合作夥伴成功');
      },
      error: () => {
        this.message.error('刪除合作夥伴失敗');
      }
    });
  }

  openWorkflowDesigner(companyId: string): void {
    this.workflowCompanyId.set(companyId);
    this.workflowModalVisible.set(true);
  }

  closeWorkflowDesigner(): void {
    this.workflowModalVisible.set(false);
    this.workflowCompanyId.set('');
  }

  private markFormTouched(form = this.form): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }
}
