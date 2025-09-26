/**
 * Controlador REST para el módulo de Tasks
 * Expone endpoints HTTP para operaciones CRUD y funcionalidades específicas
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskResponseDto,
  PaginatedTaskResponseDto,
  TaskMetricsResponseDto,
  TaskSearchDto,
  PaginationDto,
} from './dto';
import { TaskStatus } from './entities/types';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Obtiene todas las tareas con paginación
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las tareas',
    description: 'Retorna una lista paginada de todas las tareas del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas obtenidas exitosamente',
    type: [TaskResponseDto],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (comenzando desde 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de elementos por página (máximo 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Campo por el cual ordenar',
    enum: ['id', 'title', 'status', 'createdAt', 'updatedAt'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Orden de clasificación',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) pagination: PaginationDto,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.tasksService.findAll(pagination);
    return tasks.map((task) => new TaskResponseDto(task));
  }

  /**
   * Obtiene todas las tareas con metadatos de paginación
   */
  @Get('paginated')
  @ApiOperation({
    summary: 'Obtener tareas con paginación completa',
    description:
      'Retorna tareas con metadatos de paginación (total, páginas, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas paginadas obtenidas exitosamente',
    type: PaginatedTaskResponseDto,
  })
  async findAllPaginated(
    @Query(new ValidationPipe({ transform: true })) pagination: PaginationDto,
  ): Promise<PaginatedTaskResponseDto> {
    const result = await this.tasksService.findAllPaginated(pagination);
    return new PaginatedTaskResponseDto({
      data: result.data.map((task) => new TaskResponseDto(task)),
      meta: result.meta,
    });
  }

  /**
   * Busca tareas con filtros avanzados
   */
  @Get('search')
  @ApiOperation({
    summary: 'Buscar tareas con filtros',
    description:
      'Permite buscar tareas aplicando filtros por estado, fechas y texto',
  })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda realizada exitosamente',
    type: [TaskResponseDto],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: 'Filtrar por estado de la tarea',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha de fin (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Búsqueda por texto en título y descripción',
    example: 'autenticación',
  })
  async searchTasks(
    @Query(new ValidationPipe({ transform: true })) searchDto: TaskSearchDto,
  ): Promise<TaskResponseDto[]> {
    const { status, startDate, endDate, search, ...pagination } = searchDto;
    const filters = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
    };

    const tasks = await this.tasksService.findByFilters(filters, pagination);
    return tasks.map((task) => new TaskResponseDto(task));
  }

  /**
   * Obtiene métricas de las tareas
   */
  @Get('metrics')
  @ApiOperation({
    summary: 'Obtener métricas de tareas',
    description: 'Retorna estadísticas y métricas sobre las tareas del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas obtenidas exitosamente',
    type: TaskMetricsResponseDto,
  })
  async getMetrics(): Promise<TaskMetricsResponseDto> {
    const metrics = await this.tasksService.getMetrics();
    return new TaskMetricsResponseDto(metrics);
  }

  /**
   * Obtiene tareas por estado específico
   */
  @Get('status/:status')
  @ApiOperation({
    summary: 'Obtener tareas por estado',
    description: 'Retorna todas las tareas que tienen un estado específico',
  })
  @ApiParam({
    name: 'status',
    enum: TaskStatus,
    description: 'Estado de las tareas a buscar',
    example: TaskStatus.PENDING,
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas obtenidas exitosamente',
    type: [TaskResponseDto],
  })
  async findByStatus(
    @Param('status') status: TaskStatus,
    @Query(new ValidationPipe({ transform: true })) pagination: PaginationDto,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.tasksService.findByStatus(status, pagination);
    return tasks.map((task) => new TaskResponseDto(task));
  }

  /**
   * Obtiene una tarea por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener tarea por ID',
    description: 'Retorna una tarea específica identificada por su ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la tarea',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea obtenida exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.findById(id);
    return new TaskResponseDto(task);
  }

  /**
   * Crea una nueva tarea
   */
  @Post()
  @ApiOperation({
    summary: 'Crear nueva tarea',
    description: 'Crea una nueva tarea en el sistema',
  })
  @ApiBody({
    type: CreateTaskDto,
    description: 'Datos para crear la nueva tarea',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una tarea con ese título',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.create(createTaskDto);
    return new TaskResponseDto(task);
  }

  /**
   * Actualiza una tarea existente
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar tarea completa',
    description: 'Actualiza todos los campos de una tarea existente',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la tarea a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdateTaskDto,
    description: 'Datos para actualizar la tarea',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una tarea con ese título',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.update(id, updateTaskDto);
    return new TaskResponseDto(task);
  }

  /**
   * Actualiza parcialmente una tarea
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar tarea parcialmente',
    description: 'Actualiza solo los campos especificados de una tarea',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la tarea a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdateTaskDto,
    description: 'Campos a actualizar en la tarea',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada exitosamente',
    type: TaskResponseDto,
  })
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.update(id, updateTaskDto);
    return new TaskResponseDto(task);
  }

  /**
   * Elimina una tarea
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar tarea',
    description:
      'Elimina una tarea del sistema (no se pueden eliminar tareas completadas)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la tarea a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Tarea eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar una tarea completada',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tasksService.delete(id);
  }

  /**
   * Marca una tarea como completada
   */
  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Marcar tarea como completada',
    description: 'Cambia el estado de una tarea a completada',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la tarea a completar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea marcada como completada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La tarea ya está completada o no se puede completar',
  })
  async markAsCompleted(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.markAsCompleted(id);
    return new TaskResponseDto(task);
  }

  /**
   * Marca una tarea como en progreso
   */
  @Patch(':id/start')
  @ApiOperation({
    summary: 'Marcar tarea como en progreso',
    description: 'Cambia el estado de una tarea a en progreso',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la tarea a iniciar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea marcada como en progreso exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La tarea ya está en progreso o no se puede iniciar',
  })
  async markAsInProgress(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.markAsInProgress(id);
    return new TaskResponseDto(task);
  }

  /**
   * Marca una tarea como cancelada
   */
  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Marcar tarea como cancelada',
    description: 'Cambia el estado de una tarea a cancelada',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la tarea a cancelar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea marcada como cancelada exitosamente',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La tarea ya está cancelada o no se puede cancelar',
  })
  async markAsCancelled(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.markAsCancelled(id);
    return new TaskResponseDto(task);
  }
}
