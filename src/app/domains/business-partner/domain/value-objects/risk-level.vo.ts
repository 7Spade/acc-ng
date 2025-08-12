/**
 * 風險等級枚舉
 * 簡化設計，使用枚舉 + 工具函數
 */
export enum RiskLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

/**
 * 風險等級顯示文本
 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.Low]: '低風險',
  [RiskLevel.Medium]: '中風險',
  [RiskLevel.High]: '高風險'
};

/**
 * 風險等級工具函數
 */
export class RiskLevelUtils {
  /**
   * 創建風險等級
   */
  static create(value: string): RiskLevel {
    if (Object.values(RiskLevel).includes(value as RiskLevel)) {
      return value as RiskLevel;
    }
    throw new Error(`Invalid risk level: ${value}`);
  }

  /**
   * 獲取顯示標籤
   */
  static getLabel(riskLevel: RiskLevel): string {
    return RISK_LEVEL_LABELS[riskLevel] || riskLevel;
  }

  /**
   * 檢查是否為高風險
   */
  static isHigh(riskLevel: RiskLevel): boolean {
    return riskLevel === RiskLevel.High;
  }

  /**
   * 檢查是否需要審核
   */
  static requiresApproval(riskLevel: RiskLevel): boolean {
    return riskLevel === RiskLevel.High;
  }

  /**
   * 獲取風險等級顏色
   */
  static getColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case RiskLevel.Low:
        return 'success';
      case RiskLevel.Medium:
        return 'warning';
      case RiskLevel.High:
        return 'error';
      default:
        return 'default';
    }
  }

  /**
   * 獲取風險等級數值
   */
  static getNumericValue(riskLevel: RiskLevel): number {
    switch (riskLevel) {
      case RiskLevel.Low:
        return 1;
      case RiskLevel.Medium:
        return 2;
      case RiskLevel.High:
        return 3;
      default:
        return 0;
    }
  }
}
