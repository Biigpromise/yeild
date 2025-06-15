export type PayoutRequest = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "processing" | "processed";
  requestDate: string;
  method: "paypal" | "bank" | "crypto";
  taskCompleted?: boolean;
  processingDate?: string;
  completionDate?: string;
  notificationSent?: boolean;
};

export type WalletChartData = {
  name: string;
  amount: number;
  pending?: number;
};

export type PayoutStats = {
  totalPending: number;
  totalProcessed: number;
  totalRejected: number;
  weeklyVolume: number;
};
