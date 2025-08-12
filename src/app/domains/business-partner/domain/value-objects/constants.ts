// Business Partner Constants - 極簡主義實現

export const PARTNER_STATUSES = ['Active', 'Inactive', 'Pending'] as const;

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Education',
  'Construction',
  'Transportation',
  'Energy',
  'Media',
  'Real Estate',
  'Consulting',
  'Other'
] as const;

export const STATUS_COLORS = {
  Active: 'green',
  Inactive: 'red',
  Pending: 'orange'
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_CONTACTS_PER_PARTNER = 10;