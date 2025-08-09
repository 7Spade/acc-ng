import { Injectable } from '@angular/core';

import { Company } from '../../domain/entities/company.entity';
import { CompanyStatusEnum } from '../../domain/value-objects/company-status.vo';
import { RiskLevelEnum } from '../../domain/value-objects/risk-level.vo';
import { CompanyResponseDto, CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';

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
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString()
    };
  }

  /**
   * 將 Company 實體陣列轉換為 CompanyResponseDto 陣列
   */
  toResponseDtoList(companies: Company[]): CompanyResponseDto[] {
    return companies.map(company => this.toResponseDto(company));
  }

  /**
   * 將 CompanyResponseDto 轉換為表單值
   */
  toFormGroup(company: CompanyResponseDto): Record<string, string | CompanyStatusEnum | RiskLevelEnum> {
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
  toCreateCompanyDto(formValue: Record<string, unknown>): CreateCompanyDto {
    return {
      companyName: formValue['companyName'] as string,
      businessRegistrationNumber: formValue['businessRegistrationNumber'] as string,
      address: formValue['address'] as string,
      businessPhone: formValue['businessPhone'] as string,
      status: formValue['status'] as CompanyStatusEnum,
      riskLevel: formValue['riskLevel'] as RiskLevelEnum,
      fax: (formValue['fax'] as string) || '',
      website: (formValue['website'] as string) || ''
    };
  }

  /**
   * 將表單值轉換為 UpdateCompanyDto
   */
  toUpdateCompanyDto(formValue: Record<string, unknown>): UpdateCompanyDto {
    return {
      companyName: formValue['companyName'] as string,
      businessRegistrationNumber: formValue['businessRegistrationNumber'] as string,
      address: formValue['address'] as string,
      businessPhone: formValue['businessPhone'] as string,
      status: formValue['status'] as CompanyStatusEnum,
      riskLevel: formValue['riskLevel'] as RiskLevelEnum,
      fax: (formValue['fax'] as string) || '',
      website: (formValue['website'] as string) || ''
    };
  }
}
