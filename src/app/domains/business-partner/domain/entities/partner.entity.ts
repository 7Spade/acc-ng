// Partner Entity - 極簡主義實現
export interface Partner {
  id: string;
  companyName: string;
  status: PartnerStatus;
  industry: string;
  joinedDate: Date;
  address?: string;
  website?: string;
  logoUrl?: string;
  contacts: Contact[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
  avatarUrl?: string;
}

export type PartnerStatus = 'Active' | 'Inactive' | 'Pending';

// 用於創建新 Partner 的介面
export interface CreatePartnerData {
  companyName: string;
  industry: string;
  address?: string;
  website?: string;
  contacts: CreateContactData[];
}

export interface CreateContactData {
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

// 用於更新 Partner 的介面
export interface UpdatePartnerData {
  companyName?: string;
  industry?: string;
  address?: string;
  website?: string;
  status?: PartnerStatus;
  contacts?: Contact[];
}

// Firestore 文檔格式
export interface PartnerDocument {
  companyName: string;
  status: string;
  industry: string;
  joinedDate: any; // Firestore Timestamp
  address?: string;
  website?: string;
  logoUrl?: string;
  contacts: ContactDocument[];
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface ContactDocument {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
  avatarUrl?: string;
}