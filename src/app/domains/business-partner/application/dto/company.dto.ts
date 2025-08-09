import { CompanyStatusEnum } from '../../domain/value-objects/company-status.vo';
import { RiskLevelEnum } from '../../domain/value-objects/risk-level.vo';

/**
 * 動態工作流程步驟
 */
export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignee?: string;
  dueDate?: string;
  notes?: string;
}

/**
 * 動態工作流程數據
 */
export interface DynamicWorkflowData {
  workflowId: string;
  workflowName: string;
  currentStep: number;
  totalSteps: number;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // 添加索引簽名以兼容 Record<string, unknown>
}

/**
 * 表單值接口
 */
export interface CompanyFormValue {
  companyName: string;
  businessRegistrationNumber: string;
  address: string;
  businessPhone: string;
  status: CompanyStatusEnum;
  riskLevel: RiskLevelEnum;
  fax?: string;
  website?: string;
}

/**
 * 聯絡人 DTO
 * 極簡設計，用於 API 傳輸
 */
export interface ContactDto {
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

/**
 * 創建公司 DTO
 * 極簡設計，只包含必要欄位
 */
export interface CreateCompanyDto {
  companyName: string;
  businessRegistrationNumber: string;
  address: string;
  businessPhone: string;
  status?: CompanyStatusEnum;
  riskLevel?: RiskLevelEnum;
  fax?: string;
  website?: string;
  contacts?: ContactDto[];
  dynamicWorkflow?: DynamicWorkflowData;
}

/**
 * 更新公司 DTO
 */
export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  dynamicWorkflow?: DynamicWorkflowData;
}

/**
 * 公司回應 DTO
 * 用於 API 回應
 */
export interface CompanyResponseDto {
  id: string;
  companyName: string;
  businessRegistrationNumber: string;
  address: string;
  businessPhone: string;
  status: CompanyStatusEnum;
  riskLevel: RiskLevelEnum;
  fax: string;
  website: string;
  contacts: ContactDto[];
  dynamicWorkflow?: DynamicWorkflowData;
  createdAt: string;
  updatedAt: string;
}
