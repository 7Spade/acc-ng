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
      joinedDate: new Date('2024-01-01'),
      contacts: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@test.com',
          role: 'Manager',
          isPrimary: true
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      companyName: 'Another Company',
      status: 'Inactive',
      industry: 'Finance',
      joinedDate: new Date('2024-01-02'),
      contacts: [
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@another.com',
          role: 'Director',
          isPrimary: true
        }
      ],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
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

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty search and filter', () => {
      expect(component.searchTerm()).toBe('');
      expect(component.statusFilter()).toBeNull();
    });

    it('should load partners from service', () => {
      const partners = component.filteredPartners();
      expect(partners.length).toBe(2);
      expect(partners[0].companyName).toBe('Test Company 1');
      expect(partners[1].companyName).toBe('Another Company');
    });
  });

  describe('Search and Filtering', () => {
    it('should filter partners based on company name search', () => {
      component.searchTerm.set('Test Company');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].companyName).toBe('Test Company 1');
    });

    it('should filter partners based on industry search', () => {
      component.searchTerm.set('Technology');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].industry).toBe('Technology');
    });

    it('should filter partners based on contact name search', () => {
      component.searchTerm.set('John Doe');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].contacts[0].name).toBe('John Doe');
    });

    it('should filter partners based on contact email search', () => {
      component.searchTerm.set('jane@another.com');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].contacts[0].email).toBe('jane@another.com');
    });

    it('should filter partners by status', () => {
      component.statusFilter.set('Active');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe('Active');
    });

    it('should combine search and status filters', () => {
      component.searchTerm.set('Company');
      component.statusFilter.set('Active');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].companyName).toBe('Test Company 1');
      expect(filtered[0].status).toBe('Active');
    });

    it('should return empty array when no matches', () => {
      component.searchTerm.set('NonExistent');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(0);
    });

    it('should be case insensitive', () => {
      component.searchTerm.set('test company');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].companyName).toBe('Test Company 1');
    });

    it('should handle empty search term', () => {
      component.searchTerm.set('');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(2);
    });

    it('should handle whitespace in search term', () => {
      component.searchTerm.set('  Test Company  ');
      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].companyName).toBe('Test Company 1');
    });
  });

  describe('Navigation Actions', () => {
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
  });

  describe('Delete Partner', () => {
    const partnerToDelete = mockPartners[0];

    it('should show confirmation modal for delete', () => {
      component.deletePartner(partnerToDelete);

      expect(mockModal.confirm).toHaveBeenCalledWith(jasmine.objectContaining({
        nzTitle: '確認刪除',
        nzContent: '確定要刪除合作夥伴「Test Company 1」嗎？此操作無法復原。',
        nzOkText: '刪除',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzCancelText: '取消'
      }));
    });

    it('should delete partner successfully when confirmed', async () => {
      mockPartnerService.deletePartner.and.returnValue(Promise.resolve());

      // Mock the modal confirm to immediately call the onOk callback
      mockModal.confirm.and.callFake((config: any) => {
        if (config.nzOnOk) {
          return config.nzOnOk();
        }
        return Promise.resolve();
      });

      await component.deletePartner(partnerToDelete);

      expect(mockPartnerService.deletePartner).toHaveBeenCalledWith('1');
      expect(mockMessage.success).toHaveBeenCalledWith('合作夥伴已成功刪除');
    });

    it('should handle delete errors', async () => {
      mockPartnerService.deletePartner.and.returnValue(Promise.reject(new Error('Delete failed')));

      // Mock the modal confirm to immediately call the onOk callback
      mockModal.confirm.and.callFake((config: any) => {
        if (config.nzOnOk) {
          return config.nzOnOk();
        }
        return Promise.resolve();
      });

      await component.deletePartner(partnerToDelete);

      expect(mockMessage.error).toHaveBeenCalledWith('刪除合作夥伴失敗，請稍後再試');
    });
  });

  describe('Utility Methods', () => {
    it('should get correct status color', () => {
      expect(component.getStatusColor('Active')).toBe('green');
      expect(component.getStatusColor('Inactive')).toBe('red');
      expect(component.getStatusColor('Pending')).toBe('orange');
      expect(component.getStatusColor('Unknown')).toBe('default');
    });

    it('should get correct status text', () => {
      expect(component.getStatusText('Active')).toBe('活躍');
      expect(component.getStatusText('Inactive')).toBe('非活躍');
      expect(component.getStatusText('Pending')).toBe('待審核');
      expect(component.getStatusText('Unknown')).toBe('Unknown');
    });

    it('should get primary contact', () => {
      const contacts = mockPartners[0].contacts;
      const primaryContact = component.getPrimaryContact(contacts);

      expect(primaryContact).toBeTruthy();
      expect(primaryContact!.name).toBe('John Doe');
      expect(primaryContact!.isPrimary).toBe(true);
    });

    it('should return first contact if no primary contact', () => {
      const contacts = mockPartners[0].contacts.map(c => ({ ...c, isPrimary: false }));
      const primaryContact = component.getPrimaryContact(contacts);

      expect(primaryContact).toBeTruthy();
      expect(primaryContact!.name).toBe('John Doe');
    });

    it('should return null for empty contacts', () => {
      const primaryContact = component.getPrimaryContact([]);

      expect(primaryContact).toBeNull();
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display partner information in table', () => {
      const compiled = fixture.nativeElement;

      expect(compiled.textContent).toContain('Test Company 1');
      expect(compiled.textContent).toContain('Technology');
      expect(compiled.textContent).toContain('John Doe');
      expect(compiled.textContent).toContain('john@test.com');
    });

    it('should show empty state when no partners match filter', () => {
      component.searchTerm.set('NonExistent');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('沒有找到符合條件的合作夥伴');
    });

    it('should show empty state when no partners exist', () => {
      mockPartnerService.getPartnersSignal.and.returnValue(signal([]));
      component.searchTerm.set('');
      component.statusFilter.set(null);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('尚未新增任何合作夥伴');
    });
  });

  describe('Signal Reactivity', () => {
    it('should update filtered partners when search term changes', () => {
      expect(component.filteredPartners().length).toBe(2);

      component.searchTerm.set('Test');
      expect(component.filteredPartners().length).toBe(1);

      component.searchTerm.set('');
      expect(component.filteredPartners().length).toBe(2);
    });

    it('should update filtered partners when status filter changes', () => {
      expect(component.filteredPartners().length).toBe(2);

      component.statusFilter.set('Active');
      expect(component.filteredPartners().length).toBe(1);

      component.statusFilter.set(null);
      expect(component.filteredPartners().length).toBe(2);
    });
  });

  describe('Data Loading States', () => {
    it('should handle empty partners list', () => {
      mockPartnerService.getPartnersSignal.and.returnValue(signal([]));

      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(0);
    });

    it('should handle partners with no contacts', () => {
      const partnersWithoutContacts = [{
        ...mockPartners[0],
        contacts: []
      }];

      mockPartnerService.getPartnersSignal.and.returnValue(signal(partnersWithoutContacts));

      const filtered = component.filteredPartners();
      expect(filtered.length).toBe(1);
      expect(filtered[0].contacts.length).toBe(0);
    });
  });
});