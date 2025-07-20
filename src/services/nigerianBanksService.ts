
export interface NigerianBank {
  name: string;
  code: string;
  type: 'traditional' | 'digital';
  flutterwaveCode?: string; // Flutterwave-specific code
}

export const nigerianBanks: NigerianBank[] = [
  // Digital Banks (Faster processing)
  { name: 'OPay', code: '999992', type: 'digital', flutterwaveCode: '999992' },
  { name: 'Moniepoint', code: '50515', type: 'digital', flutterwaveCode: '50515' },
  { name: 'PalmPay', code: '999991', type: 'digital', flutterwaveCode: '999991' },
  { name: 'Kuda Bank', code: '50211', type: 'digital', flutterwaveCode: '50211' },
  { name: 'Rubies Bank', code: '125', type: 'digital', flutterwaveCode: '125' },
  
  // Traditional Banks
  { name: 'Access Bank', code: '044', type: 'traditional', flutterwaveCode: '044' },
  { name: 'Guaranty Trust Bank', code: '058', type: 'traditional', flutterwaveCode: '058' },
  { name: 'First Bank of Nigeria', code: '011', type: 'traditional', flutterwaveCode: '011' },
  { name: 'United Bank for Africa', code: '033', type: 'traditional', flutterwaveCode: '033' },
  { name: 'Zenith Bank', code: '057', type: 'traditional', flutterwaveCode: '057' },
  { name: 'Fidelity Bank', code: '070', type: 'traditional', flutterwaveCode: '070' },
  { name: 'Sterling Bank', code: '232', type: 'traditional', flutterwaveCode: '232' },
  { name: 'Wema Bank', code: '035', type: 'traditional', flutterwaveCode: '035' },
  { name: 'First City Monument Bank', code: '214', type: 'traditional', flutterwaveCode: '214' },
  { name: 'Union Bank of Nigeria', code: '032', type: 'traditional', flutterwaveCode: '032' },
  { name: 'Ecobank Nigeria', code: '050', type: 'traditional', flutterwaveCode: '050' },
  { name: 'Heritage Bank', code: '030', type: 'traditional', flutterwaveCode: '030' },
  { name: 'Keystone Bank', code: '082', type: 'traditional', flutterwaveCode: '082' },
  { name: 'Polaris Bank', code: '076', type: 'traditional', flutterwaveCode: '076' },
  { name: 'Stanbic IBTC Bank', code: '221', type: 'traditional', flutterwaveCode: '221' },
  { name: 'Standard Chartered Bank', code: '068', type: 'traditional', flutterwaveCode: '068' },
  { name: 'Citibank Nigeria', code: '023', type: 'traditional', flutterwaveCode: '023' },
];

export const getBankByCode = (code: string): NigerianBank | undefined => {
  return nigerianBanks.find(bank => bank.code === code);
};

export const getFlutterwaveCode = (bankCode: string): string => {
  const bank = getBankByCode(bankCode);
  return bank?.flutterwaveCode || bankCode;
};

export const getBankName = (code: string): string => {
  const bank = getBankByCode(code);
  return bank?.name || 'Unknown Bank';
};
