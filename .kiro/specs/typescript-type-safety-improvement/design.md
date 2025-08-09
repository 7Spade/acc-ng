# Design Document

## Overview

This design addresses the systematic replacement of unsafe `any` types throughout the codebase with proper TypeScript interfaces and types. The approach prioritizes creating a comprehensive type system that aligns with the existing DDD architecture while maintaining the minimalist design principles.

The current codebase has TypeScript strict mode enabled but contains 263 ESLint errors related to unsafe `any` usage. This design provides a structured approach to eliminate these issues while improving code maintainability and developer experience.

## Architecture

### Type System Hierarchy

```
┌─────────────────────────────────────┐
│           Shared Types              │
│  - Base interfaces                  │
│  - Common utility types             │
│  - Generic response wrappers        │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│          Domain Types               │
│  - Entity interfaces                │
│  - Value object types               │
│  - Domain event types               │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│        Application Types            │
│  - Command/Query DTOs               │
│  - Response interfaces              │
│  - Service contracts                │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│      Infrastructure Types          │
│  - API response models              │
│  - Database schemas                 │
│  - External service contracts       │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│       Presentation Types           │
│  - Component input/output types     │
│  - Form model interfaces           │
│  - UI state types                  │
└─────────────────────────────────────┘
```

### Type Definition Strategy

1. **Bottom-Up Approach**: Start with foundational types and build upward
2. **Domain-First**: Prioritize business domain types over technical types
3. **Incremental Migration**: Replace `any` types in logical groups
4. **Strict Enforcement**: Enable stricter TypeScript rules progressively

## Components and Interfaces

### 1. Shared Type Definitions

#### Base Interfaces
```typescript
// shared/types/base.types.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  pi: number;  // page index
  ps: number;  // page size
}

export interface PaginatedResponse<T> {
  total: number;
  list: T[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

#### Mock Data Types
```typescript
// _mock/types/mock.types.ts
export interface MockListItem extends BaseEntity {
  owner: string;
  title: string;
  avatar: string;
  cover: string;
  status: 'active' | 'exception' | 'normal';
  percent: number;
  logo: string;
  href: string;
  description: string;
  body: string;
  star: number;
  like: number;
  message: number;
}

export interface MockUser extends BaseEntity {
  disabled: boolean;
  href: string;
  avatar: string;
  no: string;
  title: string;
  owner: string;
  description: string;
  callNo: number;
  status: number;
  progress: number;
}

export interface MockChartData {
  x: string | number;
  y: number;
  name?: string;
}
```

### 2. Domain Type Definitions

#### User Domain Types
```typescript
// domains/auth/domain/types/user.types.ts
export interface UserData {
  id: string;
  name: string;
  email: string;
  uid: string;
  isAdmin: boolean;
  isAnonymous: boolean;
  profile?: UserProfileData;
}

export interface UserProfileData {
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
}

export interface FirebaseUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}
```

#### Business Partner Types
```typescript
// domains/business-partner/domain/types/company.types.ts
export interface CompanyData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  size: CompanySize;
  status: CompanyStatus;
}

export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise';
export type CompanyStatus = 'active' | 'inactive' | 'pending';
```

#### Contract Management Types
```typescript
// domains/contract-management/domain/types/contract.types.ts
export interface ContractData {
  id: string;
  contractName: string;
  contractType: ContractType;
  riskLevel: RiskLevel;
  clientCompany: string;
  clientRepresentative: string;
  clientContact: string;
  clientEmail: string;
  endDate: Date;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  paymentSchedule: PaymentScheduleItem[];
  approvalStatus: ApprovalStatus;
  approvers: string[];
  documents: DocumentReference[];
  risks: RiskItem[];
}

export type ContractType = 'service' | 'product' | 'maintenance' | 'consulting';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface PaymentScheduleItem {
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid';
}

