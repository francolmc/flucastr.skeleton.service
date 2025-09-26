/**
 * Configuration exports
 * Centralized export file for all configuration modules
 */

// Database configuration
export { default as databaseConfig } from './database.config';
export type { DatabaseConfig } from './database.config';
export {
  getDatabaseUrl,
  isDatabaseConfigValid,
  getDatabaseConnectionInfo,
  getEnvironmentSpecificConfig,
} from './database.config';

// Logging configuration
export { default as loggingConfig } from './logging.config';
export type { LoggingConfig } from './logging.config';
export {
  createWinstonConfig,
  LoggingContexts,
  LogLevels,
  LoggingUtils,
} from './logging.config';

// Swagger configuration
export { default as swaggerConfig } from './swagger.config';
export type { SwaggerConfig } from './swagger.config';
export {
  createSwaggerDocumentBuilder,
  createSwaggerDocumentOptions,
  createSwaggerUIOptions,
  SwaggerUtils,
} from './swagger.config';

// App configuration
export { default as appConfig } from './app.config';
export type { AppConfig } from './app.config';
export { AppConfigUtils } from './app.config';

// JWT configuration
export { default as jwtConfig } from './jwt.config';
export type { JwtConfig } from './jwt.config';
export { JwtConfigUtils } from './jwt.config';

// Environment validation
export {
  validateEnvironmentVariables,
  envValidationSchema,
  EnvValidationUtils,
} from './env.validation';
export type { ValidatedEnvironmentVariables } from './env.validation';

// Re-export all configuration types and utilities
export * from './database.config';
export * from './logging.config';
export * from './swagger.config';
export * from './app.config';
export * from './env.validation';
