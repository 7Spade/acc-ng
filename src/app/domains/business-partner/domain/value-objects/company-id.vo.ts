import { v4 as uuidv4 } from 'uuid';

/**
 * 公司 ID 工具類
 * 簡化設計，只包含必要功能
 */
export class CompanyId {
  /**
   * 創建公司 ID
   */
  static create(value: string): string {
    if (!value?.trim()) {
      throw new Error('Company ID cannot be empty');
    }
    return value.trim();
  }

  /**
   * 生成新的公司 ID
   */
  static generate(): string {
    return uuidv4();
  }

  /**
   * 驗證公司 ID 格式
   */
  static isValid(id: string): boolean {
    return !!(id && id.trim() && id.length > 0);
  }

  /**
   * 格式化公司 ID
   */
  static format(id: string): string {
    return id.trim().toUpperCase();
  }
}
