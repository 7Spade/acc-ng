
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

import { PaymentWorkflowState, PaymentWorkflowStateEnum } from '../../domain/value-objects/payment-workflow-state.vo';

export interface PaymentWorkflowTransition {
  companyId: string;
  newState: PaymentWorkflowStateEnum;
  operator?: string;
  comment?: string;
}

@Component({
  selector: 'app-payment-workflow',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzTagModule,
    NzTimelineModule,
    NzInputModule,
    NzFormModule,
    NzIconModule,
    NzDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-modal 
      [(nzVisible)]="visible" 
      nzTitle="請款工作流程狀態" 
      nzWidth="700px" 
      [nzFooter]="null" 
      (nzOnCancel)="close()"
    >
      <ng-container *nzModalContent>
        <div class="workflow-container">
          <!-- 當前狀態 -->
          <div class="current-state-section">
            <h4>當前狀態</h4>
            <nz-tag [nzColor]="currentStateColor()" class="state-tag">
              <span nz-icon [nzType]="currentStateIcon()"></span>
              {{ currentStateName() }}
            </nz-tag>
          </div>

          <nz-divider></nz-divider>

          <!-- 可用轉換 -->
          <div class="transitions-section" *ngIf="!isFinalState()">
            <h4>可執行操作</h4>
            <div class="transition-options">
              <div
                *ngFor="let transition of availableTransitions()"
                class="transition-option"
                [class.selected]="selectedTransition() === transition"
                (click)="selectTransition(transition)"
              >
                <nz-tag [nzColor]="getStateColor(transition)">
                  {{ getStateName(transition) }}
                </nz-tag>
              </div>
            </div>

            <!-- 轉換表單 -->
            <div class="transition-form" *ngIf="selectedTransition()">
              <form nz-form nzLayout="vertical">
                <nz-form-item>
                  <nz-form-label>操作人員</nz-form-label>
                  <nz-form-control>
                    <input nz-input [(ngModel)]="operator" placeholder="請輸入操作人員姓名" />
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label>備註</nz-form-label>
                  <nz-form-control>
                    <textarea nz-input [(ngModel)]="comment" placeholder="請輸入操作備註（選填）" rows="3"></textarea>
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-control>
                    <button nz-button nzType="primary" [nzLoading]="isSubmitting()" (click)="executeTransition()">
                      執行狀態轉換
                    </button>
                    <button nz-button nzType="default" class="ml-2" (click)="cancelTransition()">
                      取消
                    </button>
                  </nz-form-control>
                </nz-form-item>
              </form>
            </div>
          </div>

          <!-- 終結狀態提示 -->
          <div class="final-state-notice" *ngIf="isFinalState()">
            <nz-tag nzColor="blue">
              <span nz-icon nzType="info-circle"></span>
              此狀態為終結狀態，無法進行進一步操作
            </nz-tag>
          </div>

          <nz-divider></nz-divider>

          <!-- 狀態歷史 -->
          <div class="history-section">
            <h4>狀態歷史</h4>
            <nz-timeline>
              <nz-timeline-item
                *ngFor="let history of stateHistory()"
                [nzColor]="getStateColor(history.state)"
              >
                <div class="history-item">
                  <div class="history-header">
                    <nz-tag [nzColor]="getStateColor(history.state)">
                      {{ getStateName(history.state) }}
                    </nz-tag>
                    <span class="history-time">
                      {{ history.timestamp | date: 'yyyy-MM-dd HH:mm:ss' }}
                    </span>
                  </div>
                  <div class="history-details" *ngIf="history.operator || history.comment">
                    <div *ngIf="history.operator" class="history-operator"> 操作人員: {{ history.operator }} </div>
                    <div *ngIf="history.comment" class="history-comment"> 備註: {{ history.comment }} </div>
                  </div>
                </div>
              </nz-timeline-item>
            </nz-timeline>
          </div>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [
    `
      .workflow-container {
        padding: 16px 0;
      }

      .current-state-section h4,
      .transitions-section h4,
      .history-section h4 {
        margin: 0 0 16px 0;
        font-weight: 600;
        color: #262626;
      }

      .state-tag {
        font-size: 14px;
        padding: 4px 12px;
        border-radius: 6px;
      }

      .state-tag .anticon {
        margin-right: 6px;
      }

      .transition-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }

      .transition-option {
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .transition-option:hover {
        background-color: #f5f5f5;
      }

      .transition-option.selected {
        border: 1px solid #1890ff;
      }

      .transition-form {
        padding: 16px;
        background-color: #fafafa;
        border-radius: 6px;
        margin-top: 16px;
      }

      .final-state-notice {
        text-align: center;
        padding: 16px;
        background-color: #f6ffed;
        border-radius: 6px;
      }

      .history-item {
        margin-bottom: 8px;
      }

      .history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .history-time {
        font-size: 12px;
        color: #8c8c8c;
      }

      .history-details {
        font-size: 12px;
        color: #595959;
        margin-left: 8px;
      }

      .history-operator {
        margin-bottom: 2px;
      }

      .history-comment {
        font-style: italic;
      }

      .ml-2 {
        margin-left: 8px;
      }
    `
  ]
})
export class PaymentWorkflowComponent {
  @Input() companyId!: string;
  @Input() workflowState: PaymentWorkflowState | null = null;
  @Input() visible = false;

