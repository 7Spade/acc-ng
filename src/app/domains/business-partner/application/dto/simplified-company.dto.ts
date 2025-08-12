import { CompanyStatus, RiskLevel } from '../../domain/entities/company.entity';

export interface SimplifiedCompanyDto {
  id: string;
  companyName: string;
  businessRegistrationNumber: string;
  address: string;
  businessPhone: string;
  status: CompanyStatus;
  riskLevel: RiskLevel;
  fax?: string;
  website?: string;
  contacts: SimplifiedContactDto[];
  createdAt: string;
  updatedAt: string;
}

export interface SimplifiedContactDto {
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface CreateCompanyDto {
  companyName: string;
  businessRegistrationNumber: string;
  address: string;
  businessPhone: string;
  status?: CompanyStatus;
  riskLevel?: RiskLevel;
  fax?: string;
  website?: string;
  contacts?: SimplifiedContactDto[];
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  id: string;
}

