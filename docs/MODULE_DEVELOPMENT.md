# 📋 Documentación de Desarrollo - Módulo Tasks

## 📖 Visión General

El módulo **Tasks** es una implementación completa de gestión de tareas que sigue las mejores prácticas de desarrollo en NestJS. Proporciona operaciones CRUD completas, filtros avanzados, métricas, paginación y una arquitectura limpia siguiendo el patrón Repository-Service-Controller.

### 🎯 Características Principales

- ✅ **Arquitectura Limpia**: Separación clara de responsabilidades (Repository → Service → Controller)
- ✅ **Validación Completa**: DTOs con class-validator y transformación automática
- ✅ **Documentación API**: Swagger/OpenAPI completo con ejemplos
- ✅ **Logging Estructurado**: Seguimiento completo de operaciones y errores
- ✅ **Manejo de Estados**: Sistema robusto de estados de tarea con validaciones
- ✅ **Paginación y Filtros**: Soporte avanzado para consultas complejas
- ✅ **Métricas**: Estadísticas en tiempo real del sistema de tareas
- ✅ **Interfaces TypeScript**: Contratos claros para mantenibilidad

---

## 🏗️ Arquitectura del Módulo

### Estructura de Directorios

```
src/modules/tasks/
├── 📄 tasks.module.ts           # Configuración del módulo
├── 📄 tasks.controller.ts       # Endpoints REST API
├── 📄 tasks.service.ts          # Lógica de negocio
├── 📄 tasks.repository.ts       # Acceso a datos (Prisma)
├── 📁 dto/                      # Data Transfer Objects
│   ├── 📄 create-task.dto.ts
│   ├── 📄 update-task.dto.ts
│   ├── 📄 task.response.dto.ts
│   ├── 📄 task-filters.dto.ts
│   └── 📄 index.ts
├── 📁 entities/                 # Definiciones de entidades
│   ├── 📄 task.entity.ts        # Clase Task con métodos
│   ├── 📄 types.ts              # Enums y tipos TypeScript
│   └── 📄 index.ts
└── 📁 interfaces/               # Interfaces TypeScript
    ├── 📄 tasks.interface.ts    # Contratos del módulo
    └── 📄 index.ts
```

### Dependencias del Módulo

```typescript
// tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],                    // ✅ Dependencia de BD
  controllers: [TasksController],               // ✅ Exposición de endpoints
  providers: [TasksService, TasksRepository],   // ✅ Servicios disponibles
  exports: [TasksService],                      // ✅ Servicio exportado para otros módulos
})
export class TasksModule {}
```

---

## 📊 Modelo de Datos

### Entidad Task

```typescript
// entities/task.entity.ts
export class Task {
  id: number;           // Identificador único
  title: string;        // Título (único, 1-200 chars)
  description?: string; // Descripción opcional (0-1000 chars)
  status: TaskStatus;   // Estado actual
  createdAt: Date;      // Fecha de creación
  updatedAt: Date;      // Fecha de actualización

  // Métodos de negocio
  isCompleted(): boolean;
  isPending(): boolean;
  isInProgress(): boolean;
  isCancelled(): boolean;

  // Operaciones de estado
  markAsCompleted(): void;
  markAsInProgress(): void;
  markAsCancelled(): void;
}
```

### Estados de Tarea

```typescript
// entities/types.ts
export enum TaskStatus {
  PENDING = 'pending',        // Pendiente - estado inicial
  IN_PROGRESS = 'in_progress', // En progreso - tarea activa
  COMPLETED = 'completed',    // Completada - tarea finalizada
  CANCELLED = 'cancelled',    // Cancelada - tarea abortada
}
```

### Transiciones de Estado Válidas

```
PENDING ──────▶ IN_PROGRESS ──────▶ COMPLETED
    │                │
    │                └───▶ CANCELLED
    └───▶ CANCELLED
```

---

## 🔌 API Endpoints

### Base URL: `/tasks`

### 1. **GET /tasks** - Listar Tareas
Obtiene todas las tareas con paginación opcional.

