import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

import { Company, Contact } from '../../domain/entities/company.entity';
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

  save(company: Company): Observable<Company> {
    const isNewCompany = !company.id || company.id === '';
    return isNewCompany ? this.create(company) : this.update(company);
  }

  create(company: Company): Observable<Company> {
    const companiesRef = collection(this.firestore, this.collectionName);
    const data = company.toPlainObject();
    delete data['id'];

    return from(addDoc(companiesRef, data)).pipe(
      map(
        docRef =>
          new Company(
            docRef.id,
            company.companyName,
            company.businessRegistrationNumber,
            company.address,
            company.businessPhone,
            company.status,
            company.riskLevel,
            company.fax,
            company.website,
            company.contacts,
            company.createdAt,
            new Date()
          )
      )
    );
  }

  update(company: Company): Observable<Company> {
    const docRef = doc(this.firestore, this.collectionName, company.id);
    const data = company.toPlainObject();
    delete data['id'];

    return from(updateDoc(docRef, data as any)).pipe(map(() => company));
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

  private mapDocToCompany(doc: { id: string; data: () => Record<string, unknown> }): Company {
    const data = doc.data();
    return new Company(
      doc.id,
      data['companyName'] as string,
      data['businessRegistrationNumber'] as string,
      data['address'] as string,
      data['businessPhone'] as string,
      data['status'] as string,
      data['riskLevel'] as string,
      (data['fax'] as string) || '',
      (data['website'] as string) || '',
      (data['contacts'] as Contact[]) || [],
      new Date(data['createdAt'] as string),
      new Date(data['updatedAt'] as string)
    );
  }
}
