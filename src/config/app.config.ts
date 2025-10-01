import { registerAs } from '@nestjs/config';

/**
 * Interfaz para la configuración general de la aplicación
 */
export interface AppConfig {
  // Configuración básica de la aplicación
  name: string;
  version: string;
  description: string;
  environment: string;
  port: number;
  host: string;
  globalPrefix: string;

  // URLs y dominios
  baseUrl: string;
  allowedOrigins: string[];
  trustedProxies: string[];

  // Configuración de seguridad
  security: {
    helmet: {
      enabled: boolean;
      contentSecurityPolicy: boolean;
      crossOriginEmbedderPolicy: boolean;
      crossOriginOpenerPolicy: boolean;
      crossOriginResourcePolicy: boolean;
      dnsPrefetchControl: boolean;
      frameguard: boolean;
      hidePoweredBy: boolean;
      hsts: boolean;
      ieNoOpen: boolean;
      noSniff: boolean;
      originAgentCluster: boolean;
      permittedCrossDomainPolicies: boolean;
      referrerPolicy: boolean;
      xssFilter: boolean;
    };
    cors: {
      enabled: boolean;
      origin: string | string[] | boolean;
      methods: string[];
      allowedHeaders: string[];
      exposedHeaders: string[];
      credentials: boolean;
      maxAge: number;
      preflightContinue: boolean;
      optionsSuccessStatus: number;
    };
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
      message: string;
      standardHeaders: boolean;
      legacyHeaders: boolean;
      skipSuccessfulRequests: boolean;
      skipFailedRequests: boolean;
    };
  };

  // Configuración de validación
  validation: {
    whitelist: boolean;
    forbidNonWhitelisted: boolean;
    transform: boolean;
    disableErrorMessages: boolean;
    validateCustomDecorators: boolean;
    enableDebugMessages: boolean;
  };

  // Configuración de versionado
  versioning: {
    enabled: boolean;
    type: 'uri' | 'header' | 'media' | 'custom';
    prefix: string;
    defaultVersion: string;
    header?: string;
    key?: string;
  };

  // Configuración de timeouts y límites
  limits: {
    requestTimeout: number;
    bodyLimit: string;
    parameterLimit: number;
    jsonLimit: string;
    urlEncodedLimit: string;
    fileUploadLimit: string;
  };

  // Configuración de health checks
  health: {
    enabled: boolean;
    path: string;
    gracefulShutdownTimeout: number;
    memoryHeapThreshold: number;
    memoryRSSThreshold: number;
    diskThreshold: number;
  };

  // Configuración de métricas y monitoreo
  monitoring: {
    enabled: boolean;
    metricsPath: string;
    prometheusEnabled: boolean;
    jaegerEnabled: boolean;
    sentryEnabled: boolean;
    sentryDsn?: string;
  };
}

/**
 * Configuración de la aplicación basada en el ambiente
 */