**Parámetros Query:**
- `page` (number, opcional): Página actual (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10, max: 100)
- `sortBy` (string, opcional): Campo de ordenamiento ('id', 'title', 'status', 'createdAt', 'updatedAt')
- `sortOrder` (string, opcional): Orden ('asc', 'desc')

**Ejemplo de Request:**
```bash
GET /tasks?page=1&limit=5&sortBy=createdAt&sortOrder=desc
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "title": "Implementar autenticación JWT",
    "description": "Sistema completo de auth con guards y middleware",
    "status": "in_progress",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
]
```

### 2. **GET /tasks/paginated** - Listar con Metadatos
Igual que el anterior pero incluye información de paginación completa.

**Respuesta Exitosa (200):**
```json
{
  "data": [...], // Array de tareas
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 3. **GET /tasks/:id** - Obtener por ID
Busca una tarea específica por su identificador.

**Parámetros Path:**
- `id` (number): ID de la tarea

**Ejemplo:**
```bash
GET /tasks/42
```

**Respuesta Exitosa (200):**
```json
{
  "id": 42,
  "title": "Refactorizar código legacy",
  "status": "pending",
  "createdAt": "2024-01-10T09:00:00.000Z",
  "updatedAt": "2024-01-10T09:00:00.000Z"
}
```

**Error (404):**
```json
{
  "statusCode": 404,
  "message": "Task with ID 42 not found",
  "error": "Not Found"
}
```

### 4. **GET /tasks/status/:status** - Filtrar por Estado
Obtiene tareas filtradas por estado específico.

**Parámetros Path:**
- `status` (TaskStatus): Estado a filtrar

**Ejemplo:**
```bash
GET /tasks/status/completed?page=1&limit=20
```

### 5. **GET /tasks/search** - Búsqueda Avanzada
Búsqueda con filtros múltiples.

**Parámetros Query:**
- `status` (TaskStatus, opcional): Filtrar por estado
- `startDate` (Date, opcional): Fecha inicio (YYYY-MM-DD)
- `endDate` (Date, opcional): Fecha fin (YYYY-MM-DD)
- `search` (string, opcional): Búsqueda en título/descripción

**Ejemplo:**
```bash
GET /tasks/search?status=completed&startDate=2024-01-01&search=autenticación
```

### 6. **POST /tasks** - Crear Tarea
Crea una nueva tarea en el sistema.

**Body Request:**
```json
{
  "title": "Implementar sistema de notificaciones",
  "description": "Crear módulo de notificaciones con email y push",
  "status": "pending"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": 3,
  "title": "Implementar sistema de notificaciones",
  "description": "Crear módulo de notificaciones con email y push",
  "status": "pending",
  "createdAt": "2024-01-17T08:30:00.000Z",
  "updatedAt": "2024-01-17T08:30:00.000Z"
}
```

**Errores de Validación (400):**
```json
{
  "statusCode": 400,
  "message": [
    "title must be longer than or equal to 1 characters",
    "title must be shorter than or equal to 200 characters"
  ],
  "error": "Bad Request"
}
```

### 7. **PUT /tasks/:id** - Actualizar Completa
Actualiza todos los campos de una tarea existente.

**Parámetros Path:**
- `id` (number): ID de la tarea

**Body Request:**
```json
{
  "title": "Implementar sistema de notificaciones push",
  "description": "Actualizar módulo para incluir notificaciones push",
  "status": "in_progress"
}
```

### 8. **PATCH /tasks/:id** - Actualización Parcial
Actualiza solo los campos proporcionados.

**Ejemplo:**
```json
{
  "status": "completed"
}
```

### 9. **PATCH /tasks/:id/complete** - Marcar como Completada
Cambia el estado de la tarea a COMPLETED.

**Ejemplo:**
```bash
PATCH /tasks/42/complete
```

### 10. **PATCH /tasks/:id/in-progress** - Marcar como En Progreso
Cambia el estado de la tarea a IN_PROGRESS.

### 11. **PATCH /tasks/:id/cancel** - Marcar como Cancelada
Cambia el estado de la tarea a CANCELLED.

### 12. **DELETE /tasks/:id** - Eliminar Tarea
Elimina una tarea del sistema.

**Respuesta Exitosa (204):** Sin contenido

### 13. **GET /tasks/metrics** - Obtener Métricas
Retorna estadísticas generales del sistema de tareas.

**Respuesta Exitosa (200):**
```json
{
  "total": 25,
  "pending": 8,
  "inProgress": 5,
  "completed": 10,
  "cancelled": 2,
  "createdToday": 3
}
```

---

## 🔧 Implementación por Capas

### Controller Layer

```typescript
// tasks.controller.ts
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas' })
  @ApiResponse({ status: 200, type: [TaskResponseDto] })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) pagination: PaginationDto,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.tasksService.findAll(pagination);
    return tasks.map(task => new TaskResponseDto(task));
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva tarea' })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  async create(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.create(createTaskDto);
    return new TaskResponseDto(task);
  }
}
```

### Service Layer

```typescript
// tasks.service.ts
@Injectable()
export class TasksService implements TaskServiceInterface {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly tasksRepository: TasksRepository) {}

  async create(data: CreateTaskData): Promise<TaskResponse> {
    this.logger.log(`Creating task: ${data.title}`);

    try {
      // Validación de negocio
      if (await this.tasksRepository.existsByTitle(data.title)) {
        throw new ConflictException('Task title already exists');
      }

      const task = await this.tasksRepository.create(data);
      this.logger.log(`Task created successfully: ${task.id}`);
      return task;
    } catch (error) {
      this.logger.error('Error creating task:', error);
      throw error;
    }
  }

  async markAsCompleted(id: number): Promise<TaskResponse> {
    const task = await this.findById(id);

    // Validación de transición de estado
    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Task is already completed');
    }

    return this.tasksRepository.update(id, { status: TaskStatus.COMPLETED });
  }
}
```

### Repository Layer

```typescript
// tasks.repository.ts
@Injectable()
export class TasksRepository implements TaskRepositoryInterface {
  private readonly logger = new Logger(TasksRepository.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findByFilters(
    filters: TaskFilters,
    options?: PaginationOptions,
  ): Promise<TaskResponse[]> {
    const where: any = {};

    // Aplicar filtros
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const tasks = await this.databaseService.tasks.findMany({
      where,
      skip: options?.skip,
      take: options?.limit,
      orderBy: { [options?.sortBy || 'createdAt']: options?.sortOrder || 'desc' },
    });

    return tasks.map(task => this.mapToTaskResponse(task));
  }

  private mapToTaskResponse(task: any): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
```

---

## ✅ Validación y DTOs

### CreateTaskDto

```typescript
// dto/create-task.dto.ts
export class CreateTaskDto {
  @ApiProperty({
    description: 'Título único de la tarea',
    example: 'Implementar CI/CD pipeline',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    description: 'Descripción detallada (opcional)',
    example: 'Configurar pipeline completo con tests automatizados',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.PENDING;
}
```

### UpdateTaskDto

```typescript
// dto/update-task.dto.ts
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
```

### TaskFiltersDto

```typescript
// dto/task-filters.dto.ts
export class TaskFiltersDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  endDate?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string;
}
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Crear Tarea Básica

```typescript
// En el controller
@Post()
async create(@Body(ValidationPipe) dto: CreateTaskDto) {
  return this.tasksService.create(dto);
}

// Request
POST /tasks
{
  "title": "Configurar base de datos"
}

// Response 201
{
  "id": 1,
  "title": "Configurar base de datos",
  "status": "pending",
  "createdAt": "2024-01-17T10:00:00.000Z",
  "updatedAt": "2024-01-17T10:00:00.000Z"
}
```

### Caso 2: Workflow Completo de Tarea

```typescript
// 1. Crear tarea
const task = await tasksService.create({
  title: "Implementar login system",
  description: "Sistema completo con JWT y refresh tokens"
});

// 2. Marcar como en progreso
await tasksService.markAsInProgress(task.id);

// 3. Completar tarea
await tasksService.markAsCompleted(task.id);

// Estados finales: PENDING → IN_PROGRESS → COMPLETED
```

### Caso 3: Búsqueda y Filtrado

```typescript
// Buscar tareas completadas esta semana
const filters = {
  status: TaskStatus.COMPLETED,
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
};

const completedTasks = await tasksService.findByFilters(filters, {
  page: 1,
  limit: 20,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
});
```

### Caso 4: Dashboard con Métricas

```typescript
// Obtener métricas para dashboard
const metrics = await tasksService.getMetrics();

// Resultado típico:
// {
//   total: 150,
//   pending: 45,
//   inProgress: 23,
//   completed: 78,
//   cancelled: 4,
//   createdToday: 7
// }

// Calcular porcentajes
const completionRate = (metrics.completed / metrics.total) * 100;
const activeTasks = metrics.pending + metrics.inProgress;
```

### Caso 5: Bulk Operations (Implementación Futura)

```typescript
// Ejemplo de como implementar operaciones masivas
async markMultipleAsCompleted(ids: number[]): Promise<TaskResponse[]> {
  const results = await Promise.allSettled(
    ids.map(id => this.tasksService.markAsCompleted(id))
  );

  const successful = results
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<TaskResponse>).value);

  const failed = results
    .filter(result => result.status === 'rejected')
    .map(result => (result as PromiseRejectedResult).reason);

  this.logger.log(`Bulk completion: ${successful.length} success, ${failed.length} failed`);

  return successful;
}
```

---

## 🔍 Manejo de Errores

### Tipos de Errores Comunes

```typescript
// tasks.service.ts - Validaciones de negocio
async update(id: number, data: UpdateTaskData): Promise<TaskResponse> {
  // Validar existencia
  const existingTask = await this.tasksRepository.findById(id);
  if (!existingTask) {
    throw new NotFoundException(`Task with ID ${id} not found`);
  }

  // Validar unicidad de título
  if (data.title && data.title !== existingTask.title) {
    const titleExists = await this.tasksRepository.existsByTitle(data.title);
    if (titleExists) {
      throw new ConflictException('Task title already exists');
    }
  }

  // Validar transiciones de estado
  if (data.status && !this.isValidStatusTransition(existingTask.status, data.status)) {
    throw new BadRequestException(
      `Invalid status transition from ${existingTask.status} to ${data.status}`
    );
  }

  return this.tasksRepository.update(id, data);
}

private isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
  const validTransitions = {
    [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
    [TaskStatus.COMPLETED]: [], // No transitions from completed
    [TaskStatus.CANCELLED]: [], // No transitions from cancelled
  };

  return validTransitions[from].includes(to);
}
```

### Códigos de Error HTTP

| Código | Situación | Ejemplo |
|--------|-----------|---------|
| 200 | Éxito | Operación completada |
| 201 | Creado | Tarea creada exitosamente |
| 204 | Sin Contenido | Tarea eliminada |
| 400 | Bad Request | Datos inválidos, transición de estado inválida |
| 404 | Not Found | Tarea no encontrada |
| 409 | Conflict | Título duplicado |
| 500 | Internal Error | Error del servidor |

---

## 📈 Métricas y Monitoreo

### Logging Estructurado

```typescript
// tasks.service.ts
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  async create(data: CreateTaskData): Promise<TaskResponse> {
    this.logger.log(`Creating task: ${data.title}`);

    try {
      const startTime = Date.now();
      const task = await this.tasksRepository.create(data);
      const duration = Date.now() - startTime;

      this.logger.log(`Task created successfully: ${task.id} (${duration}ms)`);
      return task;
    } catch (error) {
      this.logger.error(`Failed to create task: ${data.title}`, {
        error: error.message,
        stack: error.stack,
        data,
      });
      throw error;
    }
  }
}
```

### Métricas de Rendimiento

```typescript
// tasks.service.ts - Métricas adicionales
async getPerformanceMetrics(): Promise<any> {
  const [
    totalTasks,
    completedTasks,
    avgCompletionTime,
    tasksByDay,
  ] = await Promise.all([
    this.tasksRepository.count(),
    this.tasksRepository.count({ status: TaskStatus.COMPLETED }),
    this.calculateAverageCompletionTime(),
    this.getTasksCreatedByDay(30), // Últimos 30 días
  ]);

  return {
    overview: {
      totalTasks,
      completionRate: (completedTasks / totalTasks) * 100,
      avgCompletionTime: `${avgCompletionTime} days`,
    },
    trends: {
      tasksByDay,
      completionTrend: this.calculateCompletionTrend(tasksByDay),
    },
  };
}
```

---

## 🧪 Testing

### Unit Tests para Service

```typescript
// tasks.service.spec.ts
describe('TasksService', () => {
  let service: TasksService;
  let repository: TasksRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            existsByTitle: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<TasksRepository>(TasksRepository);
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const mockTask = { id: 1, title: 'Test Task', status: 'pending' };
      jest.spyOn(repository, 'create').mockResolvedValue(mockTask);
      jest.spyOn(repository, 'existsByTitle').mockResolvedValue(false);

      const result = await service.create({ title: 'Test Task' });

      expect(result).toEqual(mockTask);
      expect(repository.create).toHaveBeenCalledWith({ title: 'Test Task' });
    });

    it('should throw ConflictException for duplicate title', async () => {
      jest.spyOn(repository, 'existsByTitle').mockResolvedValue(true);

      await expect(
        service.create({ title: 'Duplicate Title' })
      ).rejects.toThrow(ConflictException);
    });
  });
});
```

### E2E Tests para API

```typescript
// tasks.e2e-spec.ts
describe('Tasks (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /tasks', () => {
    it('should create a task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'E2E Test Task',
          description: 'Created by e2e test',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('E2E Test Task');
          expect(res.body.status).toBe('pending');
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({})
        .expect(400);
    });
  });
});
```

---

## 🚀 Mejores Prácticas Implementadas

### 1. **Separación de Responsabilidades**
- **Controller**: Solo manejo HTTP y transformación de datos
- **Service**: Lógica de negocio y validaciones
- **Repository**: Acceso a datos y consultas

### 2. **Validación Robusta**
- DTOs con class-validator para entrada
- Validaciones de negocio en service layer
- Transformaciones automáticas (trim, lowercase)

### 3. **Manejo de Errores Consistente**
- Excepciones específicas de NestJS
- Logging detallado de errores
- Mensajes de error descriptivos

### 4. **Documentación Completa**
- Swagger/OpenAPI para todos los endpoints
- Ejemplos en documentación
- Descripciones detalladas de parámetros

### 5. **Logging Estructurado**
- Contexto en cada log
- Niveles apropiados (log, warn, error)
- Información útil para debugging

### 6. **Arquitectura Escalable**
- Interfaces para contratos claros
- Inyección de dependencias
- Módulos independientes

---

## 🔄 Próximas Extensiones

### 1. **Autenticación y Autorización**
```typescript
// Futura implementación con guards
@Post()
@UseGuards(JwtGuard, TasksGuard)
@Roles('admin', 'manager')
async create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
  return this.tasksService.create({ ...dto, createdBy: user.id });
}
```

### 2. **Eventos y Webhooks**
```typescript
// Sistema de eventos para integraciones
@Injectable()
export class TaskEventsService {
  @OnEvent('task.completed')
  async handleTaskCompleted(payload: TaskEvent) {
    // Enviar notificaciones, actualizar dashboards, etc.
  }
}
```

### 3. **Caching**
```typescript
// Cache para métricas y consultas frecuentes
@Injectable()
export class TasksService {
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutos
  async getMetrics(): Promise<TaskMetrics> {
    // Lógica de métricas con cache
  }
}
```

### 4. **Auditoría**
```typescript
// Tracking de cambios
interface TaskAuditLog {
  taskId: number;
  action: 'created' | 'updated' | 'deleted';
  oldValues?: Partial<TaskResponse>;
  newValues: Partial<TaskResponse>;
  userId: string;
  timestamp: Date;
}
```

---

## 📚 Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

*Esta documentación refleja la implementación actual del módulo Tasks siguiendo las mejores prácticas de desarrollo establecidas en la Guía de Desarrollo de Flucastr Lleva.*
