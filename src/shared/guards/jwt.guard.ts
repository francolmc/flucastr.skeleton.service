import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtConfig } from '../../config/jwt.config';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

/**
 * Interfaz extendida de Request que incluye el usuario autenticado
 */
interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

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
 * Interfaz para el usuario autenticado
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
 * Guard JWT para validación de tokens
 * Este guard NO genera tokens, solo los valida
 */
@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtConfig = this.configService.get<JwtConfig>('jwt')!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    try {
      // Extraer token de la request
      const token = this.extractTokenFromRequest(request);

      if (!token) {
        if (this.jwtConfig.enableLogging) {
          this.logger.warn('No JWT token found in request');
        }
        throw new UnauthorizedException('Access token is required');
      }

      // Validar y decodificar token
      const payload = await this.validateToken(token);

      // Crear usuario autenticado
      const user = this.createAuthenticatedUser(payload);

      // Agregar usuario a la request
      request.user = user;

      if (this.jwtConfig.enableLogging) {
        this.logger.log(`User authenticated: ${user.id}`);
      }

      return true;
    } catch (error) {
      if (this.jwtConfig.logFailedAttempts) {
        this.logger.warn(
          `JWT validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Extrae el token JWT de la request
   */
  private extractTokenFromRequest(request: RequestWithUser): string | null {
    let token: string | null = null;

    // 1. Extraer del header Authorization
    if (this.jwtConfig.extractFromHeader && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // 2. Extraer de query parameter
    if (
      !token &&
      this.jwtConfig.extractFromQuery &&
      request.query[this.jwtConfig.queryParam]
    ) {
      token = request.query[this.jwtConfig.queryParam] as string;
    }

    // 3. Extraer de cookie
    if (
      !token &&
      this.jwtConfig.extractFromCookie &&
      request.cookies &&
      this.jwtConfig.cookieName in request.cookies
    ) {
      token = request.cookies[this.jwtConfig.cookieName] as string;
    }

    return token;
  }

  /**
   * Valida el token JWT
   */
  private async validateToken(token: string): Promise<JwtPayload> {
    try {
      const options = {
        secret: this.jwtConfig.secret,
        algorithms: [this.jwtConfig.algorithm as any],
        issuer: this.jwtConfig.issuer,
        audience: this.jwtConfig.audience,
        ignoreExpiration: this.jwtConfig.ignoreExpiration,
        clockTolerance: this.jwtConfig.clockTolerance,
        maxAge: this.jwtConfig.maxAge,
      };

      // Filtrar opciones undefined
      const cleanOptions = Object.fromEntries(
        Object.entries(options).filter(([, value]) => value !== undefined),
      );

      const payload = await this.jwtService.verifyAsync(token, cleanOptions);

      return payload as JwtPayload;
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'Unknown';
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (errorName === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }

      if (errorName === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid access token format');
      }

      if (errorName === 'NotBeforeError') {
        throw new UnauthorizedException('Access token not active yet');
      }

      throw new UnauthorizedException(
        `Token validation failed: ${errorMessage}`,
      );
    }
  }

  /**
   * Crea el objeto de usuario autenticado desde el payload
   */
  private createAuthenticatedUser(payload: JwtPayload): AuthenticatedUser {
    const rolesKey = this.jwtConfig.rolesClaimKey;
    const permissionsKey = this.jwtConfig.permissionsClaimKey;
    const userIdKey = this.jwtConfig.userIdClaimKey;
    const tenantIdKey = this.jwtConfig.tenantIdClaimKey;

    return {
      id: payload[userIdKey] || payload.sub,
      email: payload.email,
      username: payload.username || payload.preferred_username,
      roles: payload[rolesKey] || [],
      permissions: payload[permissionsKey] || [],
      tenantId: payload[tenantIdKey],
      payload,
    };
  }
}

/**
 * Decorador para obtener el usuario autenticado
 */
import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    return data ? user?.[data] : user;
  },
);

/**
 * Decorador para obtener el payload JWT completo
 */
export const JwtPayloadDecorator = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    const payload = user?.payload;

    return data ? payload?.[data] : payload;
  },
);

/**
 * Decorador para obtener roles del usuario
 */
export const UserRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    return user?.roles || [];
  },
);

/**
 * Decorador para obtener permisos del usuario
 */
export const UserPermissions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    return user?.permissions || [];
  },
);
