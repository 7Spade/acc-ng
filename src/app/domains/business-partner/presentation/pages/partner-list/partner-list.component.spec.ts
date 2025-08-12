// Partner List Component Tests - 極簡主義實現
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { signal } from '@angular/core';

import { PartnerListComponent } from './partner-list.component';
import { PartnerFirebaseService } from '../../../infrastructure/repositories/partner-firebase.service';
import { Partner } from '../../../domain/entities/partner.entity';

describe('PartnerListComponent', () => {
  let component: PartnerListComponent;
  let fixture: ComponentFixture<PartnerListComponent>;
  let mockPartnerService: jasmine.SpyObj<PartnerFirebaseService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockModal: jasmine.SpyObj<NzModalService>;
  let mockMessage: jasmine.SpyObj<NzMessageService>;

  const mockPartners: Partner[] = [
    {
      id: '1',
      companyName: 'Test Company 1',
      status: 'Active',
      industry: 'Technology',
      joinedDate: new Date(),
      contacts: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@test.com',
          role: 'Manager',
          isPrimary: true
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    const partnerServiceSpy = jasmine.createSpyObj('PartnerFirebaseService', 
      ['getPartnersSignal', 'deletePartner']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const modalSpy = jasmine.createSpyObj('NzModalService', ['confirm']);
    const messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    // Mock the signal
    partnerServiceSpy.getPartnersSignal.and.returnValue(signal(mockPartners));

    await TestBed.configureTestingModule({
      imports: [PartnerListComponent],
      providers: [
        { provide: PartnerFirebaseService, useValue: partnerServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NzModalService, useValue: modalSpy },
        { provide: NzMessageService, useValue: messageSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerListComponent);
    component = fixture.componentInstance;
    mockPartnerService = TestBed.inject(PartnerFirebaseService) as jasmine.SpyObj<PartnerFirebaseService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockModal = TestBed.inject(NzModalService) as jasmine.SpyObj<NzModalService>;
    mockMessage = TestBed.inject(NzMessageService) as jasmine.SpyObj<NzMessageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search and filter', () => {
    expect(component.searchTerm()).toBe('');
    expect(component.statusFilter()).toBeNull();
  });

  it('should filter partners based on search term', () => {
    component.searchTerm.set('Test Company');
    const filtered = component.filteredPartners();
    expect(filtered.length).toBe(1);
    expect(filtered[0].companyName).toBe('Test Company 1');
  });

  it('should navigate to create partner page', () => {
    component.createPartner();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners/create']);
  });

  it('should navigate to partner detail page', () => {
    component.viewPartner('123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners', '123']);
  });

  it('should navigate to edit partner page', () => {
    component.editPartner('123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners', '123', 'edit']);
  });

  it('should get correct status color', () => {
    expect(component.getStatusColor('Active')).toBe('green');
    expect(component.getStatusColor('Inactive')).toBe('red');
    expect(component.getStatusColor('Pending')).toBe('orange');
  });

  it('should get correct status text', () => {
    expect(component.getStatusText('Active')).toBe('活躍');
    expect(component.getStatusText('Inactive')).toBe('非活躍');
    expect(component.getStatusText('Pending')).toBe('待審核');
  });
});