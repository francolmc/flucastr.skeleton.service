# Integración de Autenticación en Microservicios

## 🎯 Resumen

Esta guía explica paso a paso cómo integrar el sistema de autenticación JWT + RBAC + ABAC en otros microservicios de Flucastr. El servicio de autenticación centralizado genera y valida tokens, mientras que los microservicios consumidores implementan guards para proteger sus endpoints.

## 🏗️ Arquitectura de Integración

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Auth Service  │───▶│  JWT Token       │───▶│ Microservicio X │
│  (Centralizado) │    │  (Bearer Token)  │    │ (Consumidor)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                                              │
         │                                              ▼
         └──────────────────────────────────────┌─────────────────┐
                                                │   Guards Chain   │
                                                │   JWT → RBAC →   │
                                                │   ABAC → Endpoint│
                                                └─────────────────┘
```

## 📋 Paso 1: Configuración del Microservicio

### 1.1 Dependencias Requeridas

Agrega las siguientes dependencias a tu `package.json`:

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@nestjs/swagger": "^7.0.0"
  }
}
```

### 1.2 Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```bash
# JWT Configuration (debe coincidir con el Auth Service)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ISSUER=flucastr-auth-service
JWT_AUDIENCE=flucastr-services

# Auth Service Configuration
AUTH_SERVICE_URL=http://localhost:3001
AUTH_SERVICE_INTROSPECT_ENDPOINT=/auth/introspect

# Token Extraction
JWT_EXTRACT_FROM_HEADER=true
JWT_HEADER_NAME=authorization
JWT_HEADER_PREFIX=Bearer
```

## 🔧 Paso 2: Implementación de Guards

### 2.1 JWT Guard

Crea el archivo `src/shared/guards/jwt.guard.ts`:

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  token_type: string;
}

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
        issuer: this.configService.get<string>('JWT_ISSUER'),
        audience: this.configService.get<string>('JWT_AUDIENCE'),
      });

      // Attach user to request object
      request.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };

      return true;
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const headerName = this.configService.get<string>('JWT_HEADER_NAME', 'authorization');
    const prefix = this.configService.get<string>('JWT_HEADER_PREFIX', 'Bearer');

    const authHeader = request.headers[headerName.toLowerCase()];
    if (!authHeader || !authHeader.startsWith(`${prefix} `)) {
      return undefined;
    }

    return authHeader.substring(prefix.length + 1);
  }
}
```

### 2.2 RBAC Guard

Crea el archivo `src/shared/guards/rbac.guard.ts`:

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('User roles not found');
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

### 2.3 ABAC Guard (Opcional)

