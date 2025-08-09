import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

import { Company } from '../../domain/entities/company.entity';
import { CompanyRepository } from '../../domain/repositories/company.repository';

@Injectable({
  providedIn: 'root'
})
export class CompanyFirebaseRepository implements CompanyRepository {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'companies';

  getAll(): Observable<Company[]> {
    const companiesRef = collection(this.firestore, this.collectionName);
    return from(getDocs(companiesRef)).pipe(map(snapshot => snapshot.docs.map(doc => this.mapDocToCompany(doc))));
  }

  getById(id: string): Observable<Company> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) throw new Error(`Company with id ${id} not found`);
        return this.mapDocToCompany(docSnap);
      })
    );
  }

  create(company: Company): Observable<Company> {
    const companiesRef = collection(this.firestore, this.collectionName);
    const data = company.toPlainObject();
    delete data.id; // Let Firestore generate the ID

    return from(addDoc(companiesRef, data)).pipe(map(docRef => new Company(docRef.id, ...Object.values(data))));
  }

  update(company: Company): Observable<Company> {
    const docRef = doc(this.firestore, this.collectionName, company.id);
    const data = company.toPlainObject();
    delete data.id;

    return from(updateDoc(docRef, data)).pipe(map(() => company));
  }

  delete(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }

  search(query: string): Observable<Company[]> {
    // For simplicity, get all and filter client-side
    // In production, consider Firestore text search or Algolia
    return this.getAll().pipe(
      map(companies =>
        companies.filter(
          company => company.companyName.toLowerCase().includes(query.toLowerCase()) || company.businessRegistrationNumber.includes(query)
        )
      )
    );
  }

  private mapDocToCompany(doc: any): Company {
    const data = doc.data();
    return new Company(
      doc.id,
      data.companyName,
      data.businessRegistrationNumber,
      data.address,
      data.businessPhone,
      data.status,
      data.riskLevel,
      data.fax || '',
      data.website || '',
      data.contacts || [],
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}
