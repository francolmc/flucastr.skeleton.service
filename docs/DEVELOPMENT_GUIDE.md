# Guía de Desarrollo - Flucastr Lleva Microservicios

## 📋 Tabla de Contenidos

1. [Estructura General del Proyecto](#estructura-general-del-proyecto)
2. [Arquitectura de Módulos](#arquitectura-de-módulos)
3. [Patrones de Desarrollo](#patrones-de-desarrollo)
4. [Convenciones de Código](#convenciones-de-código)
5. [Guías de Implementación](#guías-de-implementación)
6. [Buenas Prácticas](#buenas-prácticas)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 🏗️ Estructura General del Proyecto

### Estructura de Directorios

```
flucastr.lleva.SERVICE_NAME/
├── 📁 src/                          # Código fuente principal
│   ├── 📄 main.ts                   # Punto de entrada de la aplicación
│   ├── 📄 app.module.ts             # Módulo raíz de NestJS
│   ├── 📁 config/                   # Configuraciones específicas
│   ├── 📁 modules/                  # Módulos de negocio
│   │   ├── 📁 database/             # Configuración de base de datos
│   │   ├── 📁 health/               # Health checks
│   │   └── 📁 [business-module]/    # Módulos específicos del negocio
│   └── 📁 shared/                   # Utilidades compartidas
│       ├── 📁 interceptors/         # Interceptores globales
│       ├── 📁 guards/               # Guards de autenticación
│       ├── 📁 decorators/           # Decoradores personalizados
│       └── 📁 interfaces/           # Interfaces compartidas
├── 📁 prisma/                       # Schema y migraciones de BD
├── 📁 test/                         # Tests unitarios y e2e
├── 📁 docs/                         # Documentación del proyecto
├── 📁 logs/                         # Logs de aplicación
├── 📁 generated/                    # Código generado (Prisma client)
├── 📄 package.json                  # Dependencias y scripts
├── 📄 tsconfig.json                 # Configuración TypeScript
├── 📄 eslint.config.mjs             # Configuración ESLint
├── 📄 .prettierrc                   # Configuración Prettier
├── 📄 .env                          # Variables de entorno (template)
├── 📄 Dockerfile                    # Configuración Docker
└── 📄 README.md                     # Documentación del proyecto
```

### Archivos de Configuración Obligatorios

#### `package.json`
```json
{
  "name": "flucastr.lleva.SERVICE_NAME.service",
  "version": "0.0.1",
  "description": "Descripción específica del microservicio",
  "scripts": {
    "build": "nest build",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev --name dev",
    "prisma:studio": "prisma studio"
  }
}
```

#### `.env`
```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"

# Puerto del servicio
PORT=3001

# URLs de servicios externos
AUTH_SERVICE_URL="http://localhost:3000"
NOTIFICATION_SERVICE_URL="http://localhost:3002"

# Configuración específica del servicio
SERVICE_NAME="notification"
```

---

## 🏛️ Arquitectura de Módulos

### Estructura de un Módulo de Negocio

```
src/modules/[module-name]/
├── 📄 [module-name].module.ts       # Definición del módulo
├── 📄 [module-name].controller.ts   # Endpoints REST
├── 📄 [module-name].service.ts      # Lógica de negocio
├── 📄 [module-name].repository.ts   # Acceso a datos
├── 📁 dto/                         # Data Transfer Objects
│   ├── 📄 create-[entity].dto.ts
│   ├── 📄 update-[entity].dto.ts
│   └── 📄 [entity].response.dto.ts
├── 📁 entities/                    # Definiciones de entidades
│   ├── 📄 [entity].entity.ts
│   ├── 📄 types.ts                 # Enums y tipos
│   └── 📄 index.ts                 # Exportaciones
└── 📁 interfaces/                  # Interfaces TypeScript
    ├── 📄 [module-name].interface.ts
    └── 📄 index.ts
```

### Módulos Core Obligatorios

#### 1. Database Module
```typescript
// src/modules/database/database.module.ts
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

#### 2. Health Module
```typescript
// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return {
      status: 'ok',
      service: 'SERVICE_NAME',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
```

### Módulo de Negocio - Patrón Recomendado

```typescript
// [module-name].module.ts
import { Module } from '@nestjs/common';
import { [ModuleName]Controller } from './[module-name].controller';
import { [ModuleName]Service } from './[module-name].service';
import { [ModuleName]Repository } from './[module-name].repository';

@Module({
  controllers: [[ModuleName]Controller],
  providers: [[ModuleName]Service, [ModuleName]Repository],
  exports: [[ModuleName]Service],
})
export class [ModuleName]Module {}
```

---

## 🏗️ Patrones de Desarrollo

### 1. Patrón Repository

```typescript
// [module-name].repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class [ModuleName]Repository {
  private readonly logger = new Logger([ModuleName]Repository.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<[Entity][]> {
    return this.databaseService.[entity].findMany();
  }

  async findById(id: string): Promise<[Entity] | null> {
    return this.databaseService.[entity].findUnique({
      where: { id },
    });
  }

  async create(data: Create[Entity]Dto): Promise<[Entity]> {
    return this.databaseService.[entity].create({
      data,
    });
  }
}
```

### 2. Patrón Service

```typescript
// [module-name].service.ts
import { Injectable, Logger } from '@nestjs/common';
import { [ModuleName]Repository } from './[module-name].repository';
import { Create[Entity]Dto, Update[Entity]Dto } from './dto';

@Injectable()
export class [ModuleName]Service {
  private readonly logger = new Logger([ModuleName]Service.name);

  constructor(private readonly [moduleName]Repository: [ModuleName]Repository) {}

  async findAll(): Promise<[Entity][]> {
    this.logger.log('Finding all [entities]');
    return this.[moduleName]Repository.findAll();
  }

  async create(data: Create[Entity]Dto): Promise<[Entity]> {
    this.logger.log(`Creating new [entity]: ${JSON.stringify(data)}`);
    return this.[moduleName]Repository.create(data);
  }
}
```

### 3. Patrón Controller

```typescript
// [module-name].controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { [ModuleName]Service } from './[module-name].service';
import { Create[Entity]Dto } from './dto';

@ApiTags('[module-name]')
@Controller('[module-name]')
export class [ModuleName]Controller {
  constructor(private readonly [moduleName]Service: [ModuleName]Service) {}

  @Get()
  @ApiOperation({ summary: 'Get all [entities]' })
  @ApiResponse({ status: 200, description: '[Entities] retrieved successfully' })
  async findAll(): Promise<[Entity][]> {
    return this.[moduleName]Service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create [entity]' })
  @ApiResponse({ status: 201, description: '[Entity] created successfully' })
  async create(@Body() data: Create[Entity]Dto): Promise<[Entity]> {
    return this.[moduleName]Service.create(data);
  }
}
```

---

## 📝 Convenciones de Código

### Nombres de Archivos y Directorios

- **Módulos**: `kebab-case` (ej: `user-management`, `order-processing`)
- **Archivos**: `kebab-case` (ej: `user.service.ts`, `create-order.dto.ts`)
- **Clases**: `PascalCase` (ej: `UserService`, `CreateOrderDto`)
- **Métodos**: `camelCase` (ej: `findById()`, `createOrder()`)
- **Variables**: `camelCase` (ej: `userData`, `orderList`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `DEFAULT_LIMIT`, `MAX_RETRIES`)

### Estructura de Imports

```typescript
// 1. Imports de Node.js/Angular
import { Injectable } from '@nestjs/common';

// 2. Imports de librerías externas
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

// 3. Imports internos - ordenados por profundidad
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

// 4. Imports de tipos/interfaces (al final)
import type { UserResponse } from './interfaces/user.interface';
```

### Documentación de Código

```typescript
/**
 * Servicio para gestión de usuarios
 * Maneja operaciones CRUD y lógica de negocio relacionada con usuarios
 */
@Injectable()
export class UserService {
  /**
   * Busca un usuario por su ID
   * @param id - Identificador único del usuario
   * @returns Usuario encontrado o null si no existe
   * @throws NotFoundException si el usuario no existe
   */
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

---

## 🚀 Guías de Implementación

### 1. Creación de un Nuevo Módulo

```bash
# 1. Crear estructura de directorios
mkdir -p src/modules/[module-name]/{dto,entities,interfaces}

# 2. Crear archivos base
touch src/modules/[module-name]/[module-name].module.ts
touch src/modules/[module-name]/[module-name].controller.ts
touch src/modules/[module-name]/[module-name].service.ts
touch src/modules/[module-name]/[module-name].repository.ts

# 3. Crear DTOs básicos
touch src/modules/[module-name]/dto/create-[entity].dto.ts
touch src/modules/[module-name]/dto/update-[entity].dto.ts
touch src/modules/[module-name]/dto/[entity].response.dto.ts

# 4. Crear entidad
touch src/modules/[module-name]/entities/[entity].entity.ts
touch src/modules/[module-name]/entities/types.ts

# 5. Agregar al app.module.ts
# Importar y agregar el módulo a los imports
```

### 2. Definición de Entidades Prisma

```prisma
// prisma/schema.prisma
model [Entity] {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Campos específicos del negocio
  name      String
  email     String   @unique
  status    [Entity]Status @default(ACTIVE)

  // Relaciones
  orders    Order[]

  @@map("[entities]")
}

enum [Entity]Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

### 3. DTOs con Validación

```typescript
// dto/create-[entity].dto.ts
import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create[Entity]Dto {
  @ApiProperty({
    description: 'Nombre del [entidad]',
    example: 'Juan Pérez',
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Email del [entidad]',
    example: 'juan@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Teléfono (opcional)',
    example: '+56912345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
```

### 4. Interfaces TypeScript

```typescript
// interfaces/[module-name].interface.ts
export interface [Entity]Metrics {
  total: number;
  active: number;
  inactive: number;
  createdToday: number;
}

export interface [Entity]Filters {
  status?: [Entity]Status;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface [Entity]Response {
  id: string;
  name: string;
  email: string;
  status: [Entity]Status;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ✅ Buenas Prácticas

### 1. Principios SOLID

- **S**: Single Responsibility - Cada clase tiene una única responsabilidad
- **O**: Open/Closed - Abierto a extensión, cerrado a modificación
- **L**: Liskov Substitution - Los subtipos son sustituibles por sus tipos base
- **I**: Interface Segregation - Interfaces específicas mejor que generales
- **D**: Dependency Inversion - Depender de abstracciones, no de concretos

### 2. Manejo de Errores

```typescript
@Injectable()
export class [ModuleName]Service {
  async findById(id: string): Promise<[Entity]> {
    try {
      const entity = await this.repository.findById(id);
      if (!entity) {
        throw new NotFoundException(`[Entity] with ID ${id} not found`);
      }
      return entity;
    } catch (error) {
      this.logger.error(`Error finding [entity] ${id}:`, error);
      throw error;
    }
  }
}
```

### 3. Logging Estructurado

```typescript
@Injectable()
export class [ModuleName]Service {
  private readonly logger = new Logger([ModuleName]Service.name);

  async create(data: Create[Entity]Dto): Promise<[Entity]> {
    this.logger.log(`Creating [entity]: ${JSON.stringify(data)}`);

    try {
      const entity = await this.repository.create(data);
      this.logger.log(`[Entity] created successfully: ${entity.id}`);
      return entity;
    } catch (error) {
      this.logger.error(`Failed to create [entity]:`, {
        data,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

### 4. Validación de Datos

```typescript
// Usar class-validator en DTOs
export class Create[Entity]Dto {
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}

// Validación personalizada
export class Update[Entity]Dto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

### 5. Testing

```typescript
// [module-name].service.spec.ts
describe('[ModuleName]Service', () => {
  let service: [ModuleName]Service;
  let repository: [ModuleName]Repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [ModuleName]Service,
        {
          provide: [ModuleName]Repository,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<[ModuleName]Service>([ModuleName]Service);
    repository = module.get<[ModuleName]Repository>([ModuleName]Repository);
  });

  it('should return all [entities]', async () => {
    const mock[Entities] = [{ id: '1', name: 'Test' }];
    jest.spyOn(repository, 'findAll').mockResolvedValue(mock[Entities]);

    const result = await service.findAll();
    expect(result).toEqual(mock[Entities]);
  });
});
```

### 6. Documentación de APIs

```typescript
@ApiTags('[module-name]')
@Controller('[module-name]')
export class [ModuleName]Controller {
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los [entities]',
    description: 'Retorna una lista paginada de [entities]'
  })
  @ApiResponse({
    status: 200,
    description: '[Entities] obtenidos exitosamente',
    type: [[Entity]Response],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<[Entity]Response[]> {
    return this.service.findAll({ page, limit });
  }
}
```

---

## 💡 Ejemplos de Implementación

### Ejemplo Completo: Módulo de Notificaciones

#### Estructura
```
src/modules/notification/
├── notification.module.ts
├── notification.controller.ts
├── notification.service.ts
├── notification.repository.ts
├── dto/
│   ├── create-notification.dto.ts
│   ├── update-notification.dto.ts
│   └── notification.response.dto.ts
├── entities/
│   ├── notification.entity.ts
│   ├── types.ts
│   └── index.ts
└── interfaces/
    ├── notification.interface.ts
    └── index.ts
```

#### Entidad Prisma
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      NotificationType
  status    NotificationStatus @default(PENDING)
  createdAt DateTime @default(now())
  sentAt    DateTime?
  readAt    DateTime?

  @@map("notifications")
}

enum NotificationType {
  EMAIL
  SMS
  PUSH
  IN_APP
}

enum NotificationStatus {
  PENDING
  SENT
  DELIVERED
  READ
  FAILED
}
```

#### DTO de Creación
```typescript
export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 1000)
  message: string;

  @ApiProperty({ enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'] })
  @IsEnum(NotificationType)
  type: NotificationType;
}
```

#### Servicio con Lógica de Negocio
```typescript
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async sendNotification(data: CreateNotificationDto): Promise<Notification> {
    // Crear notificación en BD
    const notification = await this.notificationRepository.create({
      ...data,
      status: NotificationStatus.PENDING,
    });

    try {
      // Enviar según el tipo
      switch (data.type) {
        case NotificationType.EMAIL:
          await this.emailService.send(data.userId, data.title, data.message);
          break;
        case NotificationType.SMS:
          await this.smsService.send(data.userId, data.message);
          break;
      }

      // Actualizar estado
      return this.notificationRepository.update(notification.id, {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });
    } catch (error) {
      // Marcar como fallida
      await this.notificationRepository.update(notification.id, {
        status: NotificationStatus.FAILED,
      });
      throw error;
    }
  }
}
```

---

## 📚 Referencias y Recursos

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

*Esta guía se mantiene actualizada con las mejores prácticas del equipo de desarrollo de Flucastr Lleva.*