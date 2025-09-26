import * as Joi from 'joi';

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

/**
 * Interfaz para las variables de entorno validadas
 */
export interface ValidatedEnvironmentVariables {
  // =================================
  // APPLICATION CONFIGURATION
  // =================================
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  APP_NAME: string;
  APP_VERSION: string;
  APP_DESCRIPTION: string;
  BASE_URL: string;
  GLOBAL_PREFIX: string;

  // Application URLs and Origins
  ALLOWED_ORIGINS: string;
  TRUSTED_PROXIES: string;

  // =================================
  // DATABASE CONFIGURATION
  // =================================
  DATABASE_URL: string;
  DB_POOL_MIN: number;
  DB_POOL_MAX: number;

  // =================================
  // LOGGING CONFIGURATION
  // =================================
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
  ENABLE_FILE_LOGGING: boolean;
  ENABLE_CONSOLE_LOGGING: boolean;
  ENABLE_ERROR_LOGGING: boolean;
  ENABLE_QUERY_LOGGING: boolean;
  ENABLE_METRICS: boolean;
  LOG_DIRECTORY: string;
  LOG_MAX_FILES: string;
  LOG_MAX_SIZE: string;

  // =================================
  // JWT CONFIGURATION
  // =================================
  JWT_ENABLED: boolean;
  JWT_SECRET: string;
  JWT_ALGORITHM: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  JWT_IGNORE_EXPIRATION: boolean;
  JWT_CLOCK_TOLERANCE: number;
  JWT_MAX_AGE?: string;
  JWT_EXTRACT_FROM_HEADER: boolean;
  JWT_EXTRACT_FROM_QUERY: boolean;
  JWT_EXTRACT_FROM_COOKIE: boolean;
  JWT_HEADER_NAME: string;
  JWT_QUERY_PARAM: string;
  JWT_COOKIE_NAME: string;
  JWT_ROLES_CLAIM_KEY: string;
  JWT_PERMISSIONS_CLAIM_KEY: string;
  JWT_USER_ID_CLAIM_KEY: string;
  JWT_TENANT_ID_CLAIM_KEY: string;
  JWT_ENABLE_CACHE: boolean;
  JWT_CACHE_TTL: number;
  JWT_ENABLE_LOGGING: boolean;
  JWT_LOG_FAILED_ATTEMPTS: boolean;
  JWT_PUBLIC_KEY?: string;

  // =================================
  // SWAGGER CONFIGURATION
  // =================================
  SWAGGER_ENABLED: boolean;
  SWAGGER_PATH: string;
  SWAGGER_TITLE: string;
  SWAGGER_DESCRIPTION: string;
  SWAGGER_VERSION: string;
  SWAGGER_CONTACT_NAME: string;
  SWAGGER_CONTACT_URL: string;
  SWAGGER_CONTACT_EMAIL: string;
  SWAGGER_LICENSE_NAME: string;
  SWAGGER_LICENSE_URL: string;
  SWAGGER_SERVER_URL: string;

  // Swagger Security
  API_KEY_ENABLED: boolean;
  API_KEY_NAME: string;
  API_KEY_LOCATION: 'header' | 'query' | 'cookie';

  // Swagger UI Options
  SWAGGER_DEEP_LINKING: boolean;
  SWAGGER_DISPLAY_OPERATION_ID: boolean;
  SWAGGER_DEFAULT_MODELS_EXPAND_DEPTH: number;
  SWAGGER_DEFAULT_MODEL_EXPAND_DEPTH: number;
  SWAGGER_DEFAULT_MODEL_RENDERING: 'example' | 'model';
  SWAGGER_DISPLAY_REQUEST_DURATION: boolean;
  SWAGGER_DOC_EXPANSION: 'list' | 'full' | 'none';
  SWAGGER_FILTER: boolean;
  SWAGGER_MAX_DISPLAYED_TAGS: number;
  SWAGGER_SHOW_EXTENSIONS: boolean;
  SWAGGER_SHOW_COMMON_EXTENSIONS: boolean;
  SWAGGER_TRY_IT_OUT_ENABLED: boolean;

