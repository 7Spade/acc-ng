import { CompanyStatus } from '../value-objects/company-status.vo';
import { RiskLevel } from '../value-objects/risk-level.vo';
import { CompanyId } from '../value-objects/company-id.vo';
import { Contact, ContactUtils, CreateContactProps } from './contact.entity';

// Re-export Contact types for external use
export type { Contact, CreateContactProps };
export { ContactUtils };

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

  static create(props: CreateCompanyProps): Company {
    if (!props.companyName?.trim()) throw new Error('Company name is required');
    if (!props.businessRegistrationNumber?.trim()) throw new Error('Business registration number is required');
    if (!props.address?.trim()) throw new Error('Address is required');
    if (!props.businessPhone?.trim()) throw new Error('Business phone is required');

    return new Company(
      CompanyId.generate(),
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
