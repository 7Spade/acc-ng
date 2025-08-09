
import { Injectable } from '@angular/core';
import { Company } from '../../domain/entities/company.entity';
import { CompanyResponseDto, CreateCompanyDto, UpdateCompanyDto, ContactDto } from '../dto/company.dto';
import { CompanyStatusEnum } from '../../domain/value-objects/company-status.vo';
import { RiskLevelEnum } from '../../domain/value-objects/risk-level.vo';

@Injectable({
  providedIn: 'root'
})
export class CompanyMapper {
  /**
   * 將 Company 實體轉換為 CompanyResponseDto
   */
  toResponseDto(company: Company): CompanyResponseDto {
    return {
      id: company.id,
      companyName: company.companyName,
      businessRegistrationNumber: company.businessRegistrationNumber,
      address: company.address,
      businessPhone: company.businessPhone,
      status: company.status as CompanyStatusEnum,
      riskLevel: company.riskLevel as RiskLevelEnum,
      fax: company.fax,
      website: company.website,
      contacts: company.contacts,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }

  /**
   * 將 Company 實體轉換為表單資料
   */
  toFormGroup(company: CompanyResponseDto) {
    return {
      companyName: company.companyName,
      businessRegistrationNumber: company.businessRegistrationNumber,
      address: company.address,
      businessPhone: company.businessPhone,
      status: company.status,
      riskLevel: company.riskLevel,
      fax: company.fax || '',
      website: company.website || ''
    };
  }

  /**
   * 將表單資料轉換為 CreateCompanyDto
   */
  toCreateCompanyDto(formValue: any): CreateCompanyDto {
    return {
      companyName: formValue.companyName,
      businessRegistrationNumber: formValue.businessRegistrationNumber,
      address: formValue.address,
      businessPhone: formValue.businessPhone,
      status: formValue.status,
      riskLevel: formValue.riskLevel,
      fax: formValue.fax || '',
      website: formValue.website || ''
    };
  }

  /**
   * 將表單資料轉換為 UpdateCompanyDto
   */
  toUpdateCompanyDto(formValue: any): UpdateCompanyDto {
    return {
      companyName: formValue.companyName,
      businessRegistrationNumber: formValue.businessRegistrationNumber,
      address: formValue.address,
      businessPhone: formValue.businessPhone,
      status: formValue.status,
      riskLevel: formValue.riskLevel,
      fax: formValue.fax || '',
      website: formValue.website || ''
    };
  }
}
