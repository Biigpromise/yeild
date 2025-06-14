
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details: any;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'failed_attempts' | 'privilege_escalation' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
}

export interface BackupStatus {
  id: string;
  type: 'database' | 'files' | 'configuration';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  size?: string;
  location?: string;
}

export const adminSecurityService = {
  // Audit logging
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_audit_logs',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },

  async logAction(action: string, resource: string, resourceId?: string, details?: any): Promise<void> {
    try {
      await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'log_audit_action',
          data: { action, resource, resourceId, details }
        }
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  },

  // Security monitoring
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_security_alerts'
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return [];
    }
  },

  async updateAlertStatus(alertId: string, status: string, notes?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'update_security_alert',
          data: { alertId, status, notes }
        }
      });

      if (error) throw error;
      toast.success('Alert status updated');
      return true;
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast.error('Failed to update alert status');
      return false;
    }
  },

  // Backup management
  async getBackupStatus(): Promise<BackupStatus[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_backup_status'
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching backup status:', error);
      return [];
    }
  },

  async initiateBackup(type: 'database' | 'files' | 'configuration'): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'initiate_backup',
          data: { type }
        }
      });

      if (error) throw error;
      toast.success(`${type} backup initiated`);
      return true;
    } catch (error) {
      console.error('Error initiating backup:', error);
      toast.error('Failed to initiate backup');
      return false;
    }
  }
};
