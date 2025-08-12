export type PartnershipLevelType = 'bronze' | 'silver' | 'gold' | 'platinum';

export class PartnershipLevel {
  private static readonly VALID_LEVELS: PartnershipLevelType[] = ['bronze', 'silver', 'gold', 'platinum'];
  
  private constructor(private readonly value: PartnershipLevelType) {}

  static create(value: string): PartnershipLevel {
    const normalizedValue = value.toLowerCase() as PartnershipLevelType;
    
    if (!this.VALID_LEVELS.includes(normalizedValue)) {
      throw new Error(`Invalid partnership level: ${value}. Must be one of: ${this.VALID_LEVELS.join(', ')}`);
    }
    
    return new PartnershipLevel(normalizedValue);
  }

  static bronze(): PartnershipLevel {
    return new PartnershipLevel('bronze');
  }

  static silver(): PartnershipLevel {
    return new PartnershipLevel('silver');
  }

  static gold(): PartnershipLevel {
    return new PartnershipLevel('gold');
  }

  static platinum(): PartnershipLevel {
    return new PartnershipLevel('platinum');
  }

  getValue(): PartnershipLevelType {
    return this.value;
  }

  getDisplayName(): string {
    return this.value.charAt(0).toUpperCase() + this.value.slice(1);
  }

  getPriority(): number {
    const priorities = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
    return priorities[this.value];
  }

  canUpgradeTo(targetLevel: PartnershipLevel): boolean {
    return this.getPriority() < targetLevel.getPriority();
  }

  canDowngradeTo(targetLevel: PartnershipLevel): boolean {
    return this.getPriority() > targetLevel.getPriority();
  }

  equals(other: PartnershipLevel): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
