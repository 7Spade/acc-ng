// Partner Firebase Service Tests - 極簡主義實現
import { TestBed } from '@angular/core/testing';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  collectionData,
  serverTimestamp,
  query,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { PartnerFirebaseService } from './partner-firebase.service';
import {
  CreatePartnerData,
  UpdatePartnerData,
  Partner,
  PartnerDocument
} from '../../domain/entities/partner.entity';

// Mock Firebase functions
jest.mock('@angular/fire/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  collectionData: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: 1640995200, nanoseconds: 0 })),
  query: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })),
    toDate: jest.fn()
  }
}));

describe('PartnerFirebaseService', () => {
  let service: PartnerFirebaseService;
  let mockFirestore: jasmine.SpyObj<Firestore>;

  const mockPartnerDocument: PartnerDocument = {
    companyName: 'Test Company',
    status: 'Active',
    industry: 'Technology',
    joinedDate: { seconds: 1640995200, nanoseconds: 0 } as any,
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
    createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
    updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
  };

  const mockPartner: Partner = {
    id: 'partner1',
    companyName: 'Test Company',
    status: 'Active',
    industry: 'Technology',
    joinedDate: new Date(1640995200000),
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
    createdAt: new Date(1640995200000),
    updatedAt: new Date(1640995200000)
  };

  beforeEach(() => {
    const firestoreSpy = jasmine.createSpyObj('Firestore', ['collection', 'doc']);

    TestBed.configureTestingModule({
      providers: [
        PartnerFirebaseService,
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });

    service = TestBed.inject(PartnerFirebaseService);
    mockFirestore = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('createPartner', () => {
    it('should create partner successfully', async () => {
      const createData: CreatePartnerData = {
        companyName: 'Test Company',
        industry: 'Technology',
        address: '123 Test St',
        website: 'https://test.com',
        contacts: [
          {
            name: 'John Doe',
            email: 'john@test.com',
            role: 'Manager',
            phone: '123-456-7890',
            isPrimary: true
          }
        ]
      };

      const mockDocRef = { id: 'new-partner-id' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (collection as jest.Mock).mockReturnValue({});

      const result = await service.createPartner(createData);

      expect(result).toBe('new-partner-id');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should set first contact as primary if none specified', async () => {
      const createData: CreatePartnerData = {
        companyName: 'Test Company',
        industry: 'Technology',
        contacts: [
          {
            name: 'John Doe',
            email: 'john@test.com',
            role: 'Manager',
            isPrimary: false
          }
        ]
      };

      const mockDocRef = { id: 'new-partner-id' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (collection as jest.Mock).mockReturnValue({});

      await service.createPartner(createData);

      const addDocCall = (addDoc as jest.Mock).mock.calls[0];
      const docData = addDocCall[1];
      expect(docData.contacts[0].isPrimary).toBe(true);
    });

    it('should handle creation errors', async () => {
      const createData: CreatePartnerData = {
        companyName: 'Test Company',
        industry: 'Technology',
        contacts: []
      };

      (addDoc as jest.Mock).mockRejectedValue(new Error('Firebase error'));
      (collection as jest.Mock).mockReturnValue({});

      await expectAsync(service.createPartner(createData))
        .toBeRejectedWithError('Failed to create partner');
    });
  });

  describe('getPartners', () => {
    it('should return partners observable', () => {
      const mockPartnersData = [
        { id: 'partner1', ...mockPartnerDocument }
      ];

      (query as jest.Mock).mockReturnValue({});
      (orderBy as jest.Mock).mockReturnValue({});
      (collectionData as jest.Mock).mockReturnValue(of(mockPartnersData));
      (collection as jest.Mock).mockReturnValue({});

      const partners$ = service.getPartners();

      partners$.subscribe(partners => {
        expect(partners).toHaveLength(1);
        expect(partners[0].id).toBe('partner1');
        expect(partners[0].companyName).toBe('Test Company');
      });
    });

    it('should return partners signal', () => {
      const mockPartnersData = [
        { id: 'partner1', ...mockPartnerDocument }
      ];

      (query as jest.Mock).mockReturnValue({});
      (orderBy as jest.Mock).mockReturnValue({});
      (collectionData as jest.Mock).mockReturnValue(of(mockPartnersData));
      (collection as jest.Mock).mockReturnValue({});

      const partnersSignal = service.getPartnersSignal();

      expect(partnersSignal).toBeDefined();
      expect(typeof partnersSignal).toBe('function'); // Signals are functions
    });
  });

  describe('getPartnerById', () => {
    it('should validate partner ID', async () => {
      await expectAsync(service.getPartnerById(''))
        .toBeRejectedWithError('Partner ID is required');

      await expectAsync(service.getPartnerById('   '))
        .toBeRejectedWithError('Partner ID is required');
    });

    it('should return partner when found', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: 'partner1',
        data: () => mockPartnerDocument
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await service.getPartnerById('partner1');

      expect(result).toBeTruthy();
      expect(result!.id).toBe('partner1');
      expect(result!.companyName).toBe('Test Company');
    });

    it('should return null when partner not found', async () => {
      const mockDocSnap = {
        exists: () => false
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await service.getPartnerById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle get errors', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firebase error'));

      await expectAsync(service.getPartnerById('partner1'))
        .toBeRejectedWithError('Failed to get partner');
    });
  });

  describe('updatePartner', () => {
    it('should update partner successfully', async () => {
      const updateData: UpdatePartnerData = {
        companyName: 'Updated Company',
        status: 'Active'
      };

      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await service.updatePartner('partner1', updateData);

      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0];
      const updatePayload = updateCall[1];
      expect(updatePayload.companyName).toBe('Updated Company');
      expect(updatePayload.updatedAt).toBeDefined();
    });

    it('should handle update errors', async () => {
      const updateData: UpdatePartnerData = {
        companyName: 'Updated Company'
      };

      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Firebase error'));

      await expectAsync(service.updatePartner('partner1', updateData))
        .toBeRejectedWithError('Failed to update partner');
    });
  });

  describe('deletePartner', () => {
    it('should delete partner successfully', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await service.deletePartner('partner1');

      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (deleteDoc as jest.Mock).mockRejectedValue(new Error('Firebase error'));

      await expectAsync(service.deletePartner('partner1'))
        .toBeRejectedWithError('Failed to delete partner');
    });
  });

  describe('getFilteredPartners', () => {
    it('should filter partners by search term', () => {
      const mockPartnersData = [mockPartner];
      const searchTerm = signal('Test');
      const statusFilter = signal(null);

      (query as jest.Mock).mockReturnValue({});
      (orderBy as jest.Mock).mockReturnValue({});
      (collectionData as jest.Mock).mockReturnValue(of(mockPartnersData));
      (collection as jest.Mock).mockReturnValue({});

      const filteredSignal = service.getFilteredPartners(
        () => searchTerm(),
        () => statusFilter()
      );

      const result = filteredSignal();
      expect(result).toHaveLength(1);
      expect(result[0].companyName).toBe('Test Company');
    });

    it('should filter partners by status', () => {
      const mockPartnersData = [mockPartner];
      const searchTerm = signal('');
      const statusFilter = signal('Active');

      (query as jest.Mock).mockReturnValue({});
      (orderBy as jest.Mock).mockReturnValue({});
      (collectionData as jest.Mock).mockReturnValue(of(mockPartnersData));
      (collection as jest.Mock).mockReturnValue({});

      const filteredSignal = service.getFilteredPartners(
        () => searchTerm(),
        () => statusFilter()
      );

      const result = filteredSignal();
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no matches', () => {
      const mockPartnersData = [mockPartner];
      const searchTerm = signal('NonExistent');
      const statusFilter = signal(null);

      (query as jest.Mock).mockReturnValue({});
      (orderBy as jest.Mock).mockReturnValue({});
      (collectionData as jest.Mock).mockReturnValue(of(mockPartnersData));
      (collection as jest.Mock).mockReturnValue({});

      const filteredSignal = service.getFilteredPartners(
        () => searchTerm(),
        () => statusFilter()
      );

      const result = filteredSignal();
      expect(result).toHaveLength(0);
    });
  });

  describe('Data Transformation', () => {
    it('should map Firestore document to Partner entity correctly', () => {
      const docWithId = { id: 'partner1', ...mockPartnerDocument };

      (query as jest.Mock).mockReturnValue({});
      (orderBy as jest.Mock).mockReturnValue({});
      (collectionData as jest.Mock).mockReturnValue(of([docWithId]));
      (collection as jest.Mock).mockReturnValue({});

      service.getPartners().subscribe(partners => {
        const partner = partners[0];
        expect(partner.id).toBe('partner1');
        expect(partner.companyName).toBe('Test Company');
        expect(partner.status).toBe('Active');
        expect(partner.industry).toBe('Technology');
        expect(partner.joinedDate).toBeInstanceOf(Date);
        expect(partner.createdAt).toBeInstanceOf(Date);
        expect(partner.updatedAt).toBeInstanceOf(Date);
        expect(partner.contacts).toHaveLength(1);
        expect(partner.contacts[0].isPrimary).toBe(true);
      });
    });

    it('should handle missing optional fields', () => {
      const minimalDoc = {
        id: 'partner1',
        companyName: 'Test Company',
        status: 'Active',
        industry: 'Technology',
        joinedDate: { seconds: 1640995200, nanoseconds: 0 } as any,
        contacts: [],
        createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
      };

      (query as jest.Mock).mockReturnValue({});
      (orderBy as jest.Mock).mockReturnValue({});
      (collectionData as jest.Mock).mockReturnValue(of([minimalDoc]));
      (collection as jest.Mock).mockReturnValue({});

      service.getPartners().subscribe(partners => {
        const partner = partners[0];
        expect(partner.address).toBeUndefined();
        expect(partner.website).toBeUndefined();
        expect(partner.logoUrl).toBeUndefined();
        expect(partner.contacts).toEqual([]);
      });
    });
  });
});