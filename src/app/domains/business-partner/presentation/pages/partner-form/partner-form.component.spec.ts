// Partner Form Component Tests - 極簡主義實現
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { PartnerFormComponent } from './partner-form.component';
import { PartnerFirebaseService } from '../../../infrastructure/repositories/partner-firebase.service';
import { Partner } from '../../../domain/entities/partner.entity';

describe('PartnerFormComponent', () => {
    let component: PartnerFormComponent;
    let fixture: ComponentFixture<PartnerFormComponent>;
    let mockPartnerService: jasmine.SpyObj<PartnerFirebaseService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockRoute: jasmine.SpyObj<ActivatedRoute>;
    let mockMessage: jasmine.SpyObj<NzMessageService>;

    const mockPartner: Partner = {
        id: 'partner1',
        companyName: 'Test Company',
        status: 'Active',
        industry: 'Technology',
        joinedDate: new Date(),
        address: '123 Test St',
        website: 'https://test.com',
        contacts: [
            {
                id: 'contact1',
                name: 'John Doe',
                email: 'john@test.com',
                role: 'Manager',
                phone: '123-456-7890',
                isPrimary: true
            }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(async () => {
        const partnerServiceSpy = jasmine.createSpyObj('PartnerFirebaseService',
            ['createPartner', 'updatePartner', 'getPartnerById']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            snapshot: { paramMap: { get: jasmine.createSpy('get').and.returnValue(null) } }
        });
        const messageSpy = jasmine.createSpyObj('NzMessageService',
            ['success', 'error', 'warning']);

        await TestBed.configureTestingModule({
            imports: [
                PartnerFormComponent,
                ReactiveFormsModule
            ],
            providers: [
                FormBuilder,
                { provide: PartnerFirebaseService, useValue: partnerServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: routeSpy },
                { provide: NzMessageService, useValue: messageSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PartnerFormComponent);
        component = fixture.componentInstance;
        mockPartnerService = TestBed.inject(PartnerFirebaseService) as jasmine.SpyObj<PartnerFirebaseService>;
        mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        mockRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
        mockMessage = TestBed.inject(NzMessageService) as jasmine.SpyObj<NzMessageService>;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize in create mode by default', () => {
            component.ngOnInit();
            expect(component.isEdit()).toBe(false);
            expect(component.partnerId()).toBeNull();
        });

        it('should initialize form with one contact', () => {
            expect(component.contactsArray.length).toBe(1);
            expect(component.form.get('companyName')?.value).toBe('');
            expect(component.form.get('industry')?.value).toBe('');
        });

        it('should initialize in edit mode when partner ID is provided', async () => {
            mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('partner1');
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(mockPartner));

            await component.ngOnInit();

            expect(component.isEdit()).toBe(true);
            expect(component.partnerId()).toBe('partner1');
        });
    });

    describe('Form Validation', () => {
        it('should validate required fields', () => {
            const form = component.form;

            expect(form.get('companyName')?.hasError('required')).toBe(true);
            expect(form.get('industry')?.hasError('required')).toBe(true);

            form.patchValue({
                companyName: 'Test Company',
                industry: 'Technology'
            });

            expect(form.get('companyName')?.hasError('required')).toBe(false);
            expect(form.get('industry')?.hasError('required')).toBe(false);
        });

        it('should validate company name length', () => {
            const companyNameControl = component.form.get('companyName');

            companyNameControl?.setValue('A'); // Too short
            expect(companyNameControl?.hasError('minlength')).toBe(true);

            companyNameControl?.setValue('A'.repeat(101)); // Too long
            expect(companyNameControl?.hasError('maxlength')).toBe(true);

            companyNameControl?.setValue('Valid Company Name');
            expect(companyNameControl?.valid).toBe(true);
        });

        it('should validate contact fields', () => {
            const contactGroup = component.contactsArray.at(0);

            expect(contactGroup.get('name')?.hasError('required')).toBe(true);
            expect(contactGroup.get('email')?.hasError('required')).toBe(true);
            expect(contactGroup.get('role')?.hasError('required')).toBe(true);

            contactGroup.patchValue({
                name: 'John Doe',
                email: 'invalid-email',
                role: 'Manager'
            });

            expect(contactGroup.get('email')?.hasError('email')).toBe(true);

            contactGroup.patchValue({
                email: 'john@test.com'
            });

            expect(contactGroup.get('email')?.valid).toBe(true);
        });
    });

    describe('Contact Management', () => {
        it('should add new contact', () => {
            const initialLength = component.contactsArray.length;

            component.addContact();

            expect(component.contactsArray.length).toBe(initialLength + 1);
        });

        it('should not add contact if at maximum limit', () => {
            // Add contacts up to the limit
            while (component.contactsArray.length < component.maxContacts) {
                component.addContact();
            }

            const maxLength = component.contactsArray.length;
            component.addContact();

            expect(component.contactsArray.length).toBe(maxLength);
        });

        it('should remove contact', () => {
            component.addContact(); // Add second contact
            const initialLength = component.contactsArray.length;

            component.removeContact(1);

            expect(component.contactsArray.length).toBe(initialLength - 1);
        });

        it('should not remove last contact', () => {
            component.removeContact(0);

            expect(component.contactsArray.length).toBe(1);
            expect(mockMessage.warning).toHaveBeenCalledWith('至少需要保留一個聯絡人');
        });
    });

    describe('Form Submission - Create Mode', () => {
        beforeEach(() => {
            component.form.patchValue({
                companyName: 'Test Company',
                industry: 'Technology',
                website: 'https://test.com',
                address: '123 Test St'
            });

            component.contactsArray.at(0).patchValue({
                name: 'John Doe',
                email: 'john@test.com',
                role: 'Manager',
                phone: '123-456-7890',
                isPrimary: true
            });
        });

        it('should create partner successfully', async () => {
            mockPartnerService.createPartner.and.returnValue(Promise.resolve('new-partner-id'));

            await component.onSubmit();

            expect(mockPartnerService.createPartner).toHaveBeenCalled();
            expect(mockMessage.success).toHaveBeenCalledWith('合作夥伴已成功建立');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners']);
        });

        it('should handle creation errors', async () => {
            mockPartnerService.createPartner.and.returnValue(Promise.reject(new Error('Creation failed')));

            await component.onSubmit();

            expect(mockMessage.error).toHaveBeenCalledWith('建立合作夥伴失敗');
            expect(component.loading()).toBe(false);
        });

        it('should not submit invalid form', async () => {
            component.form.patchValue({
                companyName: '', // Invalid
                industry: 'Technology'
            });

            await component.onSubmit();

            expect(mockPartnerService.createPartner).not.toHaveBeenCalled();
            expect(mockMessage.warning).toHaveBeenCalledWith('請檢查表單內容並修正錯誤');
        });

        it('should set first contact as primary if none specified', async () => {
            component.contactsArray.at(0).patchValue({
                isPrimary: false
            });

            mockPartnerService.createPartner.and.returnValue(Promise.resolve('new-partner-id'));

            await component.onSubmit();

            const createCall = mockPartnerService.createPartner.calls.mostRecent();
            const createData = createCall.args[0];
            expect(createData.contacts[0].isPrimary).toBe(true);
        });
    });

    describe('Form Submission - Edit Mode', () => {
        beforeEach(async () => {
            mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('partner1');
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(mockPartner));

            await component.ngOnInit();

            component.form.patchValue({
                companyName: 'Updated Company'
            });
        });

        it('should update partner successfully', async () => {
            mockPartnerService.updatePartner.and.returnValue(Promise.resolve());

            await component.onSubmit();

            expect(mockPartnerService.updatePartner).toHaveBeenCalledWith('partner1', jasmine.any(Object));
            expect(mockMessage.success).toHaveBeenCalledWith('合作夥伴已成功更新');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners']);
        });

        it('should handle update errors', async () => {
            mockPartnerService.updatePartner.and.returnValue(Promise.reject(new Error('Update failed')));

            await component.onSubmit();

            expect(mockMessage.error).toHaveBeenCalledWith('更新合作夥伴失敗');
            expect(component.loading()).toBe(false);
        });
    });

    describe('Data Loading - Edit Mode', () => {
        it('should load partner data and populate form', async () => {
            mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('partner1');
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(mockPartner));

            await component.ngOnInit();

            expect(component.form.get('companyName')?.value).toBe('Test Company');
            expect(component.form.get('industry')?.value).toBe('Technology');
            expect(component.form.get('website')?.value).toBe('https://test.com');
            expect(component.form.get('address')?.value).toBe('123 Test St');

            expect(component.contactsArray.length).toBe(1);
            expect(component.contactsArray.at(0).get('name')?.value).toBe('John Doe');
            expect(component.contactsArray.at(0).get('email')?.value).toBe('john@test.com');
        });

        it('should handle partner not found', async () => {
            mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('nonexistent');
            mockPartnerService.getPartnerById.and.returnValue(Promise.resolve(null));

            await component.ngOnInit();

            expect(mockMessage.error).toHaveBeenCalledWith('找不到指定的合作夥伴');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners']);
        });

        it('should handle loading errors', async () => {
            mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('partner1');
            mockPartnerService.getPartnerById.and.returnValue(Promise.reject(new Error('Load failed')));

            await component.ngOnInit();

            expect(mockMessage.error).toHaveBeenCalledWith('載入合作夥伴資料失敗');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners']);
        });
    });

    describe('Navigation', () => {
        it('should cancel and navigate back', () => {
            component.cancel();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/business-partners']);
        });
    });

    describe('Error Messages', () => {
        it('should return appropriate contacts error tip', () => {
            const contactsControl = component.form.get('contacts');
            contactsControl?.setErrors({ required: true });

            const errorTip = component.getContactsErrorTip();

            expect(errorTip).toBe('至少需要一個聯絡人');
        });

        it('should return empty string when no contacts errors', () => {
            const errorTip = component.getContactsErrorTip();

            expect(errorTip).toBe('');
        });
    });

    describe('Loading States', () => {
        it('should show loading during form submission', async () => {
            component.form.patchValue({
                companyName: 'Test Company',
                industry: 'Technology'
            });

            component.contactsArray.at(0).patchValue({
                name: 'John Doe',
                email: 'john@test.com',
                role: 'Manager',
                isPrimary: true
            });

            let resolveCreate: (value: string) => void;
            const createPromise = new Promise<string>((resolve) => {
                resolveCreate = resolve;
            });

            mockPartnerService.createPartner.and.returnValue(createPromise);

            const submitPromise = component.onSubmit();

            expect(component.loading()).toBe(true);

            resolveCreate!('new-partner-id');
            await submitPromise;

            expect(component.loading()).toBe(false);
        });
    });
});