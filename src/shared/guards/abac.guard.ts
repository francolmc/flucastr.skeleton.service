import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from './jwt.guard';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

/**
 * Contexto para evaluación ABAC
 */
export interface AbacContext {
  user: AuthenticatedUser;
  resource?: any;
  action: string;
  environment: {
    ip?: string;
    userAgent?: string;
    timestamp: Date;
    method: string;
    path: string;
  };
  request: any;
}

/**
 * Regla ABAC
 */
export interface AbacRule {
  name: string;
  description?: string;
  condition: (context: AbacContext) => boolean | Promise<boolean>;
}

/**
 * Política ABAC
 */
export interface AbacPolicy {
  name: string;
  description?: string;
  rules: AbacRule[];
  effect: 'allow' | 'deny';
  priority?: number; // Mayor número = mayor prioridad
}

/**
 * Configuración ABAC para endpoints
 */
export interface AbacConfig {
  action: string;
  resource?: string;
  policies?: string[]; // Nombres de políticas específicas a evaluar
  requireAll?: boolean; // Si true, todas las políticas deben permitir acceso
}

/**
 * Claves para metadata
 */
export const ABAC_CONFIG_KEY = 'abac_config';
export const ABAC_POLICIES_KEY = 'abac_policies';

/**
 * Guard ABAC (Attribute-Based Access Control)
 * Controla el acceso basado en atributos del usuario, recurso, acción y contexto
 */
@Injectable()
export class AbacGuard implements CanActivate {
  private readonly logger = new Logger(AbacGuard.name);
  private readonly policies: Map<string, AbacPolicy> = new Map();

  constructor(private readonly reflector: Reflector) {
    this.initializeDefaultPolicies();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener configuración ABAC del metadata
    const abacConfig = this.reflector.getAllAndOverride<AbacConfig>(
      ABAC_CONFIG_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay configuración ABAC, permitir acceso
    if (!abacConfig) {
      return true;
    }

    // Obtener usuario de la request
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      this.logger.warn('ABAC Guard: No authenticated user found');
      throw new ForbiddenException(
        'Authentication required for attribute-based access',
      );
    }

    // Crear contexto ABAC
    const abacContext = this.createAbacContext(user, request, abacConfig);

    // Evaluar políticas
    const hasAccess = await this.evaluatePolicies(abacContext, abacConfig);

    if (!hasAccess) {
      this.logger.warn(
        `ABAC Guard: Access denied for user ${user.id} on action ${abacConfig.action}`,
      );
      throw new ForbiddenException(
        `Access denied for action: ${abacConfig.action}`,
      );
    }

    this.logger.log(
      `ABAC Guard: Access granted for user ${user.id} on action ${abacConfig.action}`,
    );

    return true;
  }

  /**
   * Crea el contexto ABAC para evaluación
   */
  private createAbacContext(
    user: AuthenticatedUser,
    request: any,
    config: AbacConfig,
  ): AbacContext {
    return {
      user,
      resource: request.params, // Puede ser personalizado según necesidades
      action: config.action,
      environment: {
        ip: request.ip || request.connection?.remoteAddress,
        userAgent: request.headers['user-agent'],
        timestamp: new Date(),
        method: request.method,
        path: request.path,
      },
      request,
    };
  }

  /**
   * Evalúa las políticas ABAC
   */
  private async evaluatePolicies(
    context: AbacContext,
    config: AbacConfig,
  ): Promise<boolean> {
    // Obtener políticas a evaluar
    const policiesToEvaluate = config.policies || ['default'];
    const policies = policiesToEvaluate
      .map((name) => this.policies.get(name))
      .filter((policy) => policy !== undefined);

    if (policies.length === 0) {
      this.logger.warn(
        `No policies found for evaluation: ${policiesToEvaluate.join(', ')}`,
      );
      return false;
    }

    // Ordenar por prioridad (mayor prioridad primero)
    policies.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    let allowCount = 0;
    let denyCount = 0;

    // Evaluar cada política
    for (const policy of policies) {
      try {
        const result = await this.evaluatePolicy(policy, context);

        if (result) {
          if (policy.effect === 'allow') {
            allowCount++;
          } else if (policy.effect === 'deny') {
            denyCount++;
            // Si hay una denegación explícita, denegar inmediatamente
            return false;
          }
        }
      } catch (error) {
        this.logger.error(
          `Error evaluating policy ${policy.name}: ${error.message}`,
        );
        // En caso de error, considerar como denegación por seguridad
        return false;
      }
    }

    // Lógica de decisión
    if (config.requireAll) {
      // Todas las políticas deben permitir
      return (
        allowCount === policies.filter((p) => p.effect === 'allow').length &&
        denyCount === 0
      );
    } else {
      // Al menos una política debe permitir y ninguna debe denegar
      return allowCount > 0 && denyCount === 0;
    }
  }

  /**
   * Evalúa una política específica
   */
  private async evaluatePolicy(
    policy: AbacPolicy,
    context: AbacContext,
  ): Promise<boolean> {
    // Evaluar todas las reglas de la política
    for (const rule of policy.rules) {
      try {
        const result = await rule.condition(context);
        if (!result) {
          // Si alguna regla falla, la política falla
          return false;
        }
      } catch (error) {
        this.logger.error(
          `Error evaluating rule ${rule.name}: ${error.message}`,
        );
        return false;
      }
    }

    // Si todas las reglas pasan, la política pasa
    return true;
  }

  /**
   * Registra una política ABAC
   */
  registerPolicy(policy: AbacPolicy): void {
    this.policies.set(policy.name, policy);
    this.logger.log(`Registered ABAC policy: ${policy.name}`);
  }

