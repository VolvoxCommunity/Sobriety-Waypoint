import * as Sentry from '@sentry/react-native';

// =============================================================================
// Types & Interfaces
// =============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'trace';

export interface Logger {
  debug(message: string, metadata?: Record<string, any>): void;
  info(message: string, metadata?: Record<string, any>): void;
  warn(message: string, metadata?: Record<string, any>): void;
  error(message: string, error?: Error, metadata?: Record<string, any>): void;
  trace(message: string, metadata?: Record<string, any>): void;
}

export enum LogCategory {
  AUTH = 'auth',
  NAVIGATION = 'navigation',
  DATABASE = 'database',
  API = 'http',
  UI = 'ui',
  STORAGE = 'storage',
  NOTIFICATION = 'notification',
  SYNC = 'sync',
  ERROR = 'error',
}

// =============================================================================
// Internal Functions
// =============================================================================

/**
 * Internal log function that handles Sentry breadcrumbs and console output
 */
function log(
  level: LogLevel,
  message: string,
  error?: Error,
  metadata?: Record<string, any>
): void {
  createBreadcrumb(level, message, error, metadata);

  if (__DEV__) {
    logToConsole(level, message, error, metadata);
  }
}

/**
 * Create Sentry breadcrumb with proper level mapping
 */
function createBreadcrumb(
  level: LogLevel,
  message: string,
  error?: Error,
  metadata?: Record<string, any>
): void {
  try {
    Sentry.addBreadcrumb({
      level: mapLevelToSentry(level),
      category: metadata?.category || 'log',
      message,
      data: {
        ...metadata,
        ...(error && { error: error.message, stack: error.stack }),
      },
      timestamp: Date.now() / 1000,
    });
  } catch {
    // Silently fail if Sentry not initialized
  }
}

/**
 * Map logger levels to Sentry breadcrumb levels
 */
function mapLevelToSentry(level: LogLevel): Sentry.SeverityLevel {
  const mapping: Record<LogLevel, Sentry.SeverityLevel> = {
    debug: 'debug',
    info: 'info',
    warn: 'warning',
    error: 'error',
    trace: 'debug',
  };
  return mapping[level];
}

/**
 * Output formatted log to console in development
 */
function logToConsole(
  level: LogLevel,
  message: string,
  error?: Error,
  metadata?: Record<string, any>
): void {
  const consoleMethod = getConsoleMethod(level);
  const formattedMessage = `[${level.toUpperCase()}] ${message}`;

  if (error) {
     
    consoleMethod(formattedMessage, error, metadata || '');
  } else if (metadata && Object.keys(metadata).length > 0) {
     
    consoleMethod(formattedMessage, metadata);
  } else {
     
    consoleMethod(formattedMessage);
  }
}

/**
 * Map log level to appropriate console method
 */
function getConsoleMethod(level: LogLevel): Console['log'] {
  const methods: Record<LogLevel, Console['log']> = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    trace: console.trace,
  };
  return methods[level];
}

// =============================================================================
// Exported Logger
// =============================================================================

/**
 * Universal logger that routes all logs through Sentry breadcrumbs
 * with development console fallback.
 *
 * @example
 * ```typescript
 * import { logger, LogCategory } from '@/lib/logger';
 *
 * // Basic logging
 * logger.info('User logged in');
 *
 * // With metadata
 * logger.info('Task completed', { taskId: '123', duration: 450 });
 *
 * // With category
 * logger.info('User signed in', {
 *   category: LogCategory.AUTH,
 *   userId: '123',
 * });
 *
 * // Errors with context
 * logger.error('Failed to fetch data', fetchError, { userId: '456' });
 * ```
 */
export const logger: Logger = {
  debug: (msg, meta) => log('debug', msg, undefined, meta),
  info: (msg, meta) => log('info', msg, undefined, meta),
  warn: (msg, meta) => log('warn', msg, undefined, meta),
  error: (msg, err, meta) => log('error', msg, err, meta),
  trace: (msg, meta) => log('trace', msg, undefined, meta),
};
