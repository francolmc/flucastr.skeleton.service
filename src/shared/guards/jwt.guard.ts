import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../../modules/auth/services/auth.service';
import { ValidatedEnvironmentVariables } from '../../config/env.validation';
import {
  AuthenticatedUser,
  JwtPayload,
  ValidatedExternalUser,
} from '../interfaces/auth.interface';

/**
 * Interfaz extendida de Request que incluye el usuario autenticado
 */
interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

/**
 * Guard JWT para validación de tokens usando introspección con servicio externo
 * Este guard NO genera tokens, solo los valida
 */
@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    private readonly configService: ConfigService<ValidatedEnvironmentVariables>,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    try {
      // Extraer token de la request
      const token = this.extractTokenFromRequest(request);

      if (!token) {
        this.logger.warn('No JWT token found in request');
        throw new UnauthorizedException('Access token is required');
      }

      // Validar token usando introspección
      const user = await this.authService.validateToken(token);

      if (!user) {
        this.logger.warn('Token validation failed - invalid or inactive token');
        throw new UnauthorizedException('Invalid token');
      }

      if (!user.isActive) {
        this.logger.warn(
          `Token validation failed - user ${user.id} is inactive`,
        );
        throw new UnauthorizedException('User account is inactive');
      }

      // Crear usuario autenticado adaptado a la interfaz existente
      const authenticatedUser = this.createAuthenticatedUser(user);

      // Agregar usuario a la request
      request.user = authenticatedUser;

      this.logger.debug(`User authenticated: ${user.id}`);
      return true;
    } catch (error: any) {
      this.logger.warn(
        `JWT validation failed: ${error?.message ?? 'Unknown error'}`,
      );

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
    const extractFromHeader = this.configService.get(
      'JWT_EXTRACT_FROM_HEADER',
      {
        infer: true,
      },
    );

    if (!extractFromHeader) {
      return null;
    }

    const headerName =
      this.configService
        .get('JWT_HEADER_NAME', {
          infer: true,
        })
        ?.toLowerCase() || 'authorization';

    const authHeader = request.headers[headerName];
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    // Support both "Bearer token" and just "token" formats
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // If it doesn't start with Bearer, assume it's just the token
    return authHeader;
  }

  /**
   * Crea el objeto de usuario autenticado adaptado desde AuthService
   */
  private createAuthenticatedUser(
    user: ValidatedExternalUser,
  ): AuthenticatedUser {
    // Create a mock JWT payload for compatibility
    const mockPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iss: 'flucastr-auth-service',
      aud: 'flucastr-services',
    };

    return {
      id: user.id,
      email: user.email,
      username: user.email, // Use email as username if not provided
      roles: user.roles,
      permissions: [], // No permissions in current auth service response
      tenantId: undefined,
      payload: mockPayload,
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
