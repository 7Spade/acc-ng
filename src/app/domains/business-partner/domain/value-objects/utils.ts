// Business Partner Utilities - 極簡主義實現
import { PartnerStatus, Partner, Contact } from '../entities/partner.entity';
import { STATUS_COLORS } from './constants';

// 狀態顏色工具函數
export function getStatusColor(status: PartnerStatus): string {
  return STATUS_COLORS[status] || 'default';
}

// 驗證 Email 格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 驗證公司名稱
export function isValidCompanyName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

// 獲取主要聯絡人
export function getPrimaryContact(contacts: Contact[]): Contact | null {
  return contacts.find(contact => contact.isPrimary) || contacts[0] || null;
}

// 生成唯一 ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 格式化日期顯示
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-TW');
}

// 搜尋過濾函數
export function filterPartners(
  partners: Partner[],
  searchTerm: string,
  statusFilter?: PartnerStatus | null
): Partner[] {
  const search = searchTerm.toLowerCase().trim();
  
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
    const matchesStatus = !statusFilter || partner.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
}