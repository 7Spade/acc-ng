/**
 * 公司狀態枚舉
 * 簡化設計，使用枚舉 + 工具函數
 */
export enum CompanyStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
  Blacklisted = 'blacklisted'
}

/**
 * 公司狀態顯示文本
 */
export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  [CompanyStatus.Active]: '啟用',
  [CompanyStatus.Inactive]: '停用',
  [CompanyStatus.Pending]: '待審核',
  [CompanyStatus.Blacklisted]: '黑名單'
};

/**
 * 公司狀態工具函數
 */
export class CompanyStatusUtils {
  /**
   * 創建公司狀態
   */
  static create(value: string): CompanyStatus {
    if (Object.values(CompanyStatus).includes(value as CompanyStatus)) {
      return value as CompanyStatus;
    }
    throw new Error(`Invalid company status: ${value}`);
  }

  /**
   * 獲取顯示標籤
   */
  static getLabel(status: CompanyStatus): string {
    return COMPANY_STATUS_LABELS[status] || status;
  }

  /**
   * 檢查是否為啟用狀態
   */
  static isActive(status: CompanyStatus): boolean {
    return status === CompanyStatus.Active;
  }

  /**
   * 檢查是否為黑名單
   */
  static isBlacklisted(status: CompanyStatus): boolean {
    return status === CompanyStatus.Blacklisted;
  }

  /**
   * 檢查是否需要審核
   */
  static requiresApproval(status: CompanyStatus): boolean {
    return status === CompanyStatus.Pending;
  }

  /**
   * 獲取狀態顏色
   */
  static getColor(status: CompanyStatus): string {
    switch (status) {
      case CompanyStatus.Active:
        return 'success';
      case CompanyStatus.Inactive:
        return 'default';
      case CompanyStatus.Pending:
        return 'warning';
      case CompanyStatus.Blacklisted:
        return 'error';
      default:
        return 'default';
    }
  }
}
