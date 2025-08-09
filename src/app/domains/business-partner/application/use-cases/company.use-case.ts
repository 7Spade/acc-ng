import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, filter, catchError, throwError } from 'rxjs';

import { Company } from '../../domain/entities/company.entity';
import { Contact } from '../../domain/entities/contact.entity';
import { COMPANY_REPOSITORY } from '../../domain/repositories/company.repository';
import { CompanyStatus } from '../../domain/value-objects/company-status.vo';
import { DynamicWorkflowStateVO } from '../../domain/value-objects/dynamic-workflow-state.vo';
import { UpdateCompanyDto, ContactDto, CompanyResponseDto } from '../dto/company.dto';
import { CompanyNotFoundException } from '../exceptions/company.exceptions';
import { CompanyMapper } from '../mappers/company.mapper';

/**
 * 統一的公司管理用例
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyUseCase {
  private readonly companyRepository = inject(COMPANY_REPOSITORY);
  private readonly companyMapper = inject(CompanyMapper);

  updateCompany(id: string, dto: UpdateCompanyDto): Observable<CompanyResponseDto> {
    return this.getCompanyById(id).pipe(
      map(existingCompany => {
        let dynamicWorkflow: DynamicWorkflowStateVO | undefined = undefined;
        if (dto.dynamicWorkflow) {
          try {
            dynamicWorkflow = DynamicWorkflowStateVO.fromPlainObject(dto.dynamicWorkflow);
          } catch (error) {
            console.warn('Failed to parse dynamic workflow data:', error);
          }
        }

        const updatedCompany = existingCompany.update({
          companyName: dto.companyName,
          businessRegistrationNumber: dto.businessRegistrationNumber,
          address: dto.address,
          businessPhone: dto.businessPhone,
          fax: dto.fax,
          website: dto.website,
          status: dto.status ? CompanyStatus.create(dto.status).value : existingCompany.status
        });

        return updatedCompany;
      }),
      switchMap(company => this.companyRepository.update(company)),
      map(updatedCompany => this.companyMapper.toResponseDto(updatedCompany)),
      catchError(this.handleError(id))
    );
  }

  addContact(companyId: string, contactDto: ContactDto): Observable<CompanyResponseDto> {
    return this.getCompanyById(companyId).pipe(
      map(existingCompany => {
        const newContact = Contact.create({
          name: contactDto.name,
          title: contactDto.title,
          email: contactDto.email,
          phone: contactDto.phone,
          isPrimary: contactDto.isPrimary
        });
        return existingCompany.addContact(newContact);
      }),
      switchMap(company => this.companyRepository.update(company)),
      map(updatedCompany => this.companyMapper.toResponseDto(updatedCompany)),
      catchError(this.handleError(companyId))
    );
  }

  updateContact(companyId: string, contactIndex: number, contactDto: ContactDto): Observable<CompanyResponseDto> {
    return this.getCompanyById(companyId).pipe(
      map(existingCompany => {
        const updatedContact = Contact.create({
          name: contactDto.name,
          title: contactDto.title,
          email: contactDto.email,
          phone: contactDto.phone,
          isPrimary: contactDto.isPrimary
        });
        return existingCompany.updateContact(contactIndex, updatedContact);
      }),
      switchMap(company => this.companyRepository.update(company)),
      map(updatedCompany => this.companyMapper.toResponseDto(updatedCompany)),
      catchError(this.handleError(companyId))
    );
  }

  removeContact(companyId: string, contactIndex: number): Observable<CompanyResponseDto> {
    return this.getCompanyById(companyId).pipe(
      map(existingCompany => existingCompany.removeContact(contactIndex)),
      switchMap(company => this.companyRepository.update(company)),
      map(updatedCompany => this.companyMapper.toResponseDto(updatedCompany)),
      catchError(this.handleError(companyId))
    );
  }

  private getCompanyById(id: string): Observable<Company> {
    return this.companyRepository.getById(id).pipe(filter((existingCompany): existingCompany is Company => existingCompany !== null));
  }

  private handleError(id: string) {
    return (error: any) => {
      if (error instanceof CompanyNotFoundException) {
        return throwError(() => error);
      }
      return throwError(() => new CompanyNotFoundException(id));
    };
  }
}
