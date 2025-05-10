
export type PayoutRequest = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "processing";
  requestDate: string;
  method: "paypal" | "bank" | "crypto";
  taskCompleted?: boolean;
};

export type WalletChartData = {
  name: string;
  amount: number;
};
