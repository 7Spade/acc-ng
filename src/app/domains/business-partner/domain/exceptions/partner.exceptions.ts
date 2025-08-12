// Business Partner Exceptions - 極簡主義實現

export class PartnerException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PartnerException';
  }
}

export class PartnerNotFoundException extends PartnerException {
  constructor(partnerId: string) {
    super(`Partner with ID ${partnerId} not found`);
    this.name = 'PartnerNotFoundException';
  }
}

export class DuplicateCompanyNameException extends PartnerException {
  constructor(companyName: string) {
    super(`Partner with company name '${companyName}' already exists`);
    this.name = 'DuplicateCompanyNameException';
  }
}

export class InvalidContactException extends PartnerException {
  constructor(message: string) {
    super(`Invalid contact: ${message}`);
    this.name = 'InvalidContactException';
  }
}

export class ValidationException extends PartnerException {
  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`);
    this.name = 'ValidationException';
  }
}