export interface ErrorLogEntry {
  timestamp: Date;
  error: Error;
  context?: string;
  userId?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100;

  log(error: Error, context?: string) {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      error,
      context,
      userId: this.getCurrentUserId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: error.stack,
    };

    this.logs.unshift(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console log for development
    console.error('Error logged:', entry);

    // Send to monitoring service
    this.sendToExternalService(entry);
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  private getCurrentUserId(): string | undefined {
    // This would typically get the current user ID from your auth context
    // For now, we'll return undefined
    return undefined;
  }

  private async sendToExternalService(entry: ErrorLogEntry) {
    try {
      const { monitoringService } = await import('@/services/monitoringService');
      await monitoringService.error(
        entry.error.message,
        'high',
        {
          context: entry.context,
          userId: entry.userId,
          url: entry.url,
          stack: entry.stack,
          userAgent: entry.userAgent
        }
      );
    } catch (error) {
      console.error('Failed to send error to external service:', error);
    }
  }
}

export const errorLogger = new ErrorLogger();
