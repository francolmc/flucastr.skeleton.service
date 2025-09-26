import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from './jwt.guard';

/* eslint-disable @typescript-eslint/no-unsafe-argument */

interface RequestWithUser {
  user?: AuthenticatedUser;
}

/**
 * Opciones para el control de acceso basado en roles
 */
export interface RbacOptions {
  roles: string[];
  requireAll?: boolean; // Si true, requiere TODOS los roles. Si false, requiere AL MENOS UNO
  allowSuperAdmin?: boolean; // Si true, permite acceso a super-admin sin verificar roles específicos
}

/**
 * Clave para el metadata de roles
 */
export const ROLES_KEY = 'roles';
export const RBAC_OPTIONS_KEY = 'rbac_options';

/**
 * Guard RBAC (Role-Based Access Control)
 * Controla el acceso basado en los roles del usuario
 */
@Injectable()
export class RbacGuard implements CanActivate {
  private readonly logger = new Logger(RbacGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles requeridos del metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Obtener opciones RBAC del metadata
    const rbacOptions = this.reflector.getAllAndOverride<RbacOptions>(
      RBAC_OPTIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario de la request
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      this.logger.warn('RBAC Guard: No authenticated user found');
      throw new ForbiddenException(
        'Authentication required for role-based access',
      );
    }

    // Verificar acceso basado en roles
    const hasAccess = this.checkRoleAccess(user, requiredRoles, rbacOptions);

    if (!hasAccess) {
      this.logger.warn(
        `RBAC Guard: Access denied for user ${user.id}. Required roles: [${requiredRoles.join(', ')}], User roles: [${user.roles.join(', ')}]`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    this.logger.log(
      `RBAC Guard: Access granted for user ${user.id} with roles [${user.roles.join(', ')}]`,
    );

    return true;
  }

  /**
   * Verifica si el usuario tiene acceso basado en roles
   */
  private checkRoleAccess(
    user: AuthenticatedUser,
    requiredRoles: string[],
    options?: RbacOptions,
  ): boolean {
    const userRoles = user.roles || [];
    const opts = options || { requireAll: false, allowSuperAdmin: true };

    // Verificar super-admin si está habilitado
    if (opts.allowSuperAdmin && userRoles.includes('super-admin')) {
      return true;
    }

    // Si no hay roles de usuario, denegar acceso
    if (userRoles.length === 0) {
      return false;
    }

    // Verificar roles según la configuración
    if (opts.requireAll) {
      // Requiere TODOS los roles
      return requiredRoles.every((role) => userRoles.includes(role));
    } else {
      // Requiere AL MENOS UNO de los roles
      return requiredRoles.some((role) => userRoles.includes(role));
    }
  }
}

/**
 * Decorador para especificar roles requeridos
 */
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorador para configurar opciones RBAC
 */
export const RbacConfig = (options: Partial<RbacOptions>) =>
  SetMetadata(RBAC_OPTIONS_KEY, options);

/**
 * Decorador combinado para roles con opciones
 */
export const RequireRoles = (
  roles: string[],
  options?: Partial<RbacOptions>,
) => {
  return (target: any, propertyKey?: any, descriptor?: any) => {
    SetMetadata(ROLES_KEY, roles)(target, propertyKey, descriptor);
    if (options) {
      SetMetadata(RBAC_OPTIONS_KEY, options)(target, propertyKey, descriptor);
    }
  };
};

/**
 * Decoradores de conveniencia para roles comunes
 */
export const RequireAdmin = () => Roles('admin');
export const RequireSuperAdmin = () => Roles('super-admin');
export const RequireUser = () => Roles('user');
export const RequireManager = () => Roles('manager');
export const RequireModerator = () => Roles('moderator');

/**
 * Decoradores para combinaciones comunes
 */
export const RequireAdminOrManager = () => Roles('admin', 'manager');
export const RequireAllRoles = (...roles: string[]) =>
  RequireRoles(roles, { requireAll: true });

/**
 * Utilidades para trabajar con roles
 */
export class RoleUtils {
  /**
   * Roles predefinidos del sistema
   */
  static readonly SYSTEM_ROLES = {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    MODERATOR: 'moderator',
    USER: 'user',
    GUEST: 'guest',
  } as const;

  /**
   * Jerarquía de roles (de mayor a menor privilegio)
   */
  static readonly ROLE_HIERARCHY = [
    'super-admin',
    'admin',
    'manager',
    'moderator',
    'user',
    'guest',
  ];

  /**
   * Verifica si un rol tiene mayor privilegio que otro
   */
  static isHigherRole(role1: string, role2: string): boolean {
    const index1 = RoleUtils.ROLE_HIERARCHY.indexOf(role1);
    const index2 = RoleUtils.ROLE_HIERARCHY.indexOf(role2);

    // Si algún rol no está en la jerarquía, no se puede comparar
    if (index1 === -1 || index2 === -1) {
      return false;
    }

    return index1 < index2; // Menor índice = mayor privilegio
  }

  /**
   * Obtiene todos los roles de menor privilegio que el dado
   */
  static getLowerRoles(role: string): string[] {
    const index = RoleUtils.ROLE_HIERARCHY.indexOf(role);

    if (index === -1) {
      return [];
    }

    return RoleUtils.ROLE_HIERARCHY.slice(index + 1);
  }

  /**
   * Obtiene el rol de mayor privilegio de una lista
   */
  static getHighestRole(roles: string[]): string | null {
    for (const hierarchyRole of RoleUtils.ROLE_HIERARCHY) {
      if (roles.includes(hierarchyRole)) {
        return hierarchyRole;
      }
    }

    return null;
  }

  /**
   * Verifica si un usuario tiene al menos un rol de cierto nivel
   */
  static hasMinimumRole(userRoles: string[], minimumRole: string): boolean {
    const minimumIndex = RoleUtils.ROLE_HIERARCHY.indexOf(minimumRole);

    if (minimumIndex === -1) {
      return false;
    }

    return userRoles.some((role) => {
      const roleIndex = RoleUtils.ROLE_HIERARCHY.indexOf(role);
      return roleIndex !== -1 && roleIndex <= minimumIndex;
    });
  }
}
