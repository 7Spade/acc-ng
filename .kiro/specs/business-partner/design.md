# Business Partner Management - Design Document

## Overview

The Business Partner Management feature implements a comprehensive partner directory system using Angular 20 with DDD architecture. The design leverages ng-zorro-antd components for consistent UI, standalone components with signals for modern Angular patterns, and Firebase for data persistence. The system follows minimalist design principles, avoiding over-engineering while providing robust business partner management capabilities.

## Architecture

### Domain-Driven Design Structure

```
src/app/domains/business-partner/
├── domain/                     # Core business logic
│   ├── entities/              # Business entities
│   ├── value-objects/         # Immutable value objects
│   ├── repositories/          # Repository interfaces
│   ├── services/              # Domain services
│   ├── events/                # Domain events
│   └── exceptions/            # Domain-specific exceptions
├── application/               # Application orchestration
│   ├── use-cases/             # Business use cases
│   ├── dto/                   # Data transfer objects
│   │   ├── commands/          # Command DTOs
│   │   ├── queries/           # Query DTOs
│   │   └── responses/         # Response DTOs
│   └── services/              # Application services
├── infrastructure/            # External concerns
│   ├── repositories/          # Repository implementations
│   ├── mappers/               # Data mapping
│   └── adapters/              # External service adapters
└── presentation/              # UI layer
    ├── components/            # Reusable components
    ├── pages/                 # Route pages
    └── business-partner.routes.ts
```

### Technology Stack

- **Angular 20**: Standalone components, signals for reactive state, OnPush change detection
- **@angular/fire**: Official Angular Firebase library for all Firebase interactions
- **ng-zorro-antd**: UI component library (nz-table, nz-form, nz-card, nz-button)
- **Signals**: Primary state management to minimize boilerplate code
- **TypeScript**: Strong typing and modern language features

### Minimalist Design Principles

1. **Signals-First Approach**: Use signals for all reactive state to eliminate complex RxJS chains
2. **Direct Firebase Integration**: Use @angular/fire services directly in components when appropriate
3. **Minimal Abstractions**: Avoid unnecessary service layers when direct Firebase calls suffice
4. **Component-Centric**: Keep business logic close to components using signals and computed values
5. **ng-zorro Components**: Leverage existing UI components instead of custom implementations

## Components and Interfaces

### Domain Layer

#### Entities

**Partner Entity**
```typescript
export class Partner extends BaseAggregateRoot<PartnerId> {
  private constructor(
    id: PartnerId,
    private _companyName: CompanyName,
    private _status: PartnerStatus,
    private _industry: Industry,
    private _joinedDate: Date,
    private _contacts: Contact[],
    private _address?: Address,
    private _website?: Website,
    private _logoUrl?: string
  ) {
    super(id);
  }

  static create(data: CreatePartnerData): Partner;
  changeStatus(newStatus: PartnerStatus): void;
  addContact(contact: Contact): void;
  removeContact(contactId: ContactId): void;
  updateCompanyInfo(info: CompanyInfo): void;
  getPrimaryContact(): Contact | null;
}
```

**Contact Entity**
```typescript
export class Contact extends BaseEntity<ContactId> {
  private constructor(
    id: ContactId,
    private _name: PersonName,
    private _role: ContactRole,
    private _email: Email,
    private _phone?: Phone,
    private _isPrimary: boolean = false,
    private _avatarUrl?: string
  ) {
    super(id);
  }

  static create(data: CreateContactData): Contact;
  markAsPrimary(): void;
  updateContactInfo(info: ContactInfo): void;
}
```

#### Value Objects

**PartnerId, ContactId**: Unique identifiers
**CompanyName**: Company name with validation
**Email**: Email address with format validation
**PartnerStatus**: Enum (Active, Inactive, Pending)
**Industry**: Industry classification
**PersonName**: Person name with validation
**ContactRole**: Contact role/title

#### Repository Interfaces

