// Partner Detail Component Tests - 極簡主義實現
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { signal } from '@angular/core';

import { PartnerDetailComponent } from './partner-detail.component';
import { PartnerFirebaseService } from '../../../infrastructure/repositories/partner-firebase.service';
import { Partner } from '../../../domain/entities/partner.entity';

describe('PartnerDetailComponent', () => {
    let component: PartnerDetailComponent;
    let fixture: ComponentFixture<PartnerDetailComponent>;
    let mockPartnerService: jasmine.SpyObj<PartnerFirebaseService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockRoute: jasmine.SpyObj<ActivatedRoute>;
    let mockModal: jasmine.SpyObj<NzModalService>;
    let mockMessage: jasmine.SpyObj<NzMessageService>;

    const mockPartner: Partner = {
        id: 'partner1',
        companyName: 'Test Company',
        status: 'Active',
        industry: 'Technology',
        joinedDate: new Date('2024-01-01'),
        address: '123 Test St, Test City',
        website: 'https://test.com',
        contacts: [
            {
                id: 'contact1',
                name: 'John Doe',
                email: 'john@test.com',
                role: 'Manager',
                phone: '123-456-7890',
                isPrimary: true
            },
            {
                id: 'contact2',
                name: 'Jane Smith',
                email: 'jane@test.com',
                role: 'Developer',
                phone: '098-765-4321',
                isPrimary: false
            }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
    };

    beforeEach(async () => {
        const partnerServiceSpy = jasmine.createSpyObj('PartnerFirebaseService',
            ['getPartnerById', 'deletePartner']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            snapshot: { paramMap: { get: jasmine.createSpy('get').and.returnValue('partner1') } }
        });
        const modalSpy = jasmine.createSpyObj('NzModalService', ['confirm']);
        const messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

        await TestBed.configureTestingModule({
            imports: [PartnerDetailComponent],
            providers: [
                { provide: PartnerFirebaseService, useValue: partnerServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: routeSpy },
                { provide: NzModalService, useValue: modalSpy },
                { provide: NzMessageService, useValue: messageSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PartnerDetailComponent);
        component = fixture.componentInstance;
        mockPartnerService = TestBed.inject(PartnerFirebaseService) as jasmine.SpyObj<PartnerFirebaseService>;
        mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        mockRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
        mockModal = TestBed.inject(NzModalService) as jasmine.SpyObj<NzModalService>;
        mockMessage = TestBed.inject(NzMessageService) as jasmine.SpyObj<NzMessageService>;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with loading state', () => {
            expect(component.loading()).toBe(false);
            expect(component.partner()).toBeNull();
            expect(component.partnerId()).toBeNull();
        });

        it('should load partner on init with valid ID', async () => {
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(mockPartner));

            await component.ngOnInit();

            expect(component.partnerId()).toBe('partner1');
            expect(component.partner()).toEqual(mockPartner);
            expect(mockPartnerService.getPartnerById).toHaveBeenCalledWith('partner1');
        });

        it('should handle missing partner ID', async () => {
            mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue(null);

            await component.ngOnInit();

            expect(mockMessage.error).toHaveBeenCalledWith('無效的合作夥伴 ID');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners']);
        });
    });

    describe('Data Loading', () => {
        it('should show loading state during data fetch', async () => {
            let resolvePromise: (value: Partner) => void;
            const loadPromise = new Promise<Partner>((resolve) => {
                resolvePromise = resolve;
            });

            mockPartnerService.getPartnerById.and.returnValue(loadPromise);

            const initPromise = component.ngOnInit();

            expect(component.loading()).toBe(true);

            resolvePromise!(mockPartner);
            await initPromise;

            expect(component.loading()).toBe(false);
            expect(component.partner()).toEqual(mockPartner);
        });

        it('should handle partner not found', async () => {
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(null));

            await component.ngOnInit();

            expect(component.partner()).toBeNull();
            expect(mockMessage.error).toHaveBeenCalledWith('找不到指定的合作夥伴');
        });

        it('should handle loading errors', async () => {
            mockPartnerService.getPartnerById.and.returnValue(Promise.reject(new Error('Load failed')));

            await component.ngOnInit();

            expect(component.partner()).toBeNull();
            expect(mockMessage.error).toHaveBeenCalledWith('載入合作夥伴資料失敗');
            expect(component.loading()).toBe(false);
        });
    });

    describe('Navigation Actions', () => {
        beforeEach(async () => {
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(mockPartner));
            await component.ngOnInit();
        });

        it('should navigate to edit partner', () => {
            component.editPartner();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners', 'partner1', 'edit']);
        });

        it('should navigate back to list', () => {
            component.goBack();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners']);
        });

        it('should not navigate to edit if no partner ID', () => {
            component.partnerId.set(null);

            component.editPartner();

            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
    });

    describe('Delete Partner', () => {
        beforeEach(async () => {
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(mockPartner));
            await component.ngOnInit();
        });

        it('should show confirmation modal for delete', () => {
            component.deletePartner();

            expect(mockModal.confirm).toHaveBeenCalledWith(jasmine.objectContaining({
                nzTitle: '確認刪除',
                nzContent: '確定要刪除合作夥伴「Test Company」嗎？此操作無法復原。',
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

            await component.deletePartner();

            expect(mockPartnerService.deletePartner).toHaveBeenCalledWith('partner1');
            expect(mockMessage.success).toHaveBeenCalledWith('合作夥伴已成功刪除');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners']);
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

            await component.deletePartner();

            expect(mockMessage.error).toHaveBeenCalledWith('刪除合作夥伴失敗，請稍後再試');
        });

        it('should not delete if no partner loaded', () => {
            component.partner.set(null);

            component.deletePartner();

            expect(mockModal.confirm).not.toHaveBeenCalled();
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
            const contacts = mockPartner.contacts;
            const primaryContact = component.getPrimaryContact(contacts);

            expect(primaryContact).toBeTruthy();
            expect(primaryContact!.name).toBe('John Doe');
            expect(primaryContact!.isPrimary).toBe(true);
        });

        it('should return first contact if no primary contact', () => {
            const contacts = mockPartner.contacts.map(c => ({ ...c, isPrimary: false }));
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
        beforeEach(async () => {
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(mockPartner));
            await component.ngOnInit();
            fixture.detectChanges();
        });

        it('should display partner information', () => {
            const compiled = fixture.nativeElement;

            expect(compiled.textContent).toContain('Test Company');
            expect(compiled.textContent).toContain('Technology');
            expect(compiled.textContent).toContain('https://test.com');
            expect(compiled.textContent).toContain('123 Test St, Test City');
        });

        it('should display contact information', () => {
            const compiled = fixture.nativeElement;

            expect(compiled.textContent).toContain('John Doe');
            expect(compiled.textContent).toContain('john@test.com');
            expect(compiled.textContent).toContain('Manager');
            expect(compiled.textContent).toContain('123-456-7890');

            expect(compiled.textContent).toContain('Jane Smith');
            expect(compiled.textContent).toContain('jane@test.com');
            expect(compiled.textContent).toContain('Developer');
        });

        it('should show primary contact badge', () => {
            const compiled = fixture.nativeElement;

            expect(compiled.textContent).toContain('主要聯絡人');
        });
    });

    describe('Loading and Error States', () => {
        it('should show loading spinner when loading', async () => {
            component.loading.set(true);
            fixture.detectChanges();

            const compiled = fixture.nativeElement;
            expect(compiled.textContent).toContain('載入中...');
        });

        it('should show empty state when partner not found', async () => {
            component.partner.set(null);
            component.loading.set(false);
            fixture.detectChanges();

            const compiled = fixture.nativeElement;
            expect(compiled.textContent).toContain('找不到指定的合作夥伴');
        });

        it('should show empty state for contacts when no contacts', async () => {
            const partnerWithoutContacts = { ...mockPartner, contacts: [] };
            component.partner.set(partnerWithoutContacts);
            fixture.detectChanges();

            const compiled = fixture.nativeElement;
            expect(compiled.textContent).toContain('尚未新增聯絡人');
        });
    });
});