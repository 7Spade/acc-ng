import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of, switchMap } from 'rxjs';
import { Company } from '../../domain/entities/company.entity';
import { CompanyRepository, CompanySearchCriteria, CompanySearchResult } from '../../domain/repositories/company.repository';

@Injectable({
  providedIn: 'root'
})
export class CompanyFirebaseRepository implements CompanyRepository {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'companies';

  private getCollection() {
    return collection(this.firestore, this.collectionName);
  }

  private getDocument(id: string) {
    return doc(this.firestore, this.collectionName, id);
  }

  private mapFirestoreDocToCompany(doc: DocumentData): Company {
    const data = (doc as any).data();
    return {
      id: doc['id'],
      name: data.name,
      legalName: data.legalName,
      description: data.description,
      website: data.website,
      logoUrl: data.logoUrl,
      address: {
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        zipCode: data.address.zipCode,
        country: data.address.country
      },
      contacts: data.contacts || [],
      financials: {
        annualRevenue: data.financials?.annualRevenue,
        employeeCount: data.financials?.employeeCount,
        industry: data.financials.industry,
        taxId: data.financials?.taxId
      },
      metadata: {
        createdAt: data.metadata.createdAt?.toDate() || new Date(),
        updatedAt: data.metadata.updatedAt?.toDate() || new Date(),
        createdBy: data.metadata.createdBy || 'system',
        updatedBy: data.metadata.updatedBy || 'system',
        isActive: data.metadata.isActive ?? true
      },
      tags: data.tags || [],
      status: data.status || 'active',
      partnershipLevel: data.partnershipLevel || 'bronze',
      notes: data.notes
    };
  }

  private mapCompanyToFirestoreData(company: Company): any {
    return {
      name: company.name,
      legalName: company.legalName,
      description: company.description,
      website: company.website,
      logoUrl: company.logoUrl,
      address: company.address,
      contacts: company.contacts,
      financials: company.financials,
      metadata: {
        createdAt: company.metadata.createdAt,
        updatedAt: company.metadata.updatedAt,
        createdBy: company.metadata.createdBy,
        updatedBy: company.metadata.updatedBy,
        isActive: company.metadata.isActive
      },
      tags: company.tags,
      status: company.status,
      partnershipLevel: company.partnershipLevel,
      notes: company.notes
    };
  }

  findById(id: string): Observable<Company | null> {
    return from(getDoc(this.getDocument(id))).pipe(
      map(doc => doc.exists() ? this.mapFirestoreDocToCompany(doc) : null),
      catchError(error => {
        console.error('Error finding company by ID:', error);
        return of(null);
      })
    );
  }

  findAll(): Observable<Company[]> {
    return from(getDocs(this.getCollection())).pipe(
      map(snapshot => snapshot.docs.map(doc => this.mapFirestoreDocToCompany(doc))),
      catchError(error => {
        console.error('Error finding all companies:', error);
        return of([]);
      })
    );
  }

