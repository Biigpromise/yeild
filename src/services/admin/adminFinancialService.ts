
import * as withdrawalService from './financial/withdrawalService';
import * as metricsService from './financial/metricsService';
import * as paymentMethodService from './financial/paymentMethodService';
import * as reportingService from './financial/reportingService';

export * from './financial/types';

export const adminFinancialService = {
  ...withdrawalService,
  ...metricsService,
  ...paymentMethodService,
  ...reportingService,
};
