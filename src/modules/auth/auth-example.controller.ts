import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtGuard, CurrentUser } from '../../shared/guards/jwt.guard';
import type { AuthenticatedUser } from '../../shared/guards/jwt.guard';
import {
  RbacGuard,
  Roles,
  RequireAdmin,
  RequireAdminOrManager,
} from '../../shared/guards/rbac.guard';
import {
  AbacGuard,
  CanRead,
  CanWrite,
  CanDelete,
  RequireResourceOwner,
  RequireSameTenant,
  RequireBusinessHours,
} from '../../shared/guards/abac.guard';

/**
 * DTOs para los ejemplos
 */
export class CreateResourceDto {
  name: string;
  description?: string;
}

export class UpdateResourceDto {
  name?: string;
  description?: string;
}

export class ResourceResponseDto {
  id: string;
  name: string;
  description?: string;
  userId: string;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Controlador de ejemplo para demostrar protección JWT, RBAC y ABAC
 */
@ApiTags('Auth Examples')
@Controller('auth-examples')
@ApiBearerAuth()
export class AuthExampleController {
  // =================================
  // EJEMPLOS DE PROTECCIÓN BÁSICA JWT
  // =================================

  @Get('public')
  @ApiOperation({ summary: 'Endpoint público - Sin protección' })
  @ApiResponse({ status: 200, description: 'Acceso público permitido' })
  getPublicData() {
    return {
      message: 'Este endpoint es público y no requiere autenticación',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('protected')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Endpoint protegido - Solo JWT' })
  @ApiResponse({ status: 200, description: 'Usuario autenticado' })
  @ApiResponse({ status: 401, description: 'Token JWT requerido' })
  getProtectedData(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Este endpoint requiere autenticación JWT',
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // =================================
  // EJEMPLOS DE PROTECCIÓN RBAC
  // =================================

  @Get('admin-only')
  @UseGuards(JwtGuard, RbacGuard)
  @RequireAdmin()
  @ApiOperation({ summary: 'Solo administradores - RBAC' })
  @ApiResponse({ status: 200, description: 'Acceso de administrador' })
  @ApiResponse({ status: 403, description: 'Rol de administrador requerido' })
  getAdminData(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Este endpoint solo es accesible para administradores',
      user: {
        id: user.id,
        roles: user.roles,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('manager-or-admin')
  @UseGuards(JwtGuard, RbacGuard)
  @RequireAdminOrManager()
  @ApiOperation({ summary: 'Administradores o Managers - RBAC' })
  @ApiResponse({ status: 200, description: 'Acceso de admin o manager' })
  @ApiResponse({ status: 403, description: 'Rol de admin o manager requerido' })
  getManagerData(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Este endpoint es accesible para administradores y managers',
      user: {
        id: user.id,
        roles: user.roles,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('create-with-roles')
  @UseGuards(JwtGuard, RbacGuard)
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Crear recurso - Múltiples roles' })
  @ApiResponse({ status: 201, description: 'Recurso creado' })
  @HttpCode(HttpStatus.CREATED)
  createWithRoles(
    @Body() createDto: CreateResourceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Recurso creado con protección RBAC',
      resource: {
        id: `res_${Date.now()}`,
        ...createDto,
        userId: user.id,
        createdBy: user.email,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // =================================
  // EJEMPLOS DE PROTECCIÓN ABAC
  // =================================

  @Get('resources/:id')
  @UseGuards(JwtGuard, AbacGuard)
  @CanRead('resource')
  @ApiOperation({ summary: 'Leer recurso - ABAC básico' })
  @ApiResponse({ status: 200, description: 'Recurso encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de lectura' })
  getResource(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    // Simular recurso (en la vida real vendría de la base de datos)
    const resource = {
      id,
      name: `Resource ${id}`,
      description: 'Example resource',
      userId: user.id, // Simular que el usuario es propietario
      tenantId: user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      message: 'Recurso obtenido con protección ABAC',
      resource,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('resources/:id')
  @UseGuards(JwtGuard, AbacGuard)
  @CanWrite('resource')
  @RequireResourceOwner()
  @ApiOperation({ summary: 'Actualizar recurso - Solo propietario' })
  @ApiResponse({ status: 200, description: 'Recurso actualizado' })
  @ApiResponse({
    status: 403,
    description: 'Solo el propietario puede actualizar',
  })
  updateResource(
    @Param('id') id: string,
    @Body() updateDto: UpdateResourceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Recurso actualizado - Solo propietario puede hacerlo',
      resource: {
        id,
        ...updateDto,
        userId: user.id,
        updatedAt: new Date(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('resources/:id')
  @UseGuards(JwtGuard, AbacGuard)
  @CanDelete('resource')
  @RequireResourceOwner()
  @ApiOperation({ summary: 'Eliminar recurso - Solo propietario' })
  @ApiResponse({ status: 200, description: 'Recurso eliminado' })
  @ApiResponse({
    status: 403,
    description: 'Solo el propietario puede eliminar',
  })
  deleteResource(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Recurso eliminado - Solo propietario puede hacerlo',
      deletedResource: {
        id,
        userId: user.id,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tenant-resources')
  @UseGuards(JwtGuard, AbacGuard)
  @RequireSameTenant()
  @ApiOperation({ summary: 'Recursos del tenant - ABAC multi-tenant' })
  @ApiResponse({ status: 200, description: 'Recursos del mismo tenant' })
  @ApiResponse({
    status: 403,
    description: 'Acceso solo dentro del mismo tenant',
  })
  getTenantResources(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Recursos del tenant - Solo usuarios del mismo tenant',
      tenant: {
        id: user.tenantId,
        userId: user.id,
      },
      resources: [
        { id: 'res_1', name: 'Resource 1', tenantId: user.tenantId },
        { id: 'res_2', name: 'Resource 2', tenantId: user.tenantId },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @Post('business-hours-only')
  @UseGuards(JwtGuard, AbacGuard)
  @RequireBusinessHours()
  @ApiOperation({ summary: 'Solo horario laboral - ABAC temporal' })
  @ApiResponse({
    status: 201,
    description: 'Operación realizada en horario laboral',
  })
  @ApiResponse({
    status: 403,
    description: 'Operación solo permitida en horario laboral (9 AM - 6 PM)',
  })
  @HttpCode(HttpStatus.CREATED)
  businessHoursOperation(@CurrentUser() user: AuthenticatedUser) {
    const currentHour = new Date().getHours();

    return {
      message: 'Operación realizada en horario laboral',
      user: {
        id: user.id,
        email: user.email,
      },
      businessHours: {
        current: `${currentHour}:00`,
        allowed: '9:00 - 18:00',
      },
      timestamp: new Date().toISOString(),
    };
  }

  // =================================
  // EJEMPLOS COMBINADOS RBAC + ABAC
  // =================================

  @Post('admin-resources')
  @UseGuards(JwtGuard, RbacGuard, AbacGuard)
  @RequireAdmin()
  @CanWrite('admin-resource')
  @RequireSameTenant()
  @ApiOperation({ summary: 'Crear recurso admin - RBAC + ABAC combinado' })
  @ApiResponse({ status: 201, description: 'Recurso admin creado' })
  @ApiResponse({
    status: 403,
    description: 'Requiere rol admin + permisos ABAC',
  })
  @HttpCode(HttpStatus.CREATED)
  createAdminResource(
    @Body() createDto: CreateResourceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Recurso admin creado con protección RBAC + ABAC',
      resource: {
        id: `admin_res_${Date.now()}`,
        ...createDto,
        type: 'admin-resource',
        userId: user.id,
        tenantId: user.tenantId,
        createdBy: user.email,
        roles: user.roles,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // =================================
  // ENDPOINT DE INFORMACIÓN
  // =================================

  @Get('user-info')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Información del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Información completa del usuario' })
  getUserInfo(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Información completa del usuario autenticado',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
        tenantId: user.tenantId,
        tokenPayload: {
          iss: user.payload.iss,
          aud: user.payload.aud,
          exp: user.payload.exp,
          iat: user.payload.iat,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
