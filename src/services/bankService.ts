
export interface Bank {
  name: string;
  code: string;
  type: 'traditional' | 'microfinance' | 'fintech';
  logo?: string;
}

export const NIGERIAN_BANKS: Bank[] = [
  // Traditional Banks
  { name: "Access Bank", code: "044", type: "traditional" },
  { name: "Citibank Nigeria", code: "023", type: "traditional" },
  { name: "Diamond Bank", code: "063", type: "traditional" },
  { name: "Ecobank Nigeria", code: "050", type: "traditional" },
  { name: "Fidelity Bank", code: "070", type: "traditional" },
  { name: "First Bank of Nigeria", code: "011", type: "traditional" },
  { name: "First City Monument Bank", code: "214", type: "traditional" },
  { name: "Guaranty Trust Bank", code: "058", type: "traditional" },
  { name: "Heritage Bank", code: "030", type: "traditional" },
  { name: "Keystone Bank", code: "082", type: "traditional" },
  { name: "Polaris Bank", code: "076", type: "traditional" },
  { name: "Providus Bank", code: "101", type: "traditional" },
  { name: "Stanbic IBTC Bank", code: "221", type: "traditional" },
  { name: "Standard Chartered Bank", code: "068", type: "traditional" },
  { name: "Sterling Bank", code: "232", type: "traditional" },
  { name: "Union Bank of Nigeria", code: "032", type: "traditional" },
  { name: "United Bank For Africa", code: "033", type: "traditional" },
  { name: "Unity Bank", code: "215", type: "traditional" },
  { name: "Wema Bank", code: "035", type: "traditional" },
  { name: "Zenith Bank", code: "057", type: "traditional" },

  // Microfinance Banks
  { name: "Opay", code: "999992", type: "microfinance" },
  { name: "Moniepoint", code: "50515", type: "microfinance" },
  { name: "Palmpay", code: "999991", type: "microfinance" },
  { name: "Kuda Bank", code: "50211", type: "microfinance" },
  { name: "VFD Microfinance Bank", code: "566", type: "microfinance" },
  { name: "Mintyn", code: "50548", type: "microfinance" },
  { name: "Sparkle Microfinance Bank", code: "51310", type: "microfinance" },
  { name: "Rubies MFB", code: "125", type: "microfinance" },
  { name: "Hackman Microfinance Bank", code: "51251", type: "microfinance" },
  { name: "NPF MicroFinance Bank", code: "552", type: "microfinance" },

  // Fintech Banks
  { name: "Carbon", code: "565", type: "fintech" },
  { name: "Eyowo", code: "50126", type: "fintech" },
  { name: "FairMoney Microfinance Bank", code: "51318", type: "fintech" },
  { name: "Renmoney MFB", code: "50544", type: "fintech" },
  { name: "Quickteller Paypoint", code: "999999", type: "fintech" },
];

export const getBankByCode = (code: string): Bank | undefined => {
  return NIGERIAN_BANKS.find(bank => bank.code === code);
};

export const getBanksByType = (type: Bank['type']): Bank[] => {
  return NIGERIAN_BANKS.filter(bank => bank.type === type);
};

export const searchBanks = (query: string): Bank[] => {
  const lowerQuery = query.toLowerCase();
  return NIGERIAN_BANKS.filter(bank => 
    bank.name.toLowerCase().includes(lowerQuery) ||
    bank.code.includes(query)
  );
};