  // =================================
  // SECURITY CONFIGURATION
  // =================================
  // Helmet Security Headers
  HELMET_ENABLED: boolean;
  HELMET_CSP_ENABLED: boolean;
  HELMET_COEP_ENABLED: boolean;
  HELMET_COOP_ENABLED: boolean;
  HELMET_CORP_ENABLED: boolean;
  HELMET_DNS_PREFETCH_CONTROL_ENABLED: boolean;
  HELMET_FRAMEGUARD_ENABLED: boolean;
  HELMET_HIDE_POWERED_BY_ENABLED: boolean;
  HELMET_HSTS_ENABLED: boolean;
  HELMET_IE_NO_OPEN_ENABLED: boolean;
  HELMET_NO_SNIFF_ENABLED: boolean;
  HELMET_ORIGIN_AGENT_CLUSTER_ENABLED: boolean;
  HELMET_PERMITTED_CROSS_DOMAIN_POLICIES_ENABLED: boolean;
  HELMET_REFERRER_POLICY_ENABLED: boolean;
  HELMET_XSS_FILTER_ENABLED: boolean;

  // =================================
  // CORS CONFIGURATION
  // =================================
  CORS_ENABLED: boolean;
  CORS_ORIGIN: string;
  CORS_METHODS: string;
  CORS_ALLOWED_HEADERS: string;
  CORS_EXPOSED_HEADERS: string;
  CORS_CREDENTIALS: boolean;
  CORS_MAX_AGE: number;
  CORS_PREFLIGHT_CONTINUE: boolean;
  CORS_OPTIONS_SUCCESS_STATUS: number;

  // =================================
  // RATE LIMITING CONFIGURATION
  // =================================
  RATE_LIMIT_ENABLED: boolean;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_MESSAGE: string;
  RATE_LIMIT_STANDARD_HEADERS: boolean;
  RATE_LIMIT_LEGACY_HEADERS: boolean;
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: boolean;
  RATE_LIMIT_SKIP_FAILED_REQUESTS: boolean;

  // =================================
  // VALIDATION CONFIGURATION
  // =================================
  VALIDATION_WHITELIST: boolean;
  VALIDATION_FORBID_NON_WHITELISTED: boolean;
  VALIDATION_TRANSFORM: boolean;
  VALIDATION_DISABLE_ERROR_MESSAGES: boolean;
  VALIDATION_VALIDATE_CUSTOM_DECORATORS: boolean;
  VALIDATION_ENABLE_DEBUG_MESSAGES: boolean;

  // =================================
  // VERSIONING CONFIGURATION
  // =================================
  VERSIONING_ENABLED: boolean;
  VERSIONING_TYPE: 'uri' | 'header' | 'media' | 'custom';
  VERSIONING_PREFIX: string;
  VERSIONING_DEFAULT_VERSION: string;
  VERSIONING_HEADER: string;
  VERSIONING_KEY: string;

  // =================================
  // LIMITS CONFIGURATION
  // =================================
  REQUEST_TIMEOUT: number;
  BODY_LIMIT: string;
  PARAMETER_LIMIT: number;
  JSON_LIMIT: string;
  URL_ENCODED_LIMIT: string;
  FILE_UPLOAD_LIMIT: string;

  // =================================
  // HEALTH CHECK CONFIGURATION
  // =================================
  HEALTH_CHECK_ENABLED: boolean;
  HEALTH_CHECK_PATH: string;
  GRACEFUL_SHUTDOWN_TIMEOUT: number;
  MEMORY_HEAP_THRESHOLD: number;
  MEMORY_RSS_THRESHOLD: number;
  DISK_THRESHOLD: number;

  // =================================
  // MONITORING CONFIGURATION
  // =================================
  MONITORING_ENABLED: boolean;
  METRICS_PATH: string;
  PROMETHEUS_ENABLED: boolean;
  JAEGER_ENABLED: boolean;
  SENTRY_ENABLED: boolean;
  SENTRY_DSN?: string;
}

/**
 * Schema de validación para las variables de entorno
 */