```typescript
export interface PartnerRepository {
  save(partner: Partner): Promise<void>;
  findById(id: PartnerId): Promise<Partner | null>;
  findAll(criteria?: PartnerSearchCriteria): Promise<Partner[]>;
  findByCompanyName(name: CompanyName): Promise<Partner | null>;
  delete(id: PartnerId): Promise<void>;
  count(criteria?: PartnerSearchCriteria): Promise<number>;
}
```

### Application Layer

#### Use Cases

**CreatePartnerUseCase**
```typescript
@Injectable()
export class CreatePartnerUseCase {
  async execute(command: CreatePartnerCommand): Promise<CreatePartnerResponse> {
    // Validate business rules
    // Create partner entity
    // Save to repository
    // Publish domain events
    // Return response
  }
}
```

**GetPartnersUseCase**
```typescript
@Injectable()
export class GetPartnersUseCase {
  async execute(query: GetPartnersQuery): Promise<GetPartnersResponse> {
    // Apply search criteria
    // Retrieve partners from repository
    // Map to response DTOs
    // Return paginated results
  }
}
```

#### DTOs

**Commands**
- CreatePartnerCommand
- UpdatePartnerCommand
- DeletePartnerCommand
- ChangePartnerStatusCommand

**Queries**
- GetPartnersQuery
- GetPartnerByIdQuery
- SearchPartnersQuery

**Responses**
- PartnerResponse
- PartnerListResponse
- CreatePartnerResponse

### Infrastructure Layer

#### Simplified Firebase Service

```typescript
@Injectable()
export class PartnerFirebaseService {
  private partnersCollection = collection(this.firestore, 'partners');

  constructor(private firestore: Firestore) {}

  // Direct Firebase operations with minimal abstraction
  async createPartner(partnerData: CreatePartnerData): Promise<string> {
    const docRef = await addDoc(this.partnersCollection, {
      ...partnerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  // Signal-based real-time data
  getPartners(): Signal<Partner[]> {
    return toSignal(
      collectionData(this.partnersCollection, { idField: 'id' }) as Observable<Partner[]>,
      { initialValue: [] }
    );
  }

  // Filtered partners using computed signals
  getFilteredPartners(searchTerm: Signal<string>, statusFilter: Signal<string | null>): Signal<Partner[]> {
    const allPartners = this.getPartners();
    
    return computed(() => {
      const partners = allPartners();
      const search = searchTerm().toLowerCase();
      const status = statusFilter();

      return partners.filter(partner => {
        const matchesSearch = !search || 
          partner.companyName.toLowerCase().includes(search) ||
          partner.industry.toLowerCase().includes(search);
        
        const matchesStatus = !status || partner.status === status;
        
        return matchesSearch && matchesStatus;
      });
    });
  }

  async updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
    const docRef = doc(this.firestore, 'partners', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async deletePartner(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'partners', id);
    await deleteDoc(docRef);
  }
}
```

### Presentation Layer

#### Components

