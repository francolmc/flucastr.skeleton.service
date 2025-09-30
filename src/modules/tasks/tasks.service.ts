/**
 * Servicio para el módulo de Tasks
 * Contiene la lógica de negocio y coordina las operaciones
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import {
  TaskServiceInterface,
  CreateTaskData,
  UpdateTaskData,
  TaskResponse,
} from './interfaces';
import {
  TaskFilters,
  TaskMetrics,
  PaginationOptions,
  TaskStatus,
  PaginatedResponse,
} from './entities/types';

@Injectable()
export class TasksService implements TaskServiceInterface {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly tasksRepository: TasksRepository) {}

  /**
   * Obtiene todas las tareas del usuario con paginación
   */
  async findAll(
    userId: string,
    options?: PaginationOptions,
  ): Promise<TaskResponse[]> {
    this.logger.log('Finding all tasks');

    try {
      const tasks = await this.tasksRepository.findAll(userId, options);
      this.logger.log(`Retrieved ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las tareas del usuario con paginación completa
   */
  async findAllPaginated(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<TaskResponse>> {
    this.logger.log('Finding all tasks with pagination');

    try {
      const [tasks, total] = await Promise.all([
        this.tasksRepository.findAll(userId, options),
        this.tasksRepository.count(userId),
      ]);

      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const totalPages = Math.ceil(total / limit);

      const paginatedResponse: PaginatedResponse<TaskResponse> = {
        data: tasks,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };

      this.logger.log(`Retrieved ${tasks.length} tasks with pagination`);
      return paginatedResponse;
    } catch (error) {
      this.logger.error('Error in findAllPaginated:', error);
      throw error;
    }
  }

  /**
   * Busca una tarea por ID del usuario autenticado
   */
  async findById(id: number, userId: string): Promise<TaskResponse> {
    this.logger.log(`Finding task by ID: ${id}`);

    if (!id || id <= 0) {
      throw new BadRequestException('Invalid task ID');
    }

    try {
      const task = await this.tasksRepository.findById(id, userId);

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      this.logger.log(`Task found: ${task.title}`);
      return task;
    } catch (error) {
      this.logger.error(`Error finding task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca tareas aplicando filtros para un usuario específico
   */
  async findByFilters(
    filters: TaskFilters,
    userId: string,
    options?: PaginationOptions,
  ): Promise<TaskResponse[]> {
    this.logger.log(`Finding tasks with filters: ${JSON.stringify(filters)}`);

    try {
      // Validar filtros de fecha
      if (filters.startDate && filters.endDate) {
        if (filters.startDate > filters.endDate) {
          throw new BadRequestException('Start date cannot be after end date');
        }
      }

      const tasks = await this.tasksRepository.findByFilters(
        filters,
        userId,
        options,
      );
      this.logger.log(`Found ${tasks.length} tasks with filters`);
      return tasks;
    } catch (error) {
      this.logger.error('Error finding tasks with filters:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva tarea
   */
  async create(data: CreateTaskData): Promise<TaskResponse> {
    this.logger.log(`Creating task: ${JSON.stringify(data)}`);

    try {
      // Validaciones de negocio
      await this.validateTaskTitle(data.title, data.userId);

      // Crear la tarea
      const task = await this.tasksRepository.create({
        ...data,
        status: data.status || TaskStatus.PENDING,
      });

      this.logger.log(`Task created successfully: ${task.id} - ${task.title}`);
      return task;
    } catch (error) {
      this.logger.error('Error creating task:', {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Actualiza una tarea existente
   */
  async update(
    id: number,
    data: UpdateTaskData,
    userId: string,
  ): Promise<TaskResponse> {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid task ID');
    }

    try {
      // Verificar que la tarea exists
      await this.findById(id, userId);

      // Validar título si se está actualizando
      if (data.title) {
        await this.validateTaskTitle(data.title, userId, id);
      }

      // Actualizar la tarea
      const updatedTask = await this.tasksRepository.update(id, data, userId);
      this.logger.log(`Task updated successfully: ${updatedTask.id}`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una tarea
   */
  async delete(id: number, userId: string): Promise<void> {
    this.logger.log(`Deleting task: ${id}`);

    if (!id || id <= 0) {
      throw new BadRequestException('Invalid task ID');
    }

    try {
      // Verificar que la tarea exists
      const task = await this.findById(id, userId);

      // Validación de negocio: no permitir eliminar tareas completadas
      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Cannot delete completed tasks');
      }

      await this.tasksRepository.delete(id, userId);
      this.logger.log(`Task deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de las tareas
   */
  async getMetrics(userId: string): Promise<TaskMetrics> {
    this.logger.log('Getting task metrics');

    try {
      const metrics = await this.tasksRepository.getMetrics(userId);
      this.logger.log(`Task metrics retrieved: ${JSON.stringify(metrics)}`);
      return metrics;
    } catch (error) {
      this.logger.error('Error getting metrics:', error);
      throw error;
    }
  }

  /**
   * Marca una tarea como completada
   */
  async markAsCompleted(id: number, userId: string): Promise<TaskResponse> {
    this.logger.log(`Marking task as completed: ${id}`);

    try {
      const task = await this.findById(id, userId);

      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Task is already completed');
      }

      const updatedTask = await this.tasksRepository.update(
        id,
        {
          status: TaskStatus.COMPLETED,
        },
        userId,
      );

      this.logger.log(`Task marked as completed: ${updatedTask.id}`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`Error marking task ${id} as completed:`, error);
      throw error;
    }
  }

  /**
   * Marca una tarea como en progreso
   */
  async markAsInProgress(id: number, userId: string): Promise<TaskResponse> {
    this.logger.log(`Marking task ${id} as in progress`);

    try {
      const task = await this.findById(id, userId);

      // Validaciones de negocio
      if (task.status === TaskStatus.IN_PROGRESS) {
        throw new BadRequestException('Task is already in progress');
      }

      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Cannot start a completed task');
      }

      const updatedTask = await this.tasksRepository.update(
        id,
        {
          status: TaskStatus.IN_PROGRESS,
        },
        userId,
      );

      this.logger.log(`Task marked as in progress: ${id}`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`Error marking task ${id} as in progress:`, error);
      throw error;
    }
  }

  /**
   * Marca una tarea como cancelada
   */
  async markAsCancelled(id: number, userId: string): Promise<TaskResponse> {
    this.logger.log(`Marking task ${id} as cancelled`);

    try {
      const task = await this.findById(id, userId);

      // Validaciones de negocio
      if (task.status === TaskStatus.CANCELLED) {
        throw new BadRequestException('Task is already cancelled');
      }

      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a completed task');
      }

      const updatedTask = await this.tasksRepository.update(
        id,
        {
          status: TaskStatus.CANCELLED,
        },
        userId,
      );

      this.logger.log(`Task marked as cancelled: ${id}`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`Error marking task ${id} as cancelled:`, error);
      throw error;
    }
  }

  /**
   * Busca tareas por estado
   */
  async findByStatus(
    status: TaskStatus,
    userId: string,
    options?: PaginationOptions,
  ): Promise<TaskResponse[]> {
    this.logger.log(`Finding tasks by status: ${status}`);

    try {
      const tasks = await this.tasksRepository.findByFilters(
        { status },
        userId,
        options,
      );
      this.logger.log(`Found ${tasks.length} tasks with status ${status}`);
      return tasks;
    } catch (error) {
      this.logger.error(`Error finding tasks by status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Valida si el título de la tarea ya exists
   */
  private async validateTaskTitle(
    title: string,
    userId: string,
    excludeId?: number,
  ): Promise<void> {
    if (!title || title.trim().length === 0) {
      throw new BadRequestException('Task title cannot be empty');
    }

    try {
      const existingTasks = await this.tasksRepository.findByFilters(
        {
          search: title,
        },
        userId,
      );

      const duplicateTask = existingTasks.find((task) => {
        return (
          task.title.toLowerCase() === title.toLowerCase() &&
          task.id !== excludeId
        );
      });

      if (duplicateTask) {
        throw new ConflictException(
          `A task with the title "${title}" already exists`,
        );
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error validating task title:', error);
      throw new BadRequestException('Error validating task title');
    }
  }
}