export default registerAs('app', (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  return {
    // Configuración básica
    name: process.env.APP_NAME || 'Flucastr Lleva - Service',
    version:
      process.env.APP_VERSION || process.env.npm_package_version || '1.0.0',
    description:
      process.env.APP_DESCRIPTION ||
      'Microservicio para la plataforma Flucastr Lleva',
    environment: nodeEnv,
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    globalPrefix: process.env.GLOBAL_PREFIX || 'v1',

    // URLs y dominios
    baseUrl:
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`,
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
      : isDevelopment
        ? ['http://localhost:3000', 'http://localhost:3001']
        : [],
    trustedProxies: process.env.TRUSTED_PROXIES
      ? process.env.TRUSTED_PROXIES.split(',').map((proxy) => proxy.trim())
      : [],

    // Configuración de seguridad
    security: {
      helmet: {
        enabled: process.env.HELMET_ENABLED !== 'false' && isProduction,
        contentSecurityPolicy:
          process.env.HELMET_CSP_ENABLED !== 'false' && isProduction,
        crossOriginEmbedderPolicy:
          process.env.HELMET_COEP_ENABLED !== 'false' && isProduction,
        crossOriginOpenerPolicy:
          process.env.HELMET_COOP_ENABLED !== 'false' && isProduction,
        crossOriginResourcePolicy:
          process.env.HELMET_CORP_ENABLED !== 'false' && isProduction,
        dnsPrefetchControl:
          process.env.HELMET_DNS_PREFETCH_CONTROL_ENABLED !== 'false',
        frameguard: process.env.HELMET_FRAMEGUARD_ENABLED !== 'false',
        hidePoweredBy: process.env.HELMET_HIDE_POWERED_BY_ENABLED !== 'false',
        hsts: process.env.HELMET_HSTS_ENABLED !== 'false' && isProduction,
        ieNoOpen: process.env.HELMET_IE_NO_OPEN_ENABLED !== 'false',
        noSniff: process.env.HELMET_NO_SNIFF_ENABLED !== 'false',
        originAgentCluster:
          process.env.HELMET_ORIGIN_AGENT_CLUSTER_ENABLED !== 'false',
        permittedCrossDomainPolicies:
          process.env.HELMET_PERMITTED_CROSS_DOMAIN_POLICIES_ENABLED !==
          'false',
        referrerPolicy: process.env.HELMET_REFERRER_POLICY_ENABLED !== 'false',
        xssFilter: process.env.HELMET_XSS_FILTER_ENABLED !== 'false',
      },
      cors: {
        enabled: process.env.CORS_ENABLED !== 'false',
        origin: process.env.CORS_ORIGIN
          ? process.env.CORS_ORIGIN === '*'
            ? true
            : process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
          : isDevelopment
            ? true
            : false,
        methods: process.env.CORS_METHODS
          ? process.env.CORS_METHODS.split(',').map((method) =>
              method.trim().toUpperCase(),
            )
          : ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS
          ? process.env.CORS_ALLOWED_HEADERS.split(',').map((header) =>
              header.trim(),
            )
          : [
              'Origin',
              'X-Requested-With',
              'Content-Type',
              'Accept',
              'Authorization',
              'X-API-Key',
            ],
        exposedHeaders: process.env.CORS_EXPOSED_HEADERS
          ? process.env.CORS_EXPOSED_HEADERS.split(',').map((header) =>
              header.trim(),
            )
          : ['X-Total-Count', 'X-Page-Count'],
        credentials: process.env.CORS_CREDENTIALS === 'true',
        maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
        preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === 'true',
        optionsSuccessStatus: parseInt(
          process.env.CORS_OPTIONS_SUCCESS_STATUS || '204',
          10,
        ),
      },
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED === 'true',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        message:
          process.env.RATE_LIMIT_MESSAGE ||
          'Too many requests from this IP, please try again later.',
        standardHeaders: process.env.RATE_LIMIT_STANDARD_HEADERS !== 'false',
        legacyHeaders: process.env.RATE_LIMIT_LEGACY_HEADERS === 'true',
        skipSuccessfulRequests:
          process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
        skipFailedRequests:
          process.env.RATE_LIMIT_SKIP_FAILED_REQUESTS === 'true',
      },
    },

    // Configuración de validación
    validation: {
      whitelist: process.env.VALIDATION_WHITELIST !== 'false',
      forbidNonWhitelisted:
        process.env.VALIDATION_FORBID_NON_WHITELISTED === 'true',
      transform: process.env.VALIDATION_TRANSFORM !== 'false',
      disableErrorMessages:
        process.env.VALIDATION_DISABLE_ERROR_MESSAGES === 'true' &&
        isProduction,
      validateCustomDecorators:
        process.env.VALIDATION_VALIDATE_CUSTOM_DECORATORS !== 'false',
      enableDebugMessages:
        process.env.VALIDATION_ENABLE_DEBUG_MESSAGES === 'true' &&
        isDevelopment,
    },

    // Configuración de versionado
    versioning: {
      enabled: process.env.VERSIONING_ENABLED !== 'false',
      type:
        (process.env.VERSIONING_TYPE as
          | 'uri'
          | 'header'
          | 'media'
          | 'custom') || 'uri',
      prefix: process.env.VERSIONING_PREFIX || 'v',
      defaultVersion: process.env.VERSIONING_DEFAULT_VERSION || '1',
      header: process.env.VERSIONING_HEADER || 'X-API-Version',
      key: process.env.VERSIONING_KEY || 'version',
    },

    // Configuración de límites
    limits: {
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
      bodyLimit: process.env.BODY_LIMIT || '10mb',
      parameterLimit: parseInt(process.env.PARAMETER_LIMIT || '1000', 10),
      jsonLimit: process.env.JSON_LIMIT || '10mb',
      urlEncodedLimit: process.env.URL_ENCODED_LIMIT || '10mb',
      fileUploadLimit: process.env.FILE_UPLOAD_LIMIT || '50mb',
    },

    // Configuración de health checks
    health: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      path: process.env.HEALTH_CHECK_PATH || 'health',
      gracefulShutdownTimeout: parseInt(
        process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '10000',
        10,
      ),
      memoryHeapThreshold: parseInt(
        process.env.MEMORY_HEAP_THRESHOLD || '150',
        10,
      ), // MB
      memoryRSSThreshold: parseInt(
        process.env.MEMORY_RSS_THRESHOLD || '150',
        10,
      ), // MB
      diskThreshold: parseInt(process.env.DISK_THRESHOLD || '250', 10), // MB
    },

    // Configuración de monitoreo
    monitoring: {
      enabled: process.env.MONITORING_ENABLED === 'true',
      metricsPath: process.env.METRICS_PATH || 'metrics',
      prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true',
      jaegerEnabled: process.env.JAEGER_ENABLED === 'true',
      sentryEnabled: process.env.SENTRY_ENABLED === 'true',
      sentryDsn: process.env.SENTRY_DSN,
    },
  };
});

/**
 * Utilidades para la configuración de la aplicación
 */
export class AppConfigUtils {
  /**
   * Verifica si la aplicación está en modo desarrollo
   */
  static isDevelopment(): boolean {
    return (process.env.NODE_ENV || 'development') === 'development';
  }

  /**
   * Verifica si la aplicación está en modo producción
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Verifica si la aplicación está en modo test
   */
  static isTest(): boolean {
    return (process.env.NODE_ENV || '').includes('test');
  }

  /**
   * Obtiene la URL base de la aplicación
   */
  static getBaseUrl(): string {
    return (
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`
    );
  }

  /**
   * Obtiene el puerto de la aplicación
   */
  static getPort(): number {
    return parseInt(process.env.PORT || '3001', 10);
  }

  /**
   * Obtiene el prefijo global de la API
   */
  static getGlobalPrefix(): string {
    return process.env.GLOBAL_PREFIX || 'v1';
  }

  /**
   * Verifica si una característica está habilitada
   */
  static isFeatureEnabled(feature: string): boolean {
    const envVar = `${feature.toUpperCase()}_ENABLED`;
    return process.env[envVar] === 'true';
  }

  /**
   * Obtiene la configuración de CORS completa
   */
  static getCorsConfig() {
    const isDevelopment = AppConfigUtils.isDevelopment();

    return {
      enabled: process.env.CORS_ENABLED !== 'false',
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN === '*'
          ? true
          : process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
        : isDevelopment
          ? true
          : false,
      methods: process.env.CORS_METHODS
        ? process.env.CORS_METHODS.split(',').map((method) =>
            method.trim().toUpperCase(),
          )
        : ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS
        ? process.env.CORS_ALLOWED_HEADERS.split(',').map((header) =>
            header.trim(),
          )
        : [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-API-Key',
          ],
      exposedHeaders: process.env.CORS_EXPOSED_HEADERS
        ? process.env.CORS_EXPOSED_HEADERS.split(',').map((header) =>
            header.trim(),
          )
        : ['X-Total-Count', 'X-Page-Count'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
      maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
      preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === 'true',
      optionsSuccessStatus: parseInt(
        process.env.CORS_OPTIONS_SUCCESS_STATUS || '204',
        10,
      ),
    };
  }

  /**
   * Obtiene la configuración de CORS (método legacy)
   */
  static getCorsOrigins(): string[] | boolean {
    if (!process.env.CORS_ORIGIN) {
      return AppConfigUtils.isDevelopment() ? true : false;
    }

    if (process.env.CORS_ORIGIN === '*') {
      return true;
    }

    return process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  }

  /**
   * Obtiene la configuración de timeout
   */
  static getRequestTimeout(): number {
    return parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
  }

  /**
   * Genera configuración de validación global
   */
  static getValidationPipeOptions() {
    return {
      whitelist: process.env.VALIDATION_WHITELIST !== 'false',
      forbidNonWhitelisted:
        process.env.VALIDATION_FORBID_NON_WHITELISTED === 'true',
      transform: process.env.VALIDATION_TRANSFORM !== 'false',
      disableErrorMessages:
        process.env.VALIDATION_DISABLE_ERROR_MESSAGES === 'true' &&
        AppConfigUtils.isProduction(),
      validateCustomDecorators:
        process.env.VALIDATION_VALIDATE_CUSTOM_DECORATORS !== 'false',
      enableDebugMessages:
        process.env.VALIDATION_ENABLE_DEBUG_MESSAGES === 'true' &&
        AppConfigUtils.isDevelopment(),
    };
  }

  /**
   * Obtiene la configuración de Helmet para headers de seguridad
   */
  static getHelmetConfig() {
    const isProduction = AppConfigUtils.isProduction();

    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: isProduction,
      crossOriginOpenerPolicy: isProduction,
      crossOriginResourcePolicy: isProduction,
      dnsPrefetchControl: true,
      frameguard: true,
      hidePoweredBy: true,
      hsts: isProduction,
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: true,
      referrerPolicy: true,
      xssFilter: true,
    };
  }

  /**
   * Obtiene información del entorno para logs
   */
  static getEnvironmentInfo() {
    return {
      name: process.env.APP_NAME || 'Flucastr Lleva - Service',
      version:
        process.env.APP_VERSION || process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: AppConfigUtils.getPort(),
      baseUrl: AppConfigUtils.getBaseUrl(),
      isDevelopment: AppConfigUtils.isDevelopment(),
      isProduction: AppConfigUtils.isProduction(),
      isTest: AppConfigUtils.isTest(),
    };
  }
}
