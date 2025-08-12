// Business Partner Providers - 極簡主義實現
import { Provider } from '@angular/core';
import { PartnerFirebaseService } from './infrastructure/repositories/partner-firebase.service';

export const BUSINESS_PARTNER_PROVIDERS: Provider[] = [
  PartnerFirebaseService
];