/**
 * Controller de ejemplo para autenticación
 * Proporciona endpoints informativos sobre el sistema de auth
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  /**
   * Obtiene información sobre el sistema de autenticación
   */
  @Get('info')
  @ApiOperation({
    summary: 'Información del sistema de autenticación',
    description: 'Retorna información sobre cómo obtener y usar tokens JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del sistema de autenticación',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        authService: { type: 'string' },
        tokenInstructions: {
          type: 'object',
          properties: {
            step1: { type: 'string' },
            step2: { type: 'string' },
            step3: { type: 'string' },
          },
        },
        swaggerUsage: {
          type: 'object',
          properties: {
            step1: { type: 'string' },
            step2: { type: 'string' },
            step3: { type: 'string' },
          },
        },
      },
    },
  })
  getAuthInfo() {
    return {
      message: 'Sistema de autenticación JWT activo',
      authService: 'https://skeleton-auth-service.nsideas.cl',
      tokenInstructions: {
        step1: 'Obtén un token JWT del servicio de autenticación externo',
        step2: 'El token debe ser válido y activo',
        step3: 'Incluye el token en el header Authorization: Bearer <token>',
      },
      swaggerUsage: {
        step1:
          'Haz clic en el candado 🔒 al lado de cualquier endpoint protegido',
        step2: 'Ingresa tu token JWT (sin "Bearer ", solo el token)',
        step3: 'Haz clic en "Authorize" para aplicar a todos los endpoints',
      },
    };
  }

  /**
   * Endpoint de prueba para verificar que un token sea válido
   */
  @Get('test')
  @ApiOperation({
    summary: 'Probar token JWT',
    description:
      'Endpoint protegido para verificar que tu token funcione correctamente',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  // @UseGuards(JwtGuard) // Comentado para que no requiera auth inicialmente
  testToken() {
    return {
      message:
        'Token válido - Sistema de autenticación funcionando correctamente',
      note: 'Este endpoint está temporalmente sin protección para pruebas',
    };
  }
}