Crea el archivo `src/shared/guards/abac.guard.ts`:

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export interface AbacPolicy {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export const ABAC_KEY = 'abac';
export const RequireAbac = (policy: AbacPolicy) => SetMetadata(ABAC_KEY, policy);

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const policy = this.reflector.getAllAndOverride<AbacPolicy>(ABAC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!policy) {
      return true; // No ABAC policy required
    }

    const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();

    // Implement your ABAC logic here
    // This is a simplified example
    return this.evaluatePolicy(policy, user, request);
  }

  private evaluatePolicy(policy: AbacPolicy, user: any, request: any): boolean {
    // Example: Check if user owns the resource
    if (policy.resource === 'user' && policy.action === 'update') {
      const resourceId = request.params.id;
      return user.id === resourceId;
    }

    // Add more ABAC rules as needed
    return false;
  }
}
```

## 🔄 Paso 3: Servicio de Introspección

### 3.1 Auth Service

Crea el archivo `src/shared/services/auth.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface TokenIntrospectResponse {
  active: boolean;
  sub?: string;
  email?: string;
  roles?: string[];
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  token_type?: string;
  error?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.httpClient = axios.create({
      baseURL: this.configService.get<string>('AUTH_SERVICE_URL'),
      timeout: 5000,
    });
  }

  async introspectToken(token: string): Promise<TokenIntrospectResponse> {
    try {
      const response = await this.httpClient.post<TokenIntrospectResponse>(
        this.configService.get<string>('AUTH_SERVICE_INTROSPECT_ENDPOINT', '/auth/introspect'),
        { token }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Token introspection failed: ${error.message}`);
      return {
        active: false,
        error: 'Token introspection failed',
      };
    }
  }
}
```

## ⚙️ Paso 4: Configuración del Módulo

### 4.1 App Module

Actualiza tu `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './shared/services/auth.service';
import { JwtGuard } from './shared/guards/jwt.guard';
import { RbacGuard } from './shared/guards/rbac.guard';
import { AbacGuard } from './shared/guards/abac.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      },
    }),
  ],
  providers: [
    AuthService,
    JwtGuard,
    RbacGuard,
    AbacGuard,
  ],
  exports: [
    AuthService,
    JwtGuard,
    RbacGuard,
    AbacGuard,
  ],
})
export class AppModule {}
```

## 🎯 Paso 5: Uso en Controladores

### 5.1 Ejemplo de Controlador Protegido

```typescript
import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../shared/guards/jwt.guard';
import { RbacGuard, RequireRoles } from '../shared/guards/rbac.guard';
import { AbacGuard, RequireAbac } from '../shared/guards/abac.guard';

@ApiTags('Example')
@Controller('example')
export class ExampleController {

  @Get('public')
  @ApiOperation({ summary: 'Endpoint público' })
  getPublicData() {
    return { message: 'This is public data' };
  }

  @Get('protected')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Endpoint protegido con JWT' })
  getProtectedData(@Req() request: any) {
    return {
      message: 'This is protected data',
      user: request.user,
    };
  }

  @Get('admin-only')
  @UseGuards(JwtGuard, RbacGuard)
  @RequireRoles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Endpoint solo para administradores' })
  getAdminData(@Req() request: any) {
    return {
      message: 'This is admin-only data',
      user: request.user,
    };
  }

  @Get('user-profile')
  @UseGuards(JwtGuard, AbacGuard)
  @RequireAbac({
    resource: 'user',
    action: 'read',
  })
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Perfil de usuario (ABAC)' })
  getUserProfile(@Req() request: any) {
    return {
      message: 'This is your profile',
      user: request.user,
    };
  }
}
```

## 🔧 Paso 6: Configuración de Swagger

### 6.1 Swagger Config

Actualiza tu configuración de Swagger en `src/config/swagger.config.ts`:

```typescript
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Flucastr Microservice API')
  .setDescription('API documentation for Flucastr microservice')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT'
  )
  .build();
```

## 🧪 Paso 7: Testing

### 7.1 Ejemplo de Test

Crea el archivo `src/example/example.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExampleController } from './example.controller';
import { JwtGuard } from '../shared/guards/jwt.guard';
import { RbacGuard } from '../shared/guards/rbac.guard';

describe('ExampleController', () => {
  let controller: ExampleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [
        {
          provide: JwtGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: RbacGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    controller = module.get<ExampleController>(ExampleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

## 🚀 Paso 8: Despliegue

### 8.1 Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET coincide con el Auth Service
- [ ] Guards implementados y probados
- [ ] Endpoints protegidos correctamente
- [ ] Swagger configurado
- [ ] Tests pasando
- [ ] Documentación actualizada

### 8.2 Variables de Producción

```bash
# Production Environment Variables
JWT_SECRET=your-production-super-secret-key
AUTH_SERVICE_URL=https://auth.flucastr.com
NODE_ENV=production
```

## 🔍 Troubleshooting

### Problema: "Invalid token"
**Solución**: Verifica que el JWT_SECRET coincida exactamente con el del Auth Service.

### Problema: "Insufficient permissions"
**Solución**: Verifica que los roles del usuario estén correctamente configurados en el Auth Service.

### Problema: Guards no se ejecutan
**Solución**: Asegúrate de que los guards estén registrados en el módulo y que `@UseGuards()` esté aplicado correctamente.

### Problema: Token introspection falla
**Solución**: Verifica la conectividad con el Auth Service y que el endpoint de introspección esté disponible.

## 📚 Recursos Adicionales

- [Documentación del Auth Service](./AUTHENTICATION.md)
- [Guía de Desarrollo](./DEVELOPMENT_GUIDE.md)
- [Variables de Entorno](./ENVIRONMENT_VARIABLES.md)