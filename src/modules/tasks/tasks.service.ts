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
  TaskResponse,
  CreateTaskData,
  UpdateTaskData,
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
   * Obtiene todas las tareas con paginación
   */
  async findAll(options?: PaginationOptions): Promise<TaskResponse[]> {
    this.logger.log('Finding all tasks');

    try {
      const tasks = await this.tasksRepository.findAll(options);
      this.logger.log(`Retrieved ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las tareas con paginación completa
   */
  async findAllPaginated(
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<TaskResponse>> {
    this.logger.log('Finding all tasks with pagination');

    try {
      const { page = 1, limit = 10 } = options || {};

      const [tasks, total] = await Promise.all([
        this.tasksRepository.findAll(options),
        this.tasksRepository.count(),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const result: PaginatedResponse<TaskResponse> = {
        data: tasks,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      };

      this.logger.log(
        `Retrieved ${tasks.length} of ${total} tasks (page ${page})`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error in findAllPaginated:', error);
      throw error;
    }
  }

  /**
   * Busca una tarea por ID
   */
  async findById(id: number): Promise<TaskResponse> {
    this.logger.log(`Finding task by ID: ${id}`);

    if (!id || id <= 0) {
      throw new BadRequestException('Invalid task ID');
    }

    try {
      const task = await this.tasksRepository.findById(id);

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
   * Busca tareas aplicando filtros
   */
  async findByFilters(
    filters: TaskFilters,
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

      const tasks = await this.tasksRepository.findByFilters(filters, options);
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
      await this.validateTaskTitle(data.title);

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
  async update(id: number, data: UpdateTaskData): Promise<TaskResponse> {
    this.logger.log(`Updating task ${id}: ${JSON.stringify(data)}`);

    if (!id || id <= 0) {
      throw new BadRequestException('Invalid task ID');
    }

    try {
      // Verificar que la tarea existe
      await this.findById(id);

      // Validar título si se está actualizando
      if (data.title) {
        await this.validateTaskTitle(data.title, id);
      }

      // Actualizar la tarea
      const updatedTask = await this.tasksRepository.update(id, data);

      this.logger.log(
        `Task updated successfully: ${updatedTask.id} - ${updatedTask.title}`,
      );
      return updatedTask;
    } catch (error) {
      this.logger.error(`Error updating task ${id}:`, {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Elimina una tarea
   */
  async delete(id: number): Promise<void> {
    this.logger.log(`Deleting task: ${id}`);

    if (!id || id <= 0) {
      throw new BadRequestException('Invalid task ID');
    }

    try {
      // Verificar que la tarea existe
      const task = await this.findById(id);

      // Validación de negocio: no permitir eliminar tareas completadas
      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Cannot delete completed tasks');
      }

      await this.tasksRepository.delete(id);
      this.logger.log(`Task deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de las tareas
   */
  async getMetrics(): Promise<TaskMetrics> {
    this.logger.log('Getting task metrics');

    try {
      const metrics = await this.tasksRepository.getMetrics();
      this.logger.log(`Task metrics retrieved: ${JSON.stringify(metrics)}`);
      return metrics;
    } catch (error) {
      this.logger.error('Error getting task metrics:', error);
      throw error;
    }
  }

  /**
   * Marca una tarea como completada
   */
  async markAsCompleted(id: number): Promise<TaskResponse> {
    this.logger.log(`Marking task ${id} as completed`);

    try {
      const task = await this.findById(id);

      // Validaciones de negocio
      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Task is already completed');
      }

      if (task.status === TaskStatus.CANCELLED) {
        throw new BadRequestException('Cannot complete a cancelled task');
      }

      const updatedTask = await this.tasksRepository.update(id, {
        status: TaskStatus.COMPLETED,
      });

      this.logger.log(`Task marked as completed: ${id}`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`Error marking task ${id} as completed:`, error);
      throw error;
    }
  }

  /**
   * Marca una tarea como en progreso
   */
  async markAsInProgress(id: number): Promise<TaskResponse> {
    this.logger.log(`Marking task ${id} as in progress`);

    try {
      const task = await this.findById(id);

      // Validaciones de negocio
      if (task.status === TaskStatus.IN_PROGRESS) {
        throw new BadRequestException('Task is already in progress');
      }

      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Cannot change status of completed task');
      }

      if (task.status === TaskStatus.CANCELLED) {
        throw new BadRequestException('Cannot start a cancelled task');
      }

      const updatedTask = await this.tasksRepository.update(id, {
        status: TaskStatus.IN_PROGRESS,
      });

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
  async markAsCancelled(id: number): Promise<TaskResponse> {
    this.logger.log(`Marking task ${id} as cancelled`);

    try {
      const task = await this.findById(id);

      // Validaciones de negocio
      if (task.status === TaskStatus.CANCELLED) {
        throw new BadRequestException('Task is already cancelled');
      }

      if (task.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a completed task');
      }

      const updatedTask = await this.tasksRepository.update(id, {
        status: TaskStatus.CANCELLED,
      });

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
    options?: PaginationOptions,
  ): Promise<TaskResponse[]> {
    this.logger.log(`Finding tasks by status: ${status}`);

    try {
      const tasks = await this.tasksRepository.findByFilters(
        { status },
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
   * Busca tareas por texto
   */
  async searchTasks(
    searchText: string,
    options?: PaginationOptions,
  ): Promise<TaskResponse[]> {
    this.logger.log(`Searching tasks with text: ${searchText}`);

    if (!searchText || searchText.trim().length === 0) {
      throw new BadRequestException('Search text cannot be empty');
    }

    try {
      const tasks = await this.tasksRepository.findByFilters(
        { search: searchText.trim() },
        options,
      );
      this.logger.log(
        `Found ${tasks.length} tasks matching search: ${searchText}`,
      );
      return tasks;
    } catch (error) {
      this.logger.error(
        `Error searching tasks with text ${searchText}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Valida que el título de la tarea sea único
   */
  private async validateTaskTitle(
    title: string,
    excludeId?: number,
  ): Promise<void> {
    try {
      // Buscar tareas con el mismo título
      const existingTasks = await this.tasksRepository.findByFilters({
        search: title,
      });

      // Filtrar por título exacto y excluir la tarea actual si se está actualizando
      const duplicateTask = existingTasks.find(
        (task) =>
          task.title.toLowerCase() === title.toLowerCase() &&
          task.id !== excludeId,
      );

      if (duplicateTask) {
        throw new ConflictException(
          `Task with title "${title}" already exists`,
        );
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error validating task title:', error);
      throw error;
    }
  }
}
