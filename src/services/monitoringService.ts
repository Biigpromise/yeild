type EventType = 'error' | 'warning' | 'info' | 'success' | 'metric';
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

interface MonitoringEvent {
  event_type: EventType;
  message: string;
  severity: SeverityLevel;
  metadata?: Record<string, any>;
}

const WEBHOOK_URL = 'https://kbyjeadlmplgzisiwyrz.supabase.co/functions/v1/process-webhook?service=yeild';

class MonitoringService {
  private async sendEvent(event: MonitoringEvent): Promise<void> {
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send monitoring event:', error);
    }
  }

  error(message: string, severity: SeverityLevel = 'high', metadata?: Record<string, any>) {
    return this.sendEvent({ event_type: 'error', message, severity, metadata });
  }

  warning(message: string, severity: SeverityLevel = 'medium', metadata?: Record<string, any>) {
    return this.sendEvent({ event_type: 'warning', message, severity, metadata });
  }

  info(message: string, severity: SeverityLevel = 'low', metadata?: Record<string, any>) {
    return this.sendEvent({ event_type: 'info', message, severity, metadata });
  }

  success(message: string, severity: SeverityLevel = 'low', metadata?: Record<string, any>) {
    return this.sendEvent({ event_type: 'success', message, severity, metadata });
  }

  metric(message: string, severity: SeverityLevel = 'low', metadata?: Record<string, any>) {
    return this.sendEvent({ event_type: 'metric', message, severity, metadata });
  }
}

export const monitoringService = new MonitoringService();
