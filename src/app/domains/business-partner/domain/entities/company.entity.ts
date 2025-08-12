import { Injectable } from '@angular/core';

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CompanyContact {
  name: string;
  email: string;
  phone: string;
  position: string;
}

export interface CompanyFinancials {
  annualRevenue?: number;
  employeeCount?: number;
  industry: string;
  taxId?: string;
}

export interface CompanyMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  legalName: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  address: CompanyAddress;
  contacts: CompanyContact[];
  financials: CompanyFinancials;
  metadata: CompanyMetadata;
  tags: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  partnershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyEntity {
  static create(data: Omit<Company, 'id' | 'metadata'>): Company {
    const now = new Date();
    return {
      ...data,
      id: crypto.randomUUID(),
      metadata: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system', // Will be updated by auth service
        updatedBy: 'system', // Will be updated by auth service
        isActive: true
      }
    };
  }

  static update(company: Company, updates: Partial<Omit<Company, 'id' | 'metadata'>>): Company {
    return {
      ...company,
      ...updates,
      metadata: {
        ...company.metadata,
        updatedAt: new Date(),
        updatedBy: 'system' // Will be updated by auth service
      }
    };
  }

  static deactivate(company: Company): Company {
    return {
      ...company,
      status: 'inactive',
      metadata: {
        ...company.metadata,
        isActive: false,
        updatedAt: new Date(),
        updatedBy: 'system'
      }
    };
  }

  static activate(company: Company): Company {
    return {
      ...company,
      status: 'active',
      metadata: {
        ...company.metadata,
        isActive: true,
        updatedAt: new Date(),
        updatedBy: 'system'
      }
    };
  }

  static addContact(company: Company, contact: CompanyContact): Company {
    return this.update(company, {
      contacts: [...company.contacts, contact]
    });
  }

  static removeContact(company: Company, contactEmail: string): Company {
    return this.update(company, {
      contacts: company.contacts.filter(c => c.email !== contactEmail)
    });
  }

  static updatePartnershipLevel(company: Company, level: Company['partnershipLevel']): Company {
    return this.update(company, { partnershipLevel: level });
  }

  static addTag(company: Company, tag: string): Company {
    if (!company.tags.includes(tag)) {
      return this.update(company, {
        tags: [...company.tags, tag]
      });
    }
    return company;
  }

  static removeTag(company: Company, tag: string): Company {
    return this.update(company, {
      tags: company.tags.filter(t => t !== tag)
    });
  }
}