export const envValidationSchema = Joi.object<ValidatedEnvironmentVariables>({
  // =================================
  // APPLICATION CONFIGURATION (REQUIRED)
  // =================================
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Environment in which the application is running'),

  PORT: Joi.number()
    .port()
    .default(3001)
    .description('Port on which the application will listen'),

  HOST: Joi.string()
    .hostname()
    .default('0.0.0.0')
    .description('Host address for the application'),

  APP_NAME: Joi.string()
    .default('Flucastr Lleva - Service')
    .description('Name of the application'),

  APP_VERSION: Joi.string()
    .pattern(/^\d+\.\d+(\.\d+)?$/)
    .default('1.0.0')
    .description('Version of the application (semver format: x.y.z or x.y)'),

  APP_DESCRIPTION: Joi.string()
    .default('Microservicio para la plataforma Flucastr Lleva')
    .description('Description of the application'),

  BASE_URL: Joi.string()
    .uri()
    .default('http://localhost:3001')
    .description('Base URL of the application'),

  GLOBAL_PREFIX: Joi.string()
    .pattern(/^[a-zA-Z0-9]+$/)
    .default('v1')
    .description('Global API prefix'),

  ALLOWED_ORIGINS: Joi.string()
    .default('http://localhost:3000,http://localhost:3001')
    .description('Comma-separated list of allowed CORS origins'),

  TRUSTED_PROXIES: Joi.string()
    .allow('')
    .default('')
    .description('Comma-separated list of trusted proxy IPs'),

  // =================================
  // DATABASE CONFIGURATION (REQUIRED)
  // =================================
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required()
    .description('PostgreSQL database connection URL'),

  DB_POOL_MIN: Joi.number()
    .integer()
    .min(1)
    .default(2)
    .description('Minimum number of database connections in pool'),

  DB_POOL_MAX: Joi.number()
    .integer()
    .min(1)
    .default(10)
    .description('Maximum number of database connections in pool'),

  // =================================
  // LOGGING CONFIGURATION
  // =================================
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info')
    .description('Logging level'),

  ENABLE_FILE_LOGGING: Joi.boolean()
    .default(true)
    .description('Enable file-based logging'),

  ENABLE_CONSOLE_LOGGING: Joi.boolean()
    .default(true)
    .description('Enable console logging'),

  ENABLE_ERROR_LOGGING: Joi.boolean()
    .default(true)
    .description('Enable error logging'),

  ENABLE_QUERY_LOGGING: Joi.boolean()
    .default(false)
    .description('Enable database query logging'),

  ENABLE_METRICS: Joi.boolean()
    .default(true)
    .description('Enable metrics collection'),

  LOG_DIRECTORY: Joi.string()
    .default('./logs')
    .description('Directory for log files'),

  LOG_MAX_FILES: Joi.string()
    .default('14')
    .description('Maximum number of log files to keep'),

  LOG_MAX_SIZE: Joi.string()
    .default('20m')
    .description('Maximum size of each log file'),

  // =================================
  // JWT CONFIGURATION
  // =================================
  JWT_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable JWT authentication'),

  JWT_SECRET: Joi.string()
    .min(32)
    .default('your-super-secret-jwt-key-change-in-production')
    .description('JWT secret key for token validation'),

  JWT_ALGORITHM: Joi.string()
    .valid('HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512')
    .default('HS256')
    .description('JWT algorithm for token validation'),

  JWT_ISSUER: Joi.string()
    .default('flucastr-auth-service')
    .description('Expected JWT issuer'),

  JWT_AUDIENCE: Joi.string()
    .default('flucastr-services')
    .description('Expected JWT audience'),

  JWT_IGNORE_EXPIRATION: Joi.boolean()
    .default(false)
    .description('Ignore JWT expiration (only for development)'),

  JWT_CLOCK_TOLERANCE: Joi.number()
    .integer()
    .min(0)
    .max(300)
    .default(30)
    .description('JWT clock tolerance in seconds'),

  JWT_MAX_AGE: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .optional()
    .description('Maximum age of JWT tokens (e.g., 1d, 2h, 30m)'),

  JWT_EXTRACT_FROM_HEADER: Joi.boolean()
    .default(true)
    .description('Extract JWT from Authorization header'),

  JWT_EXTRACT_FROM_QUERY: Joi.boolean()
    .default(false)
    .description('Extract JWT from query parameter'),

  JWT_EXTRACT_FROM_COOKIE: Joi.boolean()
    .default(false)
    .description('Extract JWT from cookie'),

  JWT_HEADER_NAME: Joi.string()
    .default('Authorization')
    .description('Header name for JWT extraction'),

  JWT_QUERY_PARAM: Joi.string()
    .default('token')
    .description('Query parameter name for JWT extraction'),

  JWT_COOKIE_NAME: Joi.string()
    .default('access_token')
    .description('Cookie name for JWT extraction'),

  JWT_ROLES_CLAIM_KEY: Joi.string()
    .default('roles')
    .description('JWT claim key for user roles'),

  JWT_PERMISSIONS_CLAIM_KEY: Joi.string()
    .default('permissions')
    .description('JWT claim key for user permissions'),

  JWT_USER_ID_CLAIM_KEY: Joi.string()
    .default('sub')
    .description('JWT claim key for user ID'),

  JWT_TENANT_ID_CLAIM_KEY: Joi.string()
    .default('tenant_id')
    .description('JWT claim key for tenant ID'),

  JWT_ENABLE_CACHE: Joi.boolean()
    .default(false)
    .description('Enable JWT token caching'),

  JWT_CACHE_TTL: Joi.number()
    .integer()
    .min(60)
    .max(3600)
    .default(300)
    .description('JWT cache TTL in seconds'),

  JWT_ENABLE_LOGGING: Joi.boolean()
    .default(true)
    .description('Enable JWT logging'),

  JWT_LOG_FAILED_ATTEMPTS: Joi.boolean()
    .default(true)
    .description('Log failed JWT validation attempts'),

  JWT_PUBLIC_KEY: Joi.string()
    .optional()
    .description('JWT public key for RSA algorithms'),

  // =================================
  // SWAGGER CONFIGURATION
  // =================================
  SWAGGER_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable Swagger documentation'),

  SWAGGER_PATH: Joi.string()
    .pattern(/^[a-zA-Z0-9-_]+$/)
    .default('api')
    .description('Path for Swagger documentation'),

  SWAGGER_TITLE: Joi.string()
    .default('Flucastr Lleva - Service API')
    .description('Title for Swagger documentation'),

  SWAGGER_DESCRIPTION: Joi.string()
    .default('API del microservicio para la plataforma Flucastr Lleva')
    .description('Description for Swagger documentation'),

  SWAGGER_VERSION: Joi.string()
    .pattern(/^\d+\.\d+(\.\d+)?$/)
    .default('1.0.0')
    .description(
      'API version for Swagger documentation (semver format: x.y.z or x.y)',
    ),

  SWAGGER_CONTACT_NAME: Joi.string()
    .default('Flucastr Team')
    .description('Contact name for Swagger documentation'),

  SWAGGER_CONTACT_URL: Joi.string()
    .uri()
    .default('https://flucastr.com')
    .description('Contact URL for Swagger documentation'),

  SWAGGER_CONTACT_EMAIL: Joi.string()
    .email()
    .default('support@flucastr.com')
    .description('Contact email for Swagger documentation'),

  SWAGGER_LICENSE_NAME: Joi.string()
    .default('MIT')
    .description('License name for Swagger documentation'),

  SWAGGER_LICENSE_URL: Joi.string()
    .uri()
    .default('https://opensource.org/licenses/MIT')
    .description('License URL for Swagger documentation'),

  SWAGGER_SERVER_URL: Joi.string()
    .uri()
    .default('http://localhost:3001')
    .description('Server URL for Swagger documentation'),

  // Swagger Security
  API_KEY_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable API Key authentication in Swagger'),

  API_KEY_NAME: Joi.string()
    .default('X-API-Key')
    .description('API Key header name'),

  API_KEY_LOCATION: Joi.string()
    .valid('header', 'query', 'cookie')
    .default('header')
    .description('Location of API Key'),

  // Swagger UI Options
  SWAGGER_DEEP_LINKING: Joi.boolean()
    .default(true)
    .description('Enable deep linking in Swagger UI'),

  SWAGGER_DISPLAY_OPERATION_ID: Joi.boolean()
    .default(false)
    .description('Display operation IDs in Swagger UI'),

  SWAGGER_DEFAULT_MODELS_EXPAND_DEPTH: Joi.number()
    .integer()
    .min(-1)
    .default(1)
    .description('Default models expand depth in Swagger UI'),

  SWAGGER_DEFAULT_MODEL_EXPAND_DEPTH: Joi.number()
    .integer()
    .min(-1)
    .default(1)
    .description('Default model expand depth in Swagger UI'),

  SWAGGER_DEFAULT_MODEL_RENDERING: Joi.string()
    .valid('example', 'model')
    .default('example')
    .description('Default model rendering in Swagger UI'),

  SWAGGER_DISPLAY_REQUEST_DURATION: Joi.boolean()
    .default(true)
    .description('Display request duration in Swagger UI'),

  SWAGGER_DOC_EXPANSION: Joi.string()
    .valid('list', 'full', 'none')
    .default('list')
    .description('Default documentation expansion in Swagger UI'),

  SWAGGER_FILTER: Joi.boolean()
    .default(true)
    .description('Enable filtering in Swagger UI'),

  SWAGGER_MAX_DISPLAYED_TAGS: Joi.number()
    .integer()
    .default(-1)
    .description('Maximum number of tags to display in Swagger UI'),

  SWAGGER_SHOW_EXTENSIONS: Joi.boolean()
    .default(false)
    .description('Show extensions in Swagger UI'),

  SWAGGER_SHOW_COMMON_EXTENSIONS: Joi.boolean()
    .default(false)
    .description('Show common extensions in Swagger UI'),

  SWAGGER_TRY_IT_OUT_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable "Try it out" feature in Swagger UI'),

  // =================================
  // SECURITY CONFIGURATION
  // =================================
  // Helmet Security Headers
  HELMET_ENABLED: Joi.boolean()
    .default(Joi.ref('NODE_ENV', { adjust: (value) => value === 'production' }))
    .description('Enable Helmet security headers'),

  HELMET_CSP_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable Content Security Policy'),

  HELMET_COEP_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable Cross-Origin Embedder Policy'),

  HELMET_COOP_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable Cross-Origin Opener Policy'),

  HELMET_CORP_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable Cross-Origin Resource Policy'),

  HELMET_DNS_PREFETCH_CONTROL_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable DNS prefetch control'),

  HELMET_FRAMEGUARD_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable frameguard'),

  HELMET_HIDE_POWERED_BY_ENABLED: Joi.boolean()
    .default(true)
    .description('Hide X-Powered-By header'),

  HELMET_HSTS_ENABLED: Joi.boolean()
    .default(Joi.ref('NODE_ENV', { adjust: (value) => value === 'production' }))
    .description('Enable HTTP Strict Transport Security'),

  HELMET_IE_NO_OPEN_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable IE no open'),

  HELMET_NO_SNIFF_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable no sniff'),

  HELMET_ORIGIN_AGENT_CLUSTER_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable origin agent cluster'),

  HELMET_PERMITTED_CROSS_DOMAIN_POLICIES_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable permitted cross domain policies'),

  HELMET_REFERRER_POLICY_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable referrer policy'),

  HELMET_XSS_FILTER_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable XSS filter'),

  // =================================
  // CORS CONFIGURATION
  // =================================
  CORS_ENABLED: Joi.boolean().default(true).description('Enable CORS'),

  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3000,http://localhost:3001')
    .description('CORS allowed origins'),

  CORS_METHODS: Joi.string()
    .default('GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
    .description('CORS allowed methods'),

  CORS_ALLOWED_HEADERS: Joi.string()
    .default(
      'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-API-Key',
    )
    .description('CORS allowed headers'),

  CORS_EXPOSED_HEADERS: Joi.string()
    .default('X-Total-Count,X-Page-Count')
    .description('CORS exposed headers'),

  CORS_CREDENTIALS: Joi.boolean()
    .default(true)
    .description('CORS allow credentials'),

  CORS_MAX_AGE: Joi.number()
    .integer()
    .min(0)
    .default(86400)
    .description('CORS max age in seconds'),

  CORS_PREFLIGHT_CONTINUE: Joi.boolean()
    .default(false)
    .description('CORS preflight continue'),

  CORS_OPTIONS_SUCCESS_STATUS: Joi.number()
    .integer()
    .min(200)
    .max(299)
    .default(204)
    .description('CORS options success status'),

  // =================================
  // RATE LIMITING CONFIGURATION
  // =================================
  RATE_LIMIT_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable rate limiting'),

  RATE_LIMIT_WINDOW_MS: Joi.number()
    .integer()
    .min(1000)
    .default(900000)
    .description('Rate limit window in milliseconds'),

  RATE_LIMIT_MAX: Joi.number()
    .integer()
    .min(1)
    .default(100)
    .description('Maximum requests per window'),

  RATE_LIMIT_MESSAGE: Joi.string()
    .default('Too many requests from this IP, please try again later.')
    .description('Rate limit exceeded message'),

  RATE_LIMIT_STANDARD_HEADERS: Joi.boolean()
    .default(true)
    .description('Include standard rate limit headers'),

  RATE_LIMIT_LEGACY_HEADERS: Joi.boolean()
    .default(false)
    .description('Include legacy rate limit headers'),

  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: Joi.boolean()
    .default(false)
    .description('Skip successful requests in rate limiting'),

  RATE_LIMIT_SKIP_FAILED_REQUESTS: Joi.boolean()
    .default(false)
    .description('Skip failed requests in rate limiting'),

  // =================================
  // VALIDATION CONFIGURATION
  // =================================
  VALIDATION_WHITELIST: Joi.boolean()
    .default(true)
    .description('Strip properties that do not have decorators'),

  VALIDATION_FORBID_NON_WHITELISTED: Joi.boolean()
    .default(false)
    .description('Throw error if non-whitelisted properties are present'),

  VALIDATION_TRANSFORM: Joi.boolean()
    .default(true)
    .description('Transform payloads to DTO instances'),

  VALIDATION_DISABLE_ERROR_MESSAGES: Joi.boolean()
    .default(Joi.ref('NODE_ENV', { adjust: (value) => value === 'production' }))
    .description('Disable detailed error messages in production'),

  VALIDATION_VALIDATE_CUSTOM_DECORATORS: Joi.boolean()
    .default(true)
    .description('Validate custom decorators'),

  VALIDATION_ENABLE_DEBUG_MESSAGES: Joi.boolean()
    .default(
      Joi.ref('NODE_ENV', { adjust: (value) => value === 'development' }),
    )
    .description('Enable debug messages in development'),

  // =================================
  // VERSIONING CONFIGURATION
  // =================================
  VERSIONING_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable API versioning'),

  VERSIONING_TYPE: Joi.string()
    .valid('uri', 'header', 'media', 'custom')
    .default('uri')
    .description('API versioning type'),

  VERSIONING_PREFIX: Joi.string()
    .pattern(/^[a-zA-Z]+$/)
    .default('v')
    .description('API version prefix'),

  VERSIONING_DEFAULT_VERSION: Joi.string()
    .pattern(/^\d+$/)
    .default('1')
    .description('Default API version'),

  VERSIONING_HEADER: Joi.string()
    .default('X-API-Version')
    .description('Header name for version (when using header versioning)'),

  VERSIONING_KEY: Joi.string()
    .default('version')
    .description('Key name for version (when using custom versioning)'),

  // =================================
  // LIMITS CONFIGURATION
  // =================================
  REQUEST_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .default(30000)
    .description('Request timeout in milliseconds'),

  BODY_LIMIT: Joi.string()
    .pattern(/^\d+[kmg]?b$/i)
    .default('10mb')
    .description('Request body size limit'),

  PARAMETER_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(1000)
    .description('Maximum number of parameters'),

  JSON_LIMIT: Joi.string()
    .pattern(/^\d+[kmg]?b$/i)
    .default('10mb')
    .description('JSON payload size limit'),

  URL_ENCODED_LIMIT: Joi.string()
    .pattern(/^\d+[kmg]?b$/i)
    .default('10mb')
    .description('URL encoded payload size limit'),

  FILE_UPLOAD_LIMIT: Joi.string()
    .pattern(/^\d+[kmg]?b$/i)
    .default('50mb')
    .description('File upload size limit'),

  // =================================
  // HEALTH CHECK CONFIGURATION
  // =================================
  HEALTH_CHECK_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable health check endpoints'),

  HEALTH_CHECK_PATH: Joi.string()
    .pattern(/^[a-zA-Z0-9-_]+$/)
    .default('health')
    .description('Health check endpoint path'),

  GRACEFUL_SHUTDOWN_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .default(10000)
    .description('Graceful shutdown timeout in milliseconds'),

  MEMORY_HEAP_THRESHOLD: Joi.number()
    .integer()
    .min(1)
    .default(150)
    .description('Memory heap threshold in MB'),

  MEMORY_RSS_THRESHOLD: Joi.number()
    .integer()
    .min(1)
    .default(150)
    .description('Memory RSS threshold in MB'),

  DISK_THRESHOLD: Joi.number()
    .integer()
    .min(1)
    .default(250)
    .description('Disk space threshold in MB'),

  // =================================
  // MONITORING CONFIGURATION
  // =================================
  MONITORING_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable monitoring features'),

  METRICS_PATH: Joi.string()
    .pattern(/^[a-zA-Z0-9-_]+$/)
    .default('metrics')
    .description('Metrics endpoint path'),

  PROMETHEUS_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable Prometheus metrics'),

  JAEGER_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable Jaeger tracing'),

  SENTRY_ENABLED: Joi.boolean()
    .default(false)
    .description('Enable Sentry error tracking'),

  SENTRY_DSN: Joi.string()
    .uri()
    .when('SENTRY_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .description('Sentry DSN for error tracking'),
});

/**
 * Función de validación para las variables de entorno
 */
export function validateEnvironmentVariables(
  config: Record<string, unknown>,
): ValidatedEnvironmentVariables {
  const result = envValidationSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
    convert: true,
  });

  if (result.error) {
    const errorMessages = result.error.details.map(
      (detail: any) => detail.message,
    );
    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}`,
    );
  }

  return result.value;
}

/**
 * Utilidades para trabajar con variables de entorno validadas
 */
export class EnvValidationUtils {
  /**
   * Verifica si todas las variables requeridas están presentes
   */
  static checkRequiredVariables(): string[] {
    const required = ['DATABASE_URL'];
    const missing: string[] = [];

    for (const variable of required) {
      if (!process.env[variable]) {
        missing.push(variable);
      }
    }

    return missing;
  }

  /**
   * Obtiene variables críticas para producción
   */
  static getCriticalProductionVariables(): string[] {
    return [
      'DATABASE_URL',
      'JWT_SECRET', // Cuando implementemos JWT
      'BASE_URL',
      'ALLOWED_ORIGINS',
    ];
  }

  /**
   * Valida configuración específica para producción
   */
  static validateProductionConfig(env: ValidatedEnvironmentVariables): void {
    const issues: string[] = [];

    if (env.NODE_ENV === 'production') {
      // Verificar que HTTPS esté configurado
      if (!env.BASE_URL.startsWith('https://')) {
        issues.push('BASE_URL should use HTTPS in production');
      }

      // Verificar que CORS no esté completamente abierto
      if (env.CORS_ORIGIN.includes('*')) {
        issues.push('CORS_ORIGIN should not use wildcard (*) in production');
      }

      // Verificar que los headers de seguridad estén habilitados
      if (!env.HELMET_ENABLED) {
        issues.push('HELMET_ENABLED should be true in production');
      }

      if (!env.HELMET_HSTS_ENABLED) {
        issues.push('HELMET_HSTS_ENABLED should be true in production');
      }
    }

    if (issues.length > 0) {
      console.warn(
        '⚠️  Production configuration warnings:\n' + issues.join('\n'),
      );
    }
  }

  /**
   * Genera reporte de configuración
   */
  static generateConfigReport(env: ValidatedEnvironmentVariables): string {
    const sections = [
      '🔧 Environment Configuration Report',
      '=====================================',
      '',
      `Environment: ${env.NODE_ENV}`,
      `Application: ${env.APP_NAME} v${env.APP_VERSION}`,
      `Port: ${env.PORT}`,
      `Base URL: ${env.BASE_URL}`,
      '',
      '📊 Features Status:',
      `  Swagger: ${env.SWAGGER_ENABLED ? '✅' : '❌'}`,
      `  CORS: ${env.CORS_ENABLED ? '✅' : '❌'}`,
      `  Rate Limiting: ${env.RATE_LIMIT_ENABLED ? '✅' : '❌'}`,
      `  Health Checks: ${env.HEALTH_CHECK_ENABLED ? '✅' : '❌'}`,
      `  Monitoring: ${env.MONITORING_ENABLED ? '✅' : '❌'}`,
      '',
      '🔒 Security Features:',
      `  Helmet: ${env.HELMET_ENABLED ? '✅' : '❌'}`,
      `  HSTS: ${env.HELMET_HSTS_ENABLED ? '✅' : '❌'}`,
      `  JWT Auth: ${env.JWT_ENABLED ? '✅' : '❌'}`,
      '',
      '📝 Logging:',
      `  Level: ${env.LOG_LEVEL}`,
      `  File Logging: ${env.ENABLE_FILE_LOGGING ? '✅' : '❌'}`,
      `  Console Logging: ${env.ENABLE_CONSOLE_LOGGING ? '✅' : '❌'}`,
      '',
    ];

    return sections.join('\n');
  }
}