**PartnerListComponent (極簡主義 + Signals)**
```typescript
@Component({
  selector: 'app-partner-list',
  template: `
    <nz-card nzTitle="Partner Directory">
      <div class="search-controls mb-4">
        <nz-input-group nzPrefixIcon="search" class="mb-2">
          <input nz-input 
                 placeholder="Search partners..." 
                 [ngModel]="searchTerm()"
                 (ngModelChange)="searchTerm.set($event)">
        </nz-input-group>
        
        <nz-select nzPlaceHolder="Filter by status" 
                   nzAllowClear
                   [ngModel]="statusFilter()"
                   (ngModelChange)="statusFilter.set($event)">
          <nz-option nzValue="Active" nzLabel="Active"></nz-option>
          <nz-option nzValue="Inactive" nzLabel="Inactive"></nz-option>
          <nz-option nzValue="Pending" nzLabel="Pending"></nz-option>
        </nz-select>
        
        <button nz-button nzType="primary" (click)="router.navigate(['/partners/create'])">
          <nz-icon nzType="plus"></nz-icon>
          Add Partner
        </button>
      </div>

      <nz-table [nzData]="filteredPartners()" 
                [nzPageSize]="10"
                [nzShowPagination]="true">
        <thead>
          <tr>
            <th>Company</th>
            <th>Primary Contact</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let partner of filteredPartners()" 
              (click)="viewPartner(partner.id)"
              class="cursor-pointer hover:bg-gray-50">
            <td>
              <div>
                <div class="font-medium">{{ partner.companyName }}</div>
                <div class="text-gray-500 text-sm">{{ partner.industry }}</div>
              </div>
            </td>
            <td>
              @if (partner.primaryContact) {
                <div>
                  <div class="font-medium">{{ partner.primaryContact.name }}</div>
                  <div class="text-gray-500 text-sm">{{ partner.primaryContact.email }}</div>
                </div>
              } @else {
                <span class="text-gray-400">No contact</span>
              }
            </td>
            <td>
              <nz-tag [nzColor]="getStatusColor(partner.status)">
                {{ partner.status }}
              </nz-tag>
            </td>
            <td>{{ partner.joinedDate | date }}</td>
            <td (click)="$event.stopPropagation()">
              <nz-dropdown [nzTrigger]="'click'">
                <button nz-button nzType="text" nz-dropdown>
                  <nz-icon nzType="more"></nz-icon>
                </button>
                <ul nz-menu>
                  <li nz-menu-item (click)="editPartner(partner.id)">
                    <nz-icon nzType="edit"></nz-icon>
                    Edit
                  </li>
                  <li nz-menu-item (click)="deletePartner(partner)">
                    <nz-icon nzType="delete" class="text-red-500"></nz-icon>
                    Delete
                  </li>
                </ul>
              </nz-dropdown>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NzCardModule, NzTableModule, NzInputModule, NzSelectModule,
    NzTagModule, NzButtonModule, NzDropdownModule, NzIconModule,
    CommonModule, FormsModule, DatePipe
  ]
})
export class PartnerListComponent {
  // Signals for reactive state
  searchTerm = signal('');
  statusFilter = signal<string | null>(null);

  // Direct Firebase data through signals
  private allPartners = this.partnerService.getPartners();
  
  // Computed filtered partners - automatically updates when filters change
  filteredPartners = computed(() => {
    const partners = this.allPartners();
    const search = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    return partners.filter(partner => {
      const matchesSearch = !search || 
        partner.companyName.toLowerCase().includes(search) ||
        partner.industry.toLowerCase().includes(search);
      
      const matchesStatus = !status || partner.status === status;
      
      return matchesSearch && matchesStatus;
    });
  });

