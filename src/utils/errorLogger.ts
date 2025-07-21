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

    // In production, you might want to send to an external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry);
    }
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
      // This would send to your error tracking service
      // For now, we'll just log it
      console.log('Would send to external service:', entry);
    } catch (error) {
      console.error('Failed to send error to external service:', error);
    }
  }
}

export const errorLogger = new ErrorLogger();
