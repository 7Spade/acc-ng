/**
 * 聯絡人實體 - 簡化為接口
 * 極簡設計，只包含核心屬性
 */
export interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

/**
 * 聯絡人創建屬性
 */
export interface CreateContactProps {
  name: string;
  title?: string;
  email: string;
  phone?: string;
  isPrimary?: boolean;
}

/**
 * 聯絡人工具函數
 */
export class ContactUtils {
  /**
   * 創建聯絡人
   */
  static create(props: CreateContactProps): Contact {
    if (!props.name?.trim()) throw new Error('Contact name is required');
    if (!props.email?.trim()) throw new Error('Contact email is required');

    return {
      name: props.name.trim(),
      title: props.title?.trim() || '',
      email: props.email.trim(),
      phone: props.phone?.trim() || '',
      isPrimary: props.isPrimary || false
    };
  }

  /**
   * 驗證聯絡人
   */
  static isValid(contact: Contact): boolean {
    return !!(contact.name?.trim() && contact.email?.trim());
  }

  /**
   * 獲取顯示名稱
   */
  static getDisplayName(contact: Contact): string {
    return contact.title ? `${contact.name} (${contact.title})` : contact.name;
  }

  /**
   * 設置為主要聯絡人
   */
  static setAsPrimary(contact: Contact): Contact {
    return { ...contact, isPrimary: true };
  }
}
