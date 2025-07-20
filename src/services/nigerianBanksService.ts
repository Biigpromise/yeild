
export interface NigerianBank {
  name: string;
  code: string;
  type: 'traditional' | 'digital' | 'microfinance';
}

export const nigerianBanks: NigerianBank[] = [
  // Digital Banks (Popular for quick transfers)
  { name: "OPay", code: "999992", type: "digital" },
  { name: "Moniepoint", code: "50515", type: "digital" },
  { name: "Kuda Bank", code: "50211", type: "digital" },
  { name: "Palmpay", code: "999991", type: "digital" },
  { name: "Carbon", code: "565", type: "digital" },
  
  // Traditional Banks
  { name: "Access Bank", code: "044", type: "traditional" },
  { name: "Guaranty Trust Bank", code: "058", type: "traditional" },
  { name: "First Bank of Nigeria", code: "011", type: "traditional" },
  { name: "United Bank For Africa", code: "033", type: "traditional" },
  { name: "Zenith Bank", code: "057", type: "traditional" },
  { name: "Fidelity Bank", code: "070", type: "traditional" },
  { name: "First City Monument Bank", code: "214", type: "traditional" },
  { name: "Sterling Bank", code: "232", type: "traditional" },
  { name: "Union Bank of Nigeria", code: "032", type: "traditional" },
  { name: "Wema Bank", code: "035", type: "traditional" },
  { name: "Polaris Bank", code: "076", type: "traditional" },
  { name: "Keystone Bank", code: "082", type: "traditional" },
  { name: "Ecobank Nigeria", code: "050", type: "traditional" },
  { name: "Heritage Bank", code: "030", type: "traditional" },
  { name: "Stanbic IBTC Bank", code: "221", type: "traditional" },
  { name: "Standard Chartered Bank", code: "068", type: "traditional" },
  { name: "Unity Bank", code: "215", type: "traditional" },
  { name: "Providus Bank", code: "101", type: "traditional" },
  
  // Microfinance Banks
  { name: "VFD Microfinance Bank", code: "566", type: "microfinance" },
  { name: "Rubies Bank", code: "125", type: "microfinance" },
  { name: "Sparkle Microfinance Bank", code: "51310", type: "microfinance" }
];

export const getBankByCode = (code: string): NigerianBank | undefined => {
  return nigerianBanks.find(bank => bank.code === code);
};

export const getBanksByType = (type: 'traditional' | 'digital' | 'microfinance'): NigerianBank[] => {
  return nigerianBanks.filter(bank => bank.type === type);
};

export const searchBanks = (query: string): NigerianBank[] => {
  const lowercaseQuery = query.toLowerCase();
  return nigerianBanks.filter(bank => 
    bank.name.toLowerCase().includes(lowercaseQuery) ||
    bank.code.includes(query)
  );
};
