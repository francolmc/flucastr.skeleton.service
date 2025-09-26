import { registerAs } from '@nestjs/config';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

/**
 * Interfaz para la configuración de logging
 */
export interface LoggingConfig {
  level: string;
  enableFileLogging: boolean;
  enableConsoleLogging: boolean;
  logDirectory: string;
  maxFiles: number;
  maxSize: string;
  enableRequestLogging: boolean;
  enableErrorLogging: boolean;
  enableQueryLogging: boolean;
  enableMetrics: boolean;
}

/**
 * Configuración de logging basada en el ambiente
 */
export default registerAs('logging', (): LoggingConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv.includes('test');

  return {
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    enableFileLogging:
      process.env.ENABLE_FILE_LOGGING === 'true' || isProduction,
    enableConsoleLogging: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
    logDirectory: process.env.LOG_DIRECTORY || './logs',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10),
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    enableRequestLogging:
      process.env.ENABLE_REQUEST_LOGGING !== 'false' && !isTest,
    enableErrorLogging: process.env.ENABLE_ERROR_LOGGING !== 'false',
    enableQueryLogging:
      process.env.ENABLE_QUERY_LOGGING === 'true' || isDevelopment,
    enableMetrics: process.env.ENABLE_METRICS !== 'false' && !isTest,
  };
});

/**
 * Crea la configuración de Winston para nest-winston
 */
export const createWinstonConfig = (): WinstonModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv.includes('test');

  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');
  const enableFileLogging =
    process.env.ENABLE_FILE_LOGGING === 'true' || isProduction;
  const enableConsoleLogging = process.env.ENABLE_CONSOLE_LOGGING !== 'false';
  const logDirectory = process.env.LOG_DIRECTORY || './logs';

  const transports: winston.transport[] = [];

  // Console transport
  if (enableConsoleLogging && !isTest) {
    transports.push(
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('Flucastr', {
            colors: true,
            prettyPrint: true,
            processId: true,
            appName: true,
          }),
        ),
      }),
    );
  }

  // File transports
  if (enableFileLogging) {
    // Combined logs
    transports.push(
      new winston.transports.File({
        filename: `${logDirectory}/combined.log`,
        level: logLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        maxsize:
          parseInt(process.env.LOG_MAX_SIZE?.replace('m', '') || '20', 10) *
          1024 *
          1024,
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10),
        tailable: true,
      }),
    );

    // Error logs
    transports.push(
      new winston.transports.File({
        filename: `${logDirectory}/error.log`,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        maxsize:
          parseInt(process.env.LOG_MAX_SIZE?.replace('m', '') || '20', 10) *
          1024 *
          1024,
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10),
        tailable: true,
      }),
    );

    // HTTP requests logs (solo en producción)
    if (isProduction) {
      transports.push(
        new winston.transports.File({
          filename: `${logDirectory}/requests.log`,
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              // Solo loggear requests HTTP
              const messageStr = String(message);
              if (
                messageStr.includes('[GET]') ||
                messageStr.includes('[POST]') ||
                messageStr.includes('[PUT]') ||
                messageStr.includes('[DELETE]') ||
                messageStr.includes('[PATCH]')
              ) {
                return JSON.stringify({ timestamp, level, message, ...meta });
              }
              return '';
            }),
          ),
          maxsize:
            parseInt(process.env.LOG_MAX_SIZE?.replace('m', '') || '20', 10) *
            1024 *
            1024,
          maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10),
          tailable: true,
        }),
      );
    }
  }

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    defaultMeta: {
      service: 'flucastr-lleva',
      environment: nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
    },
    transports,
    // Configuración adicional
    exitOnError: false,
    silent: isTest,
  };
};

/**
 * Configuración de logging para diferentes contextos
 */
export const LoggingContexts = {
  DATABASE: 'Database',
  HTTP: 'HTTP',
  AUTH: 'Authentication',
  TASKS: 'Tasks',
  HEALTH: 'Health',
  VALIDATION: 'Validation',
  SECURITY: 'Security',
  PERFORMANCE: 'Performance',
} as const;

/**
 * Niveles de log personalizados
 */
export const LogLevels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly',
} as const;

/**
 * Utilidades para logging estructurado
 */
export class LoggingUtils {
  /**
   * Formatea un mensaje de error con contexto
   */
  static formatError(
    error: Error,
    context?: string,
    metadata?: Record<string, any>,
  ) {
    return {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }

  /**
   * Formatea un mensaje de request HTTP
   */
  static formatHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    ip?: string,
  ) {
    return {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Formatea métricas de performance
   */
  static formatPerformanceMetric(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ) {
    return {
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }

  /**
   * Sanitiza datos sensibles antes del logging
   */
  static sanitizeData(data: unknown): unknown {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...(data as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
