import { registerAs } from '@nestjs/config';

/**
 * Interfaz para la configuración JWT
 */
export interface JwtConfig {
  // Configuración de validación
  secret: string;
  publicKey?: string;
  algorithm: string;
  issuer?: string;
  audience?: string;

  // Configuración de verificación
  ignoreExpiration: boolean;
  clockTolerance: number;
  maxAge?: string;

  // Configuración de extracción
  extractFromHeader: boolean;
  extractFromQuery: boolean;
  extractFromCookie: boolean;
  headerName: string;
  queryParam: string;
  cookieName: string;

  // Configuración de roles y permisos
  rolesClaimKey: string;
  permissionsClaimKey: string;
  userIdClaimKey: string;
  tenantIdClaimKey: string;

  // Configuración de cache
  enableCache: boolean;
  cacheTtl: number;

  // Configuración de logging
  enableLogging: boolean;
  logFailedAttempts: boolean;
}

/**
 * Configuración JWT para validación de tokens
 * Este servicio NO genera tokens, solo los valida
 */
export default registerAs('jwt', (): JwtConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    // =================================
    // CONFIGURACIÓN DE VALIDACIÓN
    // =================================

    // Secret para validar tokens (debe coincidir con el servicio que los genera)
    secret:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production',

    // Clave pública para validación RSA (opcional)
    publicKey: process.env.JWT_PUBLIC_KEY,

    // Algoritmo de firma (debe coincidir con el servicio generador)
    algorithm: process.env.JWT_ALGORITHM || 'HS256',

    // Issuer esperado (quien emite los tokens)
    issuer: process.env.JWT_ISSUER || 'flucastr-auth-service',

    // Audience esperado (para quién son los tokens)
    audience: process.env.JWT_AUDIENCE || 'flucastr-services',

    // =================================
    // CONFIGURACIÓN DE VERIFICACIÓN
    // =================================

    // No ignorar expiración en producción
    ignoreExpiration:
      process.env.JWT_IGNORE_EXPIRATION === 'true' && !isProduction,

    // Tolerancia de reloj (en segundos)
    clockTolerance: parseInt(process.env.JWT_CLOCK_TOLERANCE || '30', 10),

    // Edad máxima del token
    maxAge: process.env.JWT_MAX_AGE,

    // =================================
    // CONFIGURACIÓN DE EXTRACCIÓN
    // =================================

    // Extraer token del header Authorization
    extractFromHeader: process.env.JWT_EXTRACT_FROM_HEADER !== 'false',

    // Extraer token de query parameter
    extractFromQuery: process.env.JWT_EXTRACT_FROM_QUERY === 'true',

    // Extraer token de cookie
    extractFromCookie: process.env.JWT_EXTRACT_FROM_COOKIE === 'true',

    // Nombre del header (sin 'Bearer ')
    headerName: process.env.JWT_HEADER_NAME || 'Authorization',

    // Nombre del query parameter
    queryParam: process.env.JWT_QUERY_PARAM || 'token',

    // Nombre de la cookie
    cookieName: process.env.JWT_COOKIE_NAME || 'access_token',

    // =================================
    // CONFIGURACIÓN DE CLAIMS
    // =================================

    // Clave donde están los roles en el payload
    rolesClaimKey: process.env.JWT_ROLES_CLAIM_KEY || 'roles',

    // Clave donde están los permisos en el payload
    permissionsClaimKey: process.env.JWT_PERMISSIONS_CLAIM_KEY || 'permissions',

    // Clave del ID de usuario
    userIdClaimKey: process.env.JWT_USER_ID_CLAIM_KEY || 'sub',

    // Clave del ID de tenant (multi-tenancy)
    tenantIdClaimKey: process.env.JWT_TENANT_ID_CLAIM_KEY || 'tenant_id',

    // =================================
    // CONFIGURACIÓN DE CACHE
    // =================================

    // Habilitar cache de tokens validados
    enableCache: process.env.JWT_ENABLE_CACHE === 'true',

    // TTL del cache en segundos
    cacheTtl: parseInt(process.env.JWT_CACHE_TTL || '300', 10),

    // =================================
    // CONFIGURACIÓN DE LOGGING
    // =================================

    // Habilitar logging de JWT
    enableLogging: process.env.JWT_ENABLE_LOGGING !== 'false',

    // Log de intentos fallidos
    logFailedAttempts: process.env.JWT_LOG_FAILED_ATTEMPTS !== 'false',
  };
});

/**
 * Utilidades para trabajar con la configuración JWT
 */
export class JwtConfigUtils {
  /**
   * Verifica si JWT está habilitado
   */
  static isEnabled(): boolean {
    return process.env.JWT_ENABLED !== 'false';
  }

  /**
   * Verifica si estamos en modo desarrollo
   */
  static isDevelopment(): boolean {
    return (process.env.NODE_ENV || 'development') === 'development';
  }

