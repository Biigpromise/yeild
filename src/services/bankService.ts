
export interface NigerianBank {
  name: string;
  code: string;
  type: 'traditional' | 'microfinance' | 'fintech';
  shortName?: string;
  isActive: boolean;
  paystackSupported?: boolean;
  paystackCode?: string;
}

export const NIGERIAN_BANKS: NigerianBank[] = [
  // Traditional Banks (Most supported by Paystack)
  { name: "Access Bank", code: "044", type: "traditional", shortName: "Access", isActive: true, paystackSupported: true },
  { name: "Citibank Nigeria", code: "023", type: "traditional", shortName: "Citibank", isActive: true, paystackSupported: true },
  { name: "Diamond Bank", code: "063", type: "traditional", shortName: "Diamond", isActive: false },
  { name: "Ecobank Nigeria", code: "050", type: "traditional", shortName: "Ecobank", isActive: true, paystackSupported: true },
  { name: "Fidelity Bank", code: "070", type: "traditional", shortName: "Fidelity", isActive: true, paystackSupported: true },
  { name: "First Bank of Nigeria", code: "011", type: "traditional", shortName: "First Bank", isActive: true, paystackSupported: true },
  { name: "First City Monument Bank", code: "214", type: "traditional", shortName: "FCMB", isActive: true, paystackSupported: true },
  { name: "Guaranty Trust Bank", code: "058", type: "traditional", shortName: "GTBank", isActive: true, paystackSupported: true },
  { name: "Heritage Bank", code: "030", type: "traditional", shortName: "Heritage", isActive: true, paystackSupported: true },
  { name: "Keystone Bank", code: "082", type: "traditional", shortName: "Keystone", isActive: true, paystackSupported: true },
  { name: "Polaris Bank", code: "076", type: "traditional", shortName: "Polaris", isActive: true, paystackSupported: true },
  { name: "Providus Bank", code: "101", type: "traditional", shortName: "Providus", isActive: true, paystackSupported: true },
  { name: "Stanbic IBTC Bank", code: "221", type: "traditional", shortName: "Stanbic IBTC", isActive: true, paystackSupported: true },
  { name: "Standard Chartered Bank", code: "068", type: "traditional", shortName: "Standard Chartered", isActive: true, paystackSupported: true },
  { name: "Sterling Bank", code: "232", type: "traditional", shortName: "Sterling", isActive: true, paystackSupported: true },
  { name: "SunTrust Bank", code: "100", type: "traditional", shortName: "SunTrust", isActive: true, paystackSupported: true },
  { name: "Union Bank of Nigeria", code: "032", type: "traditional", shortName: "Union Bank", isActive: true, paystackSupported: true },
  { name: "United Bank For Africa", code: "033", type: "traditional", shortName: "UBA", isActive: true, paystackSupported: true },
  { name: "Unity Bank", code: "215", type: "traditional", shortName: "Unity", isActive: true, paystackSupported: true },
  { name: "Wema Bank", code: "035", type: "traditional", shortName: "Wema", isActive: true, paystackSupported: true },
  { name: "Zenith Bank", code: "057", type: "traditional", shortName: "Zenith", isActive: true, paystackSupported: true },

  // Microfinance Banks (Limited Paystack support)
  { name: "LAPO Microfinance Bank", code: "090177", type: "microfinance", shortName: "LAPO MFB", isActive: true, paystackSupported: false },
  { name: "Accion Microfinance Bank", code: "090134", type: "microfinance", shortName: "Accion MFB", isActive: true, paystackSupported: false },
  { name: "Advans La Fayette Microfinance Bank", code: "090155", type: "microfinance", shortName: "Advans MFB", isActive: true, paystackSupported: false },
  { name: "Bowen Microfinance Bank", code: "090148", type: "microfinance", shortName: "Bowen MFB", isActive: true, paystackSupported: false },
  { name: "FINCA Microfinance Bank", code: "090138", type: "microfinance", shortName: "FINCA MFB", isActive: true, paystackSupported: false },
  { name: "Fortis Microfinance Bank", code: "090145", type: "microfinance", shortName: "Fortis MFB", isActive: true, paystackSupported: false },
  { name: "Grooming Microfinance Bank", code: "090195", type: "microfinance", shortName: "Grooming MFB", isActive: true, paystackSupported: false },
  { name: "Hasal Microfinance Bank", code: "090121", type: "microfinance", shortName: "Hasal MFB", isActive: true, paystackSupported: false },
  { name: "Mutual Benefits Microfinance Bank", code: "090190", type: "microfinance", shortName: "Mutual Benefits MFB", isActive: true, paystackSupported: false },
  { name: "NPF Microfinance Bank", code: "090197", type: "microfinance", shortName: "NPF MFB", isActive: true, paystackSupported: false },

  // Fintech Banks (Limited Paystack support - using traditional bank codes where possible)
  { name: "Kuda Bank", code: "090267", type: "fintech", shortName: "Kuda", isActive: true, paystackSupported: false },
  { name: "Opay", code: "999992", type: "fintech", shortName: "Opay", isActive: true, paystackSupported: false, paystackCode: "304" },
  { name: "PalmPay", code: "999991", type: "fintech", shortName: "PalmPay", isActive: true, paystackSupported: false },
  { name: "Moniepoint", code: "50515", type: "fintech", shortName: "Moniepoint", isActive: true, paystackSupported: false },
  { name: "Carbon", code: "565", type: "fintech", shortName: "Carbon", isActive: true, paystackSupported: false },
  { name: "Rubies Bank", code: "125", type: "fintech", shortName: "Rubies", isActive: true, paystackSupported: false },
  { name: "VFD Microfinance Bank", code: "566", type: "fintech", shortName: "VFD", isActive: true, paystackSupported: false },
  { name: "Sparkle Microfinance Bank", code: "51310", type: "fintech", shortName: "Sparkle", isActive: true, paystackSupported: false },
  { name: "Eyowo", code: "50126", type: "fintech", shortName: "Eyowo", isActive: true, paystackSupported: false },
  { name: "Paga", code: "100002", type: "fintech", shortName: "Paga", isActive: true, paystackSupported: false },
  { name: "Paycom", code: "100004", type: "fintech", shortName: "Paycom", isActive: true, paystackSupported: false },
  { name: "Fairmoney Microfinance Bank", code: "51318", type: "fintech", shortName: "Fairmoney", isActive: true, paystackSupported: false },
  { name: "Renmoney Microfinance Bank", code: "90198", type: "fintech", shortName: "Renmoney", isActive: true, paystackSupported: false },
  { name: "Mint Fintech", code: "50200", type: "fintech", shortName: "Mint", isActive: true, paystackSupported: false },
  { name: "Paystack Technology Solutions Limited", code: "00226", type: "fintech", shortName: "Paystack", isActive: true, paystackSupported: true },
];