  /**
   * Obtiene una política por nombre
   */
  getPolicy(name: string): AbacPolicy | undefined {
    return this.policies.get(name);
  }

  /**
   * Lista todas las políticas registradas
   */
  listPolicies(): string[] {
    return Array.from(this.policies.keys());
  }

  /**
   * Inicializa políticas por defecto
   */
  private initializeDefaultPolicies(): void {
    // Política por defecto: permitir si el usuario está autenticado
    const defaultPolicy: AbacPolicy = {
      name: 'default',
      description: 'Default policy - allow authenticated users',
      effect: 'allow',
      priority: 0,
      rules: [
        {
          name: 'authenticated',
          description: 'User must be authenticated',
          condition: (context) => !!context.user && !!context.user.id,
        },
      ],
    };

    // Política de horario de trabajo
    const businessHoursPolicy: AbacPolicy = {
      name: 'business-hours',
      description: 'Allow access only during business hours (9 AM - 6 PM)',
      effect: 'allow',
      priority: 1,
      rules: [
        {
          name: 'business-hours-check',
          condition: (context) => {
            const hour = context.environment.timestamp.getHours();
            return hour >= 9 && hour < 18;
          },
        },
      ],
    };

    // Política de propietario de recurso
    const resourceOwnerPolicy: AbacPolicy = {
      name: 'resource-owner',
      description: 'Allow access only to resource owners',
      effect: 'allow',
      priority: 2,
      rules: [
        {
          name: 'owner-check',
          condition: (context) => {
            // Verificar si el usuario es propietario del recurso
            const resourceUserId =
              context.resource?.userId || context.resource?.user_id;
            return resourceUserId === context.user.id;
          },
        },
      ],
    };

    // Política de mismo tenant
    const sameTenantPolicy: AbacPolicy = {
      name: 'same-tenant',
      description: 'Allow access only within the same tenant',
      effect: 'allow',
      priority: 1,
      rules: [
        {
          name: 'tenant-check',
          condition: (context) => {
            if (!context.user.tenantId) {
              return true; // Si no hay tenant, permitir
            }
            const resourceTenantId =
              context.resource?.tenantId || context.resource?.tenant_id;
            return (
              !resourceTenantId || resourceTenantId === context.user.tenantId
            );
          },
        },
      ],
    };

    // Política de IP permitidas
    const allowedIpPolicy: AbacPolicy = {
      name: 'allowed-ip',
      description: 'Allow access only from allowed IP addresses',
      effect: 'deny', // Denegar si no está en la lista
      priority: 10,
      rules: [
        {
          name: 'ip-whitelist-check',
          condition: (context) => {
            const allowedIps = process.env.ALLOWED_IPS?.split(',') || [];
            if (allowedIps.length === 0) {
              return true; // Si no hay restricción, permitir
            }
            return allowedIps.includes(context.environment.ip || '');
          },
        },
      ],
    };

    // Registrar políticas
    this.registerPolicy(defaultPolicy);
    this.registerPolicy(businessHoursPolicy);
    this.registerPolicy(resourceOwnerPolicy);
    this.registerPolicy(sameTenantPolicy);
    this.registerPolicy(allowedIpPolicy);
  }
}

/**
 * Decorador para configurar ABAC
 */
import { SetMetadata } from '@nestjs/common';

export const AbacAction = (action: string, config?: Partial<AbacConfig>) =>
  SetMetadata(ABAC_CONFIG_KEY, { action, ...config });

/**
 * Decoradores de conveniencia para acciones comunes
 */
export const CanRead = (resource?: string) => AbacAction('read', { resource });

export const CanWrite = (resource?: string) =>
  AbacAction('write', { resource });

export const CanUpdate = (resource?: string) =>
  AbacAction('update', { resource });

export const CanDelete = (resource?: string) =>
  AbacAction('delete', { resource });

export const CanCreate = (resource?: string) =>
  AbacAction('create', { resource });

/**
 * Decorador para requerir políticas específicas
 */
export const RequirePolicies = (policies: string[], requireAll = false) =>
  AbacAction('custom', { policies, requireAll });

/**
 * Decorador para propietario de recurso
 */
export const RequireResourceOwner = () => RequirePolicies(['resource-owner']);

/**
 * Decorador para mismo tenant
 */
export const RequireSameTenant = () => RequirePolicies(['same-tenant']);

/**
 * Decorador para horario de trabajo
 */
export const RequireBusinessHours = () => RequirePolicies(['business-hours']);

/**
 * Utilidades ABAC
 */
export class AbacUtils {
  /**
   * Crea una regla simple basada en permisos
   */
  static createPermissionRule(permission: string): AbacRule {
    return {
      name: `permission-${permission}`,
      description: `Check if user has permission: ${permission}`,
      condition: (context) => context.user.permissions.includes(permission),
    };
  }

  /**
   * Crea una regla simple basada en roles
   */
  static createRoleRule(role: string): AbacRule {
    return {
      name: `role-${role}`,
      description: `Check if user has role: ${role}`,
      condition: (context) => context.user.roles.includes(role),
    };
  }

  /**
   * Crea una regla de tiempo
   */
  static createTimeRule(startHour: number, endHour: number): AbacRule {
    return {
      name: `time-${startHour}-${endHour}`,
      description: `Allow access between ${startHour}:00 and ${endHour}:00`,
      condition: (context) => {
        const hour = context.environment.timestamp.getHours();
        return hour >= startHour && hour < endHour;
      },
    };
  }

  /**
   * Crea una regla de método HTTP
   */
  static createMethodRule(methods: string[]): AbacRule {
    return {
      name: `method-${methods.join('-')}`,
      description: `Allow only HTTP methods: ${methods.join(', ')}`,
      condition: (context) => methods.includes(context.environment.method),
    };
  }
}
