import { Injectable } from '@angular/core';

import { Company } from '../../domain/entities/company.entity';
import { CompanyStatusEnum } from '../../domain/value-objects/company-status.vo';
import { RiskLevelEnum } from '../../domain/value-objects/risk-level.vo';
import { CompanyResponseDto, CreateCompanyDto, UpdateCompanyDto, CompanyFormValue } from '../dto/company.dto';

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
  toFormGroup(company: CompanyResponseDto): CompanyFormValue {
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
  toCreateCompanyDto(formValue: Partial<CompanyFormValue>): CreateCompanyDto {
    const validated = this.validateFormValue(formValue);
    return {
      companyName: validated.companyName!,
      businessRegistrationNumber: validated.businessRegistrationNumber!,
      address: validated.address!,
      businessPhone: validated.businessPhone!,
      status: validated.status || CompanyStatusEnum.Active,
      riskLevel: validated.riskLevel || RiskLevelEnum.Low,
      fax: validated.fax || '',
      website: validated.website || ''
    };
  }

  /**
   * 將表單值轉換為 UpdateCompanyDto
   */
  toUpdateCompanyDto(formValue: Partial<CompanyFormValue>): UpdateCompanyDto {
    const validated = this.validateFormValue(formValue);
    return {
      companyName: validated.companyName!,
      businessRegistrationNumber: validated.businessRegistrationNumber!,
      address: validated.address!,
      businessPhone: validated.businessPhone!,
      status: validated.status || CompanyStatusEnum.Active,
      riskLevel: validated.riskLevel || RiskLevelEnum.Low,
      fax: validated.fax || '',
      website: validated.website || ''
    };
  }

  /**
   * 驗證表單值的型別安全方法
   */
  private validateFormValue(formValue: Partial<CompanyFormValue>): CompanyFormValue {
    const requiredFields: Array<keyof CompanyFormValue> = ['companyName', 'businessRegistrationNumber', 'address', 'businessPhone'];

    for (const field of requiredFields) {
      const value = formValue[field];
      if (!value || value === null || typeof value !== 'string') {
        throw new Error(`Invalid or missing required field: ${field}`);
      }
    }

    return {
      companyName: formValue.companyName!,
      businessRegistrationNumber: formValue.businessRegistrationNumber!,
      address: formValue.address!,
      businessPhone: formValue.businessPhone!,
      status: formValue.status || CompanyStatusEnum.Active,
      riskLevel: formValue.riskLevel || RiskLevelEnum.Low,
      fax: formValue.fax || null,
      website: formValue.website || null
    };
  }

  /**
   * 從未知格式的表單值轉換（保留向後相容性）
   */
  fromUnknownFormValue(formValue: Record<string, unknown>): CompanyFormValue {
    return this.validateFormValue(formValue);
  }
}
