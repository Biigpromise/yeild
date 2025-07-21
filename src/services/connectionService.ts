
import { supabase } from '@/integrations/supabase/client';

export class ConnectionService {
  private static instance: ConnectionService;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private isConnected = true;
  private listeners: Array<(connected: boolean) => void> = [];

  static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const connected = !error;
      this.updateConnectionStatus(connected);
      return connected;
    } catch (error) {
      console.error('Connection check failed:', error);
      this.updateConnectionStatus(false);
      return false;
    }
  }

  private updateConnectionStatus(connected: boolean) {
    if (this.isConnected !== connected) {
      this.isConnected = connected;
      this.listeners.forEach(listener => listener(connected));
    }
  }

  onConnectionChange(listener: (connected: boolean) => void) {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  startMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    this.connectionCheckInterval = setInterval(() => {
      this.checkConnection();
    }, 30000); // Check every 30 seconds
  }

  stopMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const connectionService = ConnectionService.getInstance();