export const getBanksByType = (type: 'traditional' | 'microfinance' | 'fintech') => {
  return NIGERIAN_BANKS.filter(bank => bank.type === type && bank.isActive);
};

export const getPaystackSupportedBanks = () => {
  return NIGERIAN_BANKS.filter(bank => bank.isActive && bank.paystackSupported);
};

export const getBankByCode = (code: string) => {
  return NIGERIAN_BANKS.find(bank => bank.code === code);
};

export const getBankByName = (name: string) => {
  return NIGERIAN_BANKS.find(bank => 
    bank.name.toLowerCase().includes(name.toLowerCase()) || 
    bank.shortName?.toLowerCase().includes(name.toLowerCase())
  );
};

export const searchBanks = (query: string) => {
  const searchTerm = query.toLowerCase();
  return NIGERIAN_BANKS.filter(bank => 
    bank.isActive && (
      bank.name.toLowerCase().includes(searchTerm) ||
      bank.shortName?.toLowerCase().includes(searchTerm) ||
      bank.code.includes(searchTerm)
    )
  );
};

export const getActiveBanks = () => {
  return NIGERIAN_BANKS.filter(bank => bank.isActive);
};

export const formatBankName = (bank: NigerianBank) => {
  return bank.shortName || bank.name;
};

export const getPaystackCode = (bankCode: string) => {
  const bank = getBankByCode(bankCode);
  return bank?.paystackCode || bankCode;
};

export const isBankSupportedByPaystack = (bankCode: string) => {
  const bank = getBankByCode(bankCode);
  return bank?.paystackSupported === true;
};
