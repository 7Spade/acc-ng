/**
 * 公司狀態枚舉 - 簡化設計
 */
export enum CompanyStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
  Blacklisted = 'blacklisted'
}

/**
 * 風險等級枚舉 - 簡化設計
 */
export enum RiskLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

/**
 * 聯絡人介面 - 簡化為內嵌介面
 */
export interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

/**
 * 聯絡人創建屬性
 */
export interface CreateContactProps {
  name: string;
  title?: string;
  email: string;
  phone?: string;
  isPrimary?: boolean;
}

/**
 * 公司創建屬性
 */
export interface CreateCompanyProps {
  companyName: string;
  businessRegistrationNumber: string;
  address: string;
  businessPhone: string;
  status?: CompanyStatus;
  riskLevel?: RiskLevel;
  fax?: string;
  website?: string;
  contacts?: Contact[];
}

/**
 * 公司實體 - 簡化設計
 */
export class Company {
  constructor(
    public id: string,
    public companyName: string,
    public businessRegistrationNumber: string,
    public address: string,
    public businessPhone: string,
    public status: CompanyStatus = CompanyStatus.Active,
    public riskLevel: RiskLevel = RiskLevel.Low,
    public fax = '',
    public website = '',
    public contacts: Contact[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * 創建公司實例
   */
  static create(props: CreateCompanyProps): Company {
    if (!props.companyName?.trim()) throw new Error('Company name is required');
    if (!props.businessRegistrationNumber?.trim()) throw new Error('Business registration number is required');
    if (!props.address?.trim()) throw new Error('Address is required');
    if (!props.businessPhone?.trim()) throw new Error('Business phone is required');

    return new Company(
      this.generateId(),
      props.companyName.trim(),
      props.businessRegistrationNumber.trim(),
      props.address.trim(),
      props.businessPhone.trim(),
      props.status || CompanyStatus.Active,
      props.riskLevel || RiskLevel.Low,
      props.fax?.trim() || '',
      props.website?.trim() || '',
      props.contacts || []
    );
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * 更新公司資訊
   */
  update(props: Partial<CreateCompanyProps>): Company {
    return new Company(
      this.id,
      props.companyName?.trim() || this.companyName,
      props.businessRegistrationNumber?.trim() || this.businessRegistrationNumber,
      props.address?.trim() || this.address,
      props.businessPhone?.trim() || this.businessPhone,
      props.status || this.status,
      props.riskLevel || this.riskLevel,
      props.fax?.trim() ?? this.fax,
      props.website?.trim() ?? this.website,
      props.contacts || this.contacts,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 添加聯絡人
   */
  addContact(contact: Contact): Company {
    const contacts = [...this.contacts];
    if (contact.isPrimary) {
      contacts.forEach(c => (c.isPrimary = false));
    }
    contacts.push(contact);

    return new Company(
      this.id,
      this.companyName,
      this.businessRegistrationNumber,
      this.address,
      this.businessPhone,
      this.status,
      this.riskLevel,
      this.fax,
      this.website,
      contacts,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 更新聯絡人
   */
  updateContact(contactIndex: number, contact: Contact): Company {
    const contacts = [...this.contacts];
    if (contactIndex >= 0 && contactIndex < contacts.length) {
      contacts[contactIndex] = contact;
    }

    return new Company(
      this.id,
      this.companyName,
      this.businessRegistrationNumber,
      this.address,
      this.businessPhone,
      this.status,
      this.riskLevel,
      this.fax,
      this.website,
      contacts,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 移除聯絡人
   */
  removeContact(contactIndex: number): Company {
    const contacts = [...this.contacts];
    if (contactIndex >= 0 && contactIndex < contacts.length) {
      contacts.splice(contactIndex, 1);
    }

    return new Company(
      this.id,
      this.companyName,
      this.businessRegistrationNumber,
      this.address,
      this.businessPhone,
      this.status,
      this.riskLevel,
      this.fax,
      this.website,
      contacts,
      this.createdAt,
      new Date()
    );
  }

  // 簡化的業務邏輯方法
  isActive(): boolean {
    return this.status === CompanyStatus.Active;
  }

  isHighRisk(): boolean {
    return this.riskLevel === RiskLevel.High;
  }

  getPrimaryContact(): Contact | null {
    return this.contacts.find(c => c.isPrimary) || null;
  }

  /**
   * 轉換為普通物件
   */
  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      companyName: this.companyName,
      businessRegistrationNumber: this.businessRegistrationNumber,
      address: this.address,
      businessPhone: this.businessPhone,
      status: this.status,
      riskLevel: this.riskLevel,
      fax: this.fax,
      website: this.website,
      contacts: this.contacts,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}

/**
 * 聯絡人工具函數
 */
export class ContactUtils {
  static create(props: CreateContactProps): Contact {
    if (!props.name?.trim()) throw new Error('Contact name is required');
    if (!props.email?.trim()) throw new Error('Contact email is required');

    return {
      name: props.name.trim(),
      title: props.title?.trim() || '',
      email: props.email.trim(),
      phone: props.phone?.trim() || '',
      isPrimary: props.isPrimary || false
    };
  }

  static isValid(contact: Contact): boolean {
    return !!(contact.name?.trim() && contact.email?.trim());
  }

  static getDisplayName(contact: Contact): string {
    return contact.title ? `${contact.name} (${contact.title})` : contact.name;
  }

  static setAsPrimary(contact: Contact): Contact {
    return { ...contact, isPrimary: true };
  }
}

/**
 * 狀態和風險等級工具常數
 */
export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  [CompanyStatus.Active]: '啟用',
  [CompanyStatus.Inactive]: '停用',
  [CompanyStatus.Pending]: '待審核',
  [CompanyStatus.Blacklisted]: '黑名單'
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.Low]: '低風險',
  [RiskLevel.Medium]: '中風險',
  [RiskLevel.High]: '高風險'
};

export const COMPANY_STATUS_COLORS: Record<CompanyStatus, string> = {
  [CompanyStatus.Active]: 'success',
  [CompanyStatus.Inactive]: 'default',
  [CompanyStatus.Pending]: 'warning',
  [CompanyStatus.Blacklisted]: 'error'
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  [RiskLevel.Low]: 'success',
  [RiskLevel.Medium]: 'warning',
  [RiskLevel.High]: 'error'
};