  search(criteria: CompanySearchCriteria): Observable<CompanySearchResult> {
    const constraints: QueryConstraint[] = [];

    // Add search constraints
    if (criteria.name) {
      constraints.push(where('name', '>=', criteria.name));
      constraints.push(where('name', '<=', criteria.name + '\uf8ff'));
    }

    if (criteria.status) {
      constraints.push(where('status', '==', criteria.status));
    }

    if (criteria.partnershipLevel) {
      constraints.push(where('partnershipLevel', '==', criteria.partnershipLevel));
    }

    if (criteria.industry) {
      constraints.push(where('financials.industry', '==', criteria.industry));
    }

    if (criteria.isActive !== undefined) {
      constraints.push(where('metadata.isActive', '==', criteria.isActive));
    }

    // Add sorting
    if (criteria.sortBy) {
      const sortField = criteria.sortBy === 'partnershipLevel' ? 'partnershipLevel' : 
                       criteria.sortBy === 'createdAt' ? 'metadata.createdAt' :
                       criteria.sortBy === 'updatedAt' ? 'metadata.updatedAt' : 'name';
      constraints.push(orderBy(sortField, criteria.sortOrder || 'asc'));
    }

    // Add pagination
    if (criteria.limit) {
      constraints.push(limit(criteria.limit));
    }

    if (criteria.offset && criteria.offset > 0) {
      // For offset pagination, we need to implement a different approach
      // This is a simplified version - in production you might want to use cursor-based pagination
      constraints.push(limit(criteria.offset + (criteria.limit || 50)));
    }

    const q = query(this.getCollection(), ...constraints);

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const companies = snapshot.docs.map(doc => this.mapFirestoreDocToCompany(doc));
        
        // Apply offset manually (not ideal for large datasets)
        const offset = criteria.offset || 0;
        const limit = criteria.limit || 50;
        const paginatedCompanies = companies.slice(offset, offset + limit);
        
        return {
          companies: paginatedCompanies,
          total: companies.length, // This is approximate due to Firestore limitations
          hasMore: companies.length > offset + limit
        };
      }),
      catchError(error => {
        console.error('Error searching companies:', error);
        return of({ companies: [], total: 0, hasMore: false });
      })
    );
  }

  save(company: Company): Observable<Company> {
    if (company.id) {
      // Update existing company
      return this.update(company.id, company);
    } else {
      // Create new company
      const data = this.mapCompanyToFirestoreData(company);
      return from(addDoc(this.getCollection(), data)).pipe(
        map(docRef => ({ ...company, id: docRef.id })),
        catchError(error => {
          console.error('Error saving company:', error);
          throw new Error('Failed to save company');
        })
      );
    }
  }

  update(id: string, updates: Partial<Omit<Company, 'id' | 'metadata'>>): Observable<Company> {
    return this.findById(id).pipe(
      switchMap(existingCompany => {
        if (!existingCompany) {
          throw new Error('Company not found');
        }

        const updatedCompany = {
          ...existingCompany,
          ...updates,
          metadata: {
            ...existingCompany.metadata,
            updatedAt: new Date(),
            updatedBy: 'system' // Will be updated by auth service
          }
        };

        const data = this.mapCompanyToFirestoreData(updatedCompany);
        return from(updateDoc(this.getDocument(id), data)).pipe(
          map(() => updatedCompany),
          catchError(error => {
            console.error('Error updating company:', error);
            throw new Error('Failed to update company');
          })
        );
      })
    );
  }

  delete(id: string): Observable<void> {
    return from(deleteDoc(this.getDocument(id))).pipe(
      catchError(error => {
        console.error('Error deleting company:', error);
        throw new Error('Failed to delete company');
      })
    );
  }

  exists(id: string): Observable<boolean> {
    return this.findById(id).pipe(
      map(company => company !== null)
    );
  }

  count(): Observable<number> {
    return from(getDocs(this.getCollection())).pipe(
      map(snapshot => snapshot.size),
      catchError(error => {
        console.error('Error counting companies:', error);
        return of(0);
      })
    );
  }

  findByStatus(status: Company['status']): Observable<Company[]> {
    return this.search({ status, limit: 1000 }).pipe(
      map(result => result.companies)
    );
  }

  findByPartnershipLevel(level: Company['partnershipLevel']): Observable<Company[]> {
    return this.search({ partnershipLevel: level, limit: 1000 }).pipe(
      map(result => result.companies)
    );
  }

  findByIndustry(industry: string): Observable<Company[]> {
    return this.search({ industry, limit: 1000 }).pipe(
      map(result => result.companies)
    );
  }

  findByTags(tags: string[]): Observable<Company[]> {
    // Firestore doesn't support array-contains-all efficiently, so we'll implement a simplified version
    return this.search({ limit: 1000 }).pipe(
      map(result => result.companies.filter(company => 
        tags.some(tag => company.tags.includes(tag))
      ))
    );
  }

  activate(id: string): Observable<Company> {
    return this.findById(id).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error('Company not found');
        }
        const updatedCompany = {
          ...company,
          status: 'active' as const,
          metadata: {
            ...company.metadata,
            updatedAt: new Date(),
            updatedBy: 'system'
          }
        };
        const data = this.mapCompanyToFirestoreData(updatedCompany);
        return from(updateDoc(this.getDocument(id), data)).pipe(
          map(() => updatedCompany)
        );
      })
    );
  }

  deactivate(id: string): Observable<Company> {
    return this.findById(id).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error('Company not found');
        }
        const updatedCompany = {
          ...company,
          status: 'inactive' as const,
          metadata: {
            ...company.metadata,
            updatedAt: new Date(),
            updatedBy: 'system'
          }
        };
        const data = this.mapCompanyToFirestoreData(updatedCompany);
        return from(updateDoc(this.getDocument(id), data)).pipe(
          map(() => updatedCompany)
        );
      })
    );
  }

  updatePartnershipLevel(id: string, level: Company['partnershipLevel']): Observable<Company> {
    return this.update(id, { partnershipLevel: level });
  }

  addContact(id: string, contact: Company['contacts'][0]): Observable<Company> {
    return this.findById(id).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error('Company not found');
        }
        const updatedContacts = [...company.contacts, contact];
        return this.update(id, { contacts: updatedContacts });
      })
    );
  }

  removeContact(id: string, contactEmail: string): Observable<Company> {
    return this.findById(id).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error('Company not found');
        }
        const updatedContacts = company.contacts.filter(c => c.email !== contactEmail);
        return this.update(id, { contacts: updatedContacts });
      })
    );
  }

  addTag(id: string, tag: string): Observable<Company> {
    return this.findById(id).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error('Company not found');
        }
        if (!company.tags.includes(tag)) {
          const updatedTags = [...company.tags, tag];
          return this.update(id, { tags: updatedTags });
        }
        return of(company);
      })
    );
  }

  removeTag(id: string, tag: string): Observable<Company> {
    return this.findById(id).pipe(
      switchMap(company => {
        if (!company) {
          throw new Error('Company not found');
        }
        const updatedTags = company.tags.filter(t => t !== tag);
        return this.update(id, { tags: updatedTags });
      })
    );
  }
}