export interface DocumentReference {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface RiskItem {
  id: string;
  description: string;
  severity: RiskLevel;
  mitigation: string;
}
```

### 3. Application Layer Types

#### Command and Query DTOs
```typescript
// shared/application/types/dto.types.ts
export interface CreateCommand<T> {
  data: T;
}

export interface UpdateCommand<T> {
  id: string;
  data: Partial<T>;
}

export interface DeleteCommand {
  id: string;
}

export interface GetByIdQuery {
  id: string;
}

export interface GetListQuery extends PaginationParams {
  filters?: Record<string, unknown>;
  sort?: SortOptions;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
```

#### Service Response Types
```typescript
// shared/application/types/response.types.ts
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ServiceError;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}
```

### 4. Infrastructure Layer Types

#### HTTP Client Types
```typescript
// shared/infrastructure/types/http.types.ts
export interface HttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpError {
  status: number;
  statusText: string;
  message: string;
  error?: unknown;
}
```

#### Firebase Types
```typescript
// shared/infrastructure/types/firebase.types.ts
export interface FirestoreDocument {
  id: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseAuthResult {
  user: FirebaseUserData | null;
  credential: unknown | null;
}
```

### 5. Presentation Layer Types

#### Component Types
```typescript
// shared/presentation/types/component.types.ts
export interface ComponentState<T = unknown> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

export interface FormState<T = unknown> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  valid: boolean;
}

export interface TableColumn<T = unknown> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: unknown, record: T) => string;
}
```

## Data Models

### Type Mapping Strategy

1. **Mock Data Migration**
   - Replace all `any[]` arrays with typed arrays
   - Define interfaces for all mock data structures
   - Create type-safe data generation functions

2. **Domain Entity Enhancement**
   - Add comprehensive type definitions for all entities
   - Define value object types with proper constraints
   - Create typed domain event interfaces

3. **Service Layer Typing**
   - Define typed method signatures for all services
   - Create proper request/response type pairs
   - Add error type definitions

4. **Component Interface Typing**
   - Type all @Input and @Output properties
   - Define form model interfaces
   - Create typed event handlers

## Error Handling

### Type-Safe Error Management

```typescript
// shared/types/error.types.ts
export interface TypedError<T = unknown> {
  code: string;
  message: string;
  context?: T;
  timestamp: Date;
}

export interface ValidationErrorDetail {
  field: string;
  value: unknown;
  constraint: string;
  message: string;
}

export interface BusinessRuleError {
  rule: string;
  entity: string;
  entityId: string;
  message: string;
}
```

### Error Handling Patterns

1. **Result Pattern**: Use typed Result<T, E> for operations that can fail
2. **Exception Types**: Define specific exception classes for different error scenarios
3. **Validation Errors**: Create structured validation error types
4. **HTTP Errors**: Type HTTP error responses consistently

## Testing Strategy

### Type-Safe Testing Approach

1. **Mock Type Definitions**
   - Create typed mocks for all services
   - Define test data interfaces
   - Use type-safe test utilities

2. **Component Testing**
   - Type component inputs and outputs in tests
   - Create typed test fixtures
   - Use proper type assertions

3. **Service Testing**
   - Mock dependencies with proper types
   - Test type constraints and validations
   - Verify return type correctness

### Test Utility Types

```typescript
// shared/testing/types/test.types.ts
export interface MockService<T> {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? jest.MockedFunction<(...args: A) => R>
    : T[K];
}

export interface TestFixture<T> {
  valid: T;
  invalid: Partial<T>;
  minimal: Partial<T>;
}
```

## Implementation Phases

### Phase 1: Foundation Types (Priority: High)
- Shared base interfaces and utility types
- Mock data type definitions
- Basic error and response types

### Phase 2: Domain Types (Priority: High)
- User and authentication types
- Business partner types
- Contract management types

### Phase 3: Application Layer (Priority: Medium)
- Service interface types
- DTO and command types
- Use case parameter and return types

### Phase 4: Infrastructure Layer (Priority: Medium)
- Repository interface types
- HTTP client types
- Firebase integration types

### Phase 5: Presentation Layer (Priority: Low)
- Component input/output types
- Form model interfaces
- UI state management types

### Phase 6: Testing Enhancement (Priority: Low)
- Test utility types
- Mock type definitions
- Type-safe test fixtures

## Quality Gates

### Type Safety Metrics
- Zero `@typescript-eslint/no-unsafe-*` errors
- Zero `@typescript-eslint/no-explicit-any` warnings
- 100% type coverage for public APIs
- All function parameters and return types explicitly typed

### Code Quality Checks
- All interfaces documented with JSDoc
- Consistent naming conventions followed
- Proper use of union types vs enums
- Appropriate use of generic constraints

### Performance Considerations
- Minimal impact on bundle size
- No runtime type checking overhead
- Efficient type inference patterns
- Optimized generic type usage