/**
 * Advanced logging system with different levels and structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private sessionId: string;
  private userId?: string;
  private isDevelopment: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      userId: this.userId,
      sessionId: this.sessionId,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, userId } = entry;
    const userInfo = userId ? ` [User: ${userId}]` : '';
    const contextInfo = context ? ` ${JSON.stringify(context)}` : '';
    
    return `[${timestamp}] ${level.toUpperCase()}${userInfo}: ${message}${contextInfo}`;
  }

  private sendToService(entry: LogEntry) {
    // In production, send logs to logging service
    if (!this.isDevelopment && (entry.level === 'warn' || entry.level === 'error')) {
      // This would integrate with services like Sentry, LogRocket, etc.
      console.log('Sending to logging service:', entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, context);
    console.debug(this.formatMessage(entry));
    this.sendToService(entry);
  }

  info(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, context);
    console.info(this.formatMessage(entry));
    this.sendToService(entry);
  }

  warn(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, context);
    console.warn(this.formatMessage(entry));
    this.sendToService(entry);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createLogEntry('error', message, context, error);
    console.error(this.formatMessage(entry), error);
    this.sendToService(entry);
  }

  // API call logging
  apiCall(method: string, url: string, status: number, duration: number) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    const context = {
      method,
      url,
      status,
      duration,
      type: 'api_call',
    };
    
    if (level === 'error') {
      this.error(`API ${method} ${url}`, undefined, context);
    } else if (level === 'warn') {
      this.warn(`API ${method} ${url}`, context);
    } else {
      this.info(`API ${method} ${url}`, context);
    }
  }

  // User action logging
  userAction(action: string, context?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      ...context,
      type: 'user_action',
    });
  }

  // Performance logging
  performance(metric: string, value: number, context?: Record<string, any>) {
    this.info(`Performance: ${metric}`, {
      ...context,
      metric,
      value,
      type: 'performance',
    });
  }

  // Error boundary logging
  errorBoundary(error: Error, errorInfo: any) {
    this.error('Error boundary caught error', error, {
      errorInfo,
      type: 'error_boundary',
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Performance monitoring utilities
export function measurePerformance<T>(
  fn: () => T,
  name: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  logger.performance(name, end - start);
  
  return result;
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  name: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  logger.performance(name, end - start);
  
  return result;
}