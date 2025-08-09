import { CompanyStatusEnum } from '../value-objects/company-status.vo';
import { RiskLevelEnum } from '../value-objects/risk-level.vo';

export interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface CreateCompanyProps {
  companyName: string;
  businessRegistrationNumber: string;
  address: string;
  businessPhone: string;
  status?: CompanyStatusEnum;
  riskLevel?: RiskLevelEnum;
  fax?: string;
  website?: string;
  contacts?: Contact[];
}

export class Company {
  constructor(
    public id: string,
    public companyName: string,
    public businessRegistrationNumber: string,
    public address: string,
    public businessPhone: string,
    public status: CompanyStatusEnum = CompanyStatusEnum.Active,
    public riskLevel: RiskLevelEnum = RiskLevelEnum.Low,
    public fax = '',
    public website = '',
    public contacts: Contact[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

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
      props.status || CompanyStatusEnum.Active,
      props.riskLevel || RiskLevelEnum.Low,
      props.fax?.trim() || '',
      props.website?.trim() || '',
      props.contacts || []
    );
  }

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

  isActive(): boolean {
    return this.status === CompanyStatusEnum.Active;
  }

  isHighRisk(): boolean {
    return this.riskLevel === RiskLevelEnum.High;
  }

  getPrimaryContact(): Contact | null {
    return this.contacts.find(c => c.isPrimary) || null;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

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