  /**
   * Verifica si estamos en modo producción
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Obtiene el secret JWT
   */
  static getSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret && JwtConfigUtils.isProduction()) {
      throw new Error('JWT_SECRET is required in production environment');
    }

    return secret || 'your-super-secret-jwt-key-change-in-production';
  }

  /**
   * Obtiene la configuración de extracción de tokens
   */
  static getExtractionConfig() {
    return {
      fromAuthHeaderAsBearerToken:
        process.env.JWT_EXTRACT_FROM_HEADER !== 'false',
      fromUrlQueryParameter:
        process.env.JWT_EXTRACT_FROM_QUERY === 'true'
          ? process.env.JWT_QUERY_PARAM || 'token'
          : false,
      fromBodyField: false, // No recomendado por seguridad
      fromExtractors: [], // Extractores personalizados si es necesario
    };
  }

  /**
   * Obtiene las opciones de verificación
   */
  static getVerifyOptions() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProduction = nodeEnv === 'production';

    return {
      secret: JwtConfigUtils.getSecret(),
      algorithms: [process.env.JWT_ALGORITHM || 'HS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      ignoreExpiration:
        process.env.JWT_IGNORE_EXPIRATION === 'true' && !isProduction,
      clockTolerance: parseInt(process.env.JWT_CLOCK_TOLERANCE || '30', 10),
      maxAge: process.env.JWT_MAX_AGE,
    };
  }

  /**
   * Obtiene la configuración de claims
   */
  static getClaimsConfig() {
    return {
      rolesKey: process.env.JWT_ROLES_CLAIM_KEY || 'roles',
      permissionsKey: process.env.JWT_PERMISSIONS_CLAIM_KEY || 'permissions',
      userIdKey: process.env.JWT_USER_ID_CLAIM_KEY || 'sub',
      tenantIdKey: process.env.JWT_TENANT_ID_CLAIM_KEY || 'tenant_id',
    };
  }

  /**
   * Valida la configuración JWT
   */
  static validateConfig(): string[] {
    const issues: string[] = [];

    // Verificar secret en producción
    if (JwtConfigUtils.isProduction() && !process.env.JWT_SECRET) {
      issues.push('JWT_SECRET is required in production');
    }

    // Verificar algoritmo
    const algorithm = process.env.JWT_ALGORITHM || 'HS256';
    const supportedAlgorithms = [
      'HS256',
      'HS384',
      'HS512',
      'RS256',
      'RS384',
      'RS512',
    ];
    if (!supportedAlgorithms.includes(algorithm)) {
      issues.push(`Unsupported JWT algorithm: ${algorithm}`);
    }

    // Verificar configuración RSA
    if (algorithm.startsWith('RS') && !process.env.JWT_PUBLIC_KEY) {
      issues.push('JWT_PUBLIC_KEY is required for RSA algorithms');
    }

    // Verificar tolerancia de reloj
    const clockTolerance = parseInt(
      process.env.JWT_CLOCK_TOLERANCE || '30',
      10,
    );
    if (clockTolerance < 0 || clockTolerance > 300) {
      issues.push('JWT_CLOCK_TOLERANCE should be between 0 and 300 seconds');
    }

    return issues;
  }

  /**
   * Genera reporte de configuración JWT
   */
  static generateConfigReport(): string {
    const config = {
      enabled: JwtConfigUtils.isEnabled(),
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
      issuer: process.env.JWT_ISSUER || 'not-set',
      audience: process.env.JWT_AUDIENCE || 'not-set',
      extractFromHeader: process.env.JWT_EXTRACT_FROM_HEADER !== 'false',
      extractFromQuery: process.env.JWT_EXTRACT_FROM_QUERY === 'true',
      extractFromCookie: process.env.JWT_EXTRACT_FROM_COOKIE === 'true',
      cacheEnabled: process.env.JWT_ENABLE_CACHE === 'true',
      loggingEnabled: process.env.JWT_ENABLE_LOGGING !== 'false',
    };

    const sections = [
      '🔐 JWT Configuration Report',
      '============================',
      '',
      `Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}`,
      `Algorithm: ${config.algorithm}`,
      `Issuer: ${config.issuer}`,
      `Audience: ${config.audience}`,
      '',
      '📡 Token Extraction:',
      `  Header: ${config.extractFromHeader ? '✅' : '❌'}`,
      `  Query: ${config.extractFromQuery ? '✅' : '❌'}`,
      `  Cookie: ${config.extractFromCookie ? '✅' : '❌'}`,
      '',
      '⚡ Features:',
      `  Cache: ${config.cacheEnabled ? '✅' : '❌'}`,
      `  Logging: ${config.loggingEnabled ? '✅' : '❌'}`,
      '',
    ];

    return sections.join('\n');
  }
}
