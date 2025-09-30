/**
 * Interfaces de autenticación compartidas
 * Estas interfaces son agnósticas del servicio de autenticación específico
 */

/**
 * Interfaz para el payload del JWT
 */
export interface JwtPayload {
  sub: string; // User ID
  email?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  tenant_id?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  [key: string]: any;
}

/**
 * Interfaz para el usuario autenticado en el contexto de la aplicación
 */
export interface AuthenticatedUser {
  id: string;
  email?: string;
  username?: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  payload: JwtPayload;
}

/**
 * Respuesta de introspección de token (genérica)
 */
export interface TokenIntrospectResponse {
  active: boolean;
  sub?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  token_type?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  error?: string;
}

/**
 * Interfaz para el usuario validado desde el servicio de autenticación externo
 */
export interface ValidatedExternalUser {
  id: string;
  email: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
}

/**
 * Request extendida con usuario autenticado
 */
export interface RequestWithUser {
  user?: AuthenticatedUser;
}
