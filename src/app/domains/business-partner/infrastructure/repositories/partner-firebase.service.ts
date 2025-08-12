// Partner Firebase Service - 極簡主義實現
import { Injectable, computed } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  Partner, 
  CreatePartnerData, 
  UpdatePartnerData, 
  PartnerDocument
} from '../../domain/entities/partner.entity';
import { generateId } from '../../domain/value-objects/utils';

@Injectable({
  providedIn: 'root'
})
export class PartnerFirebaseService {
  private partnersCollection = collection(this.firestore, 'partners');

  constructor(private firestore: Firestore) {}

  // 創建新合作夥伴
  async createPartner(partnerData: CreatePartnerData): Promise<string> {
    try {
      // 為每個聯絡人生成 ID
      const contactsWithIds = partnerData.contacts.map(contact => ({
        ...contact,
        id: generateId()
      }));

      // 確保至少有一個主要聯絡人
      if (!contactsWithIds.some(c => c.isPrimary) && contactsWithIds.length > 0) {
        contactsWithIds[0].isPrimary = true;
      }

      const docData: Omit<PartnerDocument, 'id'> = {
        companyName: partnerData.companyName,
        status: 'Pending', // 預設狀態
        industry: partnerData.industry,
        joinedDate: serverTimestamp(),
        address: partnerData.address,
        website: partnerData.website,
        contacts: contactsWithIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(this.partnersCollection, docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw new Error('Failed to create partner');
    }
  }

  // 獲取所有合作夥伴 - 使用 Signal
  getPartners(): Observable<Partner[]> {
    const partnersQuery = query(this.partnersCollection, orderBy('createdAt', 'desc'));
    
    return collectionData(partnersQuery, { idField: 'id' }).pipe(
      map((docs: any[]) => docs.map(doc => this.mapDocumentToPartner(doc)))
    );
  }

  // 將 Observable 轉換為 Signal
  getPartnersSignal() {
    return toSignal(this.getPartners(), { initialValue: [] });
  }

  // 根據 ID 獲取單個合作夥伴
  async getPartnerById(id: string): Promise<Partner | null> {
    if (!id?.trim()) {
      throw new Error('Partner ID is required');
    }

    try {
      const docRef = doc(this.firestore, 'partners', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        return this.mapDocumentToPartner(data);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting partner:', error);
      throw new Error('Failed to get partner');
    }
  }

  // 更新合作夥伴
  async updatePartner(id: string, updates: UpdatePartnerData): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'partners', id);
      
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating partner:', error);
      throw new Error('Failed to update partner');
    }
  }

  // 刪除合作夥伴
  async deletePartner(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'partners', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw new Error('Failed to delete partner');
    }
  }

  // 搜尋和過濾合作夥伴 - 使用 computed signals
  getFilteredPartners(
    searchTerm: () => string, 
    statusFilter: () => string | null
  ) {
    const allPartners = this.getPartnersSignal();
    
    return computed(() => {
      const partners = allPartners();
      const search = searchTerm().toLowerCase().trim();
      const status = statusFilter();

      return partners.filter(partner => {
        // 搜尋匹配
        const matchesSearch = !search || 
          partner.companyName.toLowerCase().includes(search) ||
          partner.industry.toLowerCase().includes(search) ||
          partner.contacts.some(contact => 
            contact.name.toLowerCase().includes(search) ||
            contact.email.toLowerCase().includes(search)
          );
        
        // 狀態匹配
        const matchesStatus = !status || partner.status === status;
        
        return matchesSearch && matchesStatus;
      });
    });
  }

  // 將 Firestore 文檔映射為 Partner 實體
  private mapDocumentToPartner(doc: any): Partner {
    return {
      id: doc.id,
      companyName: doc.companyName,
      status: doc.status,
      industry: doc.industry,
      joinedDate: doc.joinedDate instanceof Timestamp ? doc.joinedDate.toDate() : new Date(doc.joinedDate),
      address: doc.address,
      website: doc.website,
      logoUrl: doc.logoUrl,
      contacts: doc.contacts || [],
      createdAt: doc.createdAt instanceof Timestamp ? doc.createdAt.toDate() : new Date(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Timestamp ? doc.updatedAt.toDate() : new Date(doc.updatedAt)
    };
  }
}