  constructor(
    private partnerService: PartnerFirebaseService,
    public router: Router,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  viewPartner(id: string) {
    this.router.navigate(['/partners', id]);
  }

  editPartner(id: string) {
    this.router.navigate(['/partners', id, 'edit']);
  }

  deletePartner(partner: Partner) {
    this.modal.confirm({
      nzTitle: 'Delete Partner',
      nzContent: `Are you sure you want to delete ${partner.companyName}?`,
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await this.partnerService.deletePartner(partner.id);
          this.message.success('Partner deleted successfully');
        } catch (error) {
          this.message.error('Failed to delete partner');
        }
      }
    });
  }

  getStatusColor(status: string): string {
    const colors = {
      'Active': 'green',
      'Inactive': 'red',
      'Pending': 'orange'
    };
    return colors[status] || 'default';
  }
}
```

**PartnerFormComponent (極簡主義 + Signals)**
```typescript
@Component({
  selector: 'app-partner-form',
  template: `
    <nz-card [nzTitle]="isEdit() ? 'Edit Partner' : 'Create Partner'">
      <form nz-form [formGroup]="form" (ngSubmit)="onSubmit()">
        <nz-form-item>
          <nz-form-label nzRequired>Company Name</nz-form-label>
          <nz-form-control nzErrorTip="Please enter company name">
            <input nz-input formControlName="companyName" placeholder="Enter company name">
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Industry</nz-form-label>
          <nz-form-control>
            <nz-select formControlName="industry" nzPlaceHolder="Select industry">
              @for (industry of industries; track industry) {
                <nz-option [nzValue]="industry" [nzLabel]="industry"></nz-option>
              }
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>Website</nz-form-label>
          <nz-form-control>
            <input nz-input formControlName="website" placeholder="https://example.com">
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>Address</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="address" rows="3" placeholder="Company address"></textarea>
          </nz-form-control>
        </nz-form-item>

        <!-- Simplified Contacts Section -->
        <nz-form-item>
          <nz-form-label nzRequired>Contacts</nz-form-label>
          <nz-form-control>
            <div formArrayName="contacts" class="space-y-4">
              @for (contact of contactsArray.controls; track $index; let i = $index) {
                <nz-card nzSize="small" [formGroupName]="i">
                  <div class="grid grid-cols-2 gap-4">
                    <nz-form-item>
                      <nz-form-control>
                        <input nz-input formControlName="name" placeholder="Contact name">
                      </nz-form-control>
                    </nz-form-item>
                    
                    <nz-form-item>
                      <nz-form-control>
                        <input nz-input formControlName="email" placeholder="Email" type="email">
                      </nz-form-control>
                    </nz-form-item>
                    
                    <nz-form-item>
                      <nz-form-control>
                        <input nz-input formControlName="role" placeholder="Role/Title">
                      </nz-form-control>
                    </nz-form-item>
                    
                    <nz-form-item>
                      <nz-form-control>
                        <input nz-input formControlName="phone" placeholder="Phone (optional)">
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  
                  <div class="flex justify-between items-center mt-4">
                    <label nz-checkbox formControlName="isPrimary">Primary Contact</label>
                    <button nz-button nzType="text" nzDanger (click)="removeContact(i)" type="button">
                      <nz-icon nzType="delete"></nz-icon>
                      Remove
                    </button>
                  </div>
                </nz-card>
              }
            </div>
            
            <button nz-button nzType="dashed" (click)="addContact()" type="button" class="w-full mt-4">
              <nz-icon nzType="plus"></nz-icon>
              Add Contact
            </button>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-control>
            <button nz-button nzType="primary" [nzLoading]="loading()" [disabled]="form.invalid">
              {{ isEdit() ? 'Update' : 'Create' }} Partner
            </button>
            <button nz-button type="button" (click)="cancel()" class="ml-2">
              Cancel
            </button>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule, NzCardModule, NzFormModule, NzInputModule,
    NzSelectModule, NzButtonModule, NzCheckboxModule, NzIconModule,
    CommonModule
  ]
})
export class PartnerFormComponent implements OnInit {
  // Signals for state management
  loading = signal(false);
  isEdit = signal(false);
  partnerId = signal<string | null>(null);

  // Static data
  industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education'];

  // Reactive form
  form = this.fb.group({
    companyName: ['', Validators.required],
    industry: ['', Validators.required],
    website: [''],
    address: [''],
    contacts: this.fb.array([this.createContactForm()]) // Start with one contact
  });

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerFirebaseService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {}

  async ngOnInit() {
    // Check if editing existing partner
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.partnerId.set(id);
      await this.loadPartner(id);
    }
  }

  get contactsArray() {
    return this.form.get('contacts') as FormArray;
  }

  private createContactForm() {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      phone: [''],
      isPrimary: [false]
    });
  }

  addContact() {
    this.contactsArray.push(this.createContactForm());
  }

  removeContact(index: number) {
    if (this.contactsArray.length > 1) {
      this.contactsArray.removeAt(index);
    } else {
      this.message.warning('At least one contact is required');
    }
  }

  private async loadPartner(id: string) {
    try {
      const partner = await this.partnerService.getPartnerById(id);
      if (partner) {
        // Clear existing contacts
        while (this.contactsArray.length) {
          this.contactsArray.removeAt(0);
        }
        
        // Add partner contacts
        partner.contacts.forEach(contact => {
          this.contactsArray.push(this.fb.group({
            name: [contact.name, Validators.required],
            email: [contact.email, [Validators.required, Validators.email]],
            role: [contact.role, Validators.required],
            phone: [contact.phone || ''],
            isPrimary: [contact.isPrimary]
          }));
        });

        // Patch form values
        this.form.patchValue({
          companyName: partner.companyName,
          industry: partner.industry,
          website: partner.website || '',
          address: partner.address || ''
        });
      }
    } catch (error) {
      this.message.error('Failed to load partner data');
      this.router.navigate(['/partners']);
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    try {
      const formValue = this.form.value;
      
      if (this.isEdit()) {
        await this.partnerService.updatePartner(this.partnerId()!, formValue);
        this.message.success('Partner updated successfully');
      } else {
        await this.partnerService.createPartner(formValue);
        this.message.success('Partner created successfully');
      }
      
      this.router.navigate(['/partners']);
    } catch (error) {
      this.message.error('Failed to save partner');
    } finally {
      this.loading.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/partners']);
  }
}
```

## Data Models

### Domain Models

```typescript
// Partner aggregate root
interface PartnerData {
  id: string;
  companyName: string;
  status: 'Active' | 'Inactive' | 'Pending';
  industry: string;
  joinedDate: Date;
  address?: string;
  website?: string;
  logoUrl?: string;
  contacts: ContactData[];
}

// Contact entity
interface ContactData {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
  avatarUrl?: string;
}
```

### Firestore Schema

```typescript
// partners collection
interface PartnerDocument {
  companyName: string;
  status: string;
  industry: string;
  joinedDate: Timestamp;
  address?: string;
  website?: string;
  logoUrl?: string;
  contacts: ContactDocument[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ContactDocument {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
  avatarUrl?: string;
}
```

## Error Handling

### Domain Exceptions

```typescript
export class PartnerNotFoundException extends DomainException {
  constructor(partnerId: string) {
    super(`Partner with ID ${partnerId} not found`);
  }
}

export class DuplicateCompanyNameException extends DomainException {
  constructor(companyName: string) {
    super(`Partner with company name '${companyName}' already exists`);
  }
}

export class InvalidContactException extends DomainException {
  constructor(message: string) {
    super(`Invalid contact: ${message}`);
  }
}
```

### Error Handling Strategy

1. **Domain Layer**: Throw domain-specific exceptions for business rule violations
2. **Application Layer**: Catch domain exceptions and convert to appropriate responses
3. **Infrastructure Layer**: Handle technical errors (network, database) and convert to domain exceptions
4. **Presentation Layer**: Display user-friendly error messages using ng-zorro notifications

### Global Error Handler

```typescript
@Injectable()
export class PartnerErrorHandler {
  handleError(error: Error): void {
    if (error instanceof PartnerNotFoundException) {
      this.message.error('Partner not found');
    } else if (error instanceof DuplicateCompanyNameException) {
      this.message.warning('A partner with this company name already exists');
    } else if (error instanceof ValidationException) {
      this.message.error('Please check your input and try again');
    } else {
      this.message.error('An unexpected error occurred');
      console.error('Unhandled error:', error);
    }
  }
}
```

## Testing Strategy

### Unit Testing

**Domain Layer Testing**
- Entity behavior and business rules
- Value object validation
- Domain service logic
- Event publishing

**Application Layer Testing**
- Use case orchestration
- DTO mapping
- Error handling
- Business rule enforcement

**Infrastructure Layer Testing**
- Repository implementations with mocked Firebase
- Data mapping accuracy
- Error handling for external services

### Integration Testing

**Component Testing**
- Component behavior with mocked services
- Form validation and submission
- User interaction handling
- State management with signals

**End-to-End Testing**
- Complete user workflows
- Cross-component integration
- Real Firebase integration (test environment)

### Testing Tools and Patterns

```typescript
// Example unit test for Partner entity
describe('Partner Entity', () => {
  it('should create partner with valid data', () => {
    const partnerData = createValidPartnerData();
    const partner = Partner.create(partnerData);
    
    expect(partner.companyName).toBe(partnerData.companyName);
    expect(partner.status).toBe(PartnerStatus.Pending);
    expect(partner.getDomainEvents()).toHaveLength(1);
  });

  it('should throw exception for invalid company name', () => {
    const partnerData = createPartnerDataWithInvalidName();
    
    expect(() => Partner.create(partnerData))
      .toThrow(InvalidCompanyNameException);
  });
});

// Example component test
describe('PartnerListComponent', () => {
  let component: PartnerListComponent;
  let mockGetPartnersUseCase: jest.Mocked<GetPartnersUseCase>;

  beforeEach(() => {
    mockGetPartnersUseCase = createMockUseCase();
    TestBed.configureTestingModule({
      imports: [PartnerListComponent],
      providers: [
        { provide: GetPartnersUseCase, useValue: mockGetPartnersUseCase }
      ]
    });
  });

  it('should load partners on init', async () => {
    const mockPartners = createMockPartners();
    mockGetPartnersUseCase.execute.mockResolvedValue({ partners: mockPartners });

    component.ngOnInit();
    await fixture.whenStable();

    expect(component.partners()).toEqual(mockPartners);
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **OnPush Change Detection**: All components use OnPush strategy
2. **Signal-based State**: Reactive state management with minimal re-renders
3. **Virtual Scrolling**: For large partner lists using nz-table virtual scroll
4. **Lazy Loading**: Route-based code splitting
5. **Caching**: Repository-level caching for frequently accessed data

### Bundle Optimization & Routing

```typescript
// business-partner.routes.ts - Lazy-loaded routes
export const BUSINESS_PARTNER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/pages/partner-list/partner-list.component')
      .then(m => m.PartnerListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./presentation/pages/partner-form/partner-form.component')
      .then(m => m.PartnerFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./presentation/pages/partner-form/partner-form.component')
      .then(m => m.PartnerFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./presentation/pages/partner-detail/partner-detail.component')
      .then(m => m.PartnerDetailComponent)
  }
];

// Simplified providers
export const BUSINESS_PARTNER_PROVIDERS = [
  PartnerFirebaseService
];
```

## Security Considerations

### Data Validation

1. **Input Sanitization**: All user inputs sanitized before processing
2. **Email Validation**: Proper email format validation
3. **XSS Prevention**: Angular's built-in sanitization
4. **CSRF Protection**: Angular's CSRF token handling

### Access Control

1. **Route Guards**: Protect partner management routes
2. **Role-based Access**: Different permissions for different user roles
3. **Data Filtering**: Users only see partners they have access to

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /partners/{partnerId} {
      allow read, write: if request.auth != null 
        && request.auth.token.role in ['admin', 'manager'];
      allow read: if request.auth != null 
        && request.auth.token.role == 'viewer';
    }
  }
}
```

### Simplified Architecture Benefits

1. **Reduced Boilerplate**: Direct Firebase integration eliminates repository abstractions
2. **Signal-Driven**: Reactive state management without complex RxJS operators
3. **Component-Centric**: Business logic lives close to UI components
4. **Real-time Updates**: Automatic UI updates through Firebase real-time listeners
5. **Type Safety**: Strong TypeScript typing throughout the application
6. **Performance**: OnPush change detection with computed signals for optimal rendering

This design provides a comprehensive, scalable, and maintainable solution for business partner management while adhering to Angular 20 best practices and minimalist design principles.