export class CompanyId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Company ID cannot be empty');
    }
  }

  static create(value: string): CompanyId {
    return new CompanyId(value);
  }

  static generate(): CompanyId {
    return new CompanyId(crypto.randomUUID());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CompanyId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