  @Output() readonly visibleChange = new EventEmitter<boolean>();
  @Output() readonly stateTransition = new EventEmitter<PaymentWorkflowTransition>();

  private readonly message = inject(NzMessageService);

  // 簡化狀態管理
  readonly selectedTransition = signal<PaymentWorkflowStateEnum | null>(null);
  readonly isSubmitting = signal(false);

  operator = '';
  comment = '';

  // 狀態圖標映射
  private readonly stateIcons: Record<PaymentWorkflowStateEnum, string> = {
    [PaymentWorkflowStateEnum.Draft]: 'edit',
    [PaymentWorkflowStateEnum.Submitted]: 'upload',
    [PaymentWorkflowStateEnum.Reviewing]: 'eye',
    [PaymentWorkflowStateEnum.Approved]: 'check-circle',
    [PaymentWorkflowStateEnum.Rejected]: 'close-circle',
    [PaymentWorkflowStateEnum.Processing]: 'loading',
    [PaymentWorkflowStateEnum.Completed]: 'check',
    [PaymentWorkflowStateEnum.Cancelled]: 'stop'
  };

  // Computed properties
  readonly currentStateName = computed(() => 
    this.workflowState?.getStateDisplayName() || 'Unknown'
  );

  readonly currentStateColor = computed(() => 
    this.workflowState?.getStateColor() || 'default'
  );

  readonly currentStateIcon = computed(() => 
    this.stateIcons[this.workflowState?.currentState || PaymentWorkflowStateEnum.Draft] || 'question'
  );

  readonly isFinalState = computed(() => 
    this.workflowState?.isFinalState() || false
  );

  readonly availableTransitions = computed(() => 
    this.workflowState?.availableTransitions || []
  );

  readonly stateHistory = computed(() => 
    this.workflowState?.stateHistory || []
  );

  selectTransition(transition: PaymentWorkflowStateEnum): void {
    this.selectedTransition.set(transition);
    this.operator = '';
    this.comment = '';
  }

  cancelTransition(): void {
    this.selectedTransition.set(null);
    this.operator = '';
    this.comment = '';
  }

  executeTransition(): void {
    const selectedState = this.selectedTransition();
    if (!selectedState || !this.workflowState) return;

    if (!this.operator.trim()) {
      this.message.error('請輸入操作人員');
      return;
    }

    if (!this.workflowState.canTransitionTo(selectedState)) {
      this.message.error('無法轉換到此狀態');
      return;
    }

    this.isSubmitting.set(true);

    // 模擬 API 調用
    setTimeout(() => {
      this.stateTransition.emit({
        companyId: this.companyId,
        newState: selectedState,
        operator: this.operator.trim(),
        comment: this.comment.trim() || undefined
      });

      this.message.success('狀態轉換成功');
      this.cancelTransition();
      this.close();
      this.isSubmitting.set(false);
    }, 1000);
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancelTransition();
  }

  getStateName(state: PaymentWorkflowStateEnum): string {
    return this.workflowState?.getStateDisplayName(state) || state;
  }

  getStateColor(state: PaymentWorkflowStateEnum): string {
    return this.workflowState?.getStateColor(state) || 'default';
  }
}
