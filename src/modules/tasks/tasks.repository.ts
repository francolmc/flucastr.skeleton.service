/**
 * Repository para el módulo de Tasks
 * Maneja el acceso a datos usando Prisma
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  TaskRepositoryInterface,
  TaskResponse,
  CreateTaskData,
  UpdateTaskData,
} from './interfaces';
import {
  TaskFilters,
  TaskMetrics,
  PaginationOptions,
  TaskStatus,
} from './entities/types';

@Injectable()
export class TasksRepository implements TaskRepositoryInterface {
  private readonly logger = new Logger(TasksRepository.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Obtiene todas las tareas con paginación opcional
   */
  async findAll(options?: PaginationOptions): Promise<TaskResponse[]> {
    this.logger.log('Finding all tasks');

    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options || {};

      // Asegurar que page y limit sean números
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const tasks = await this.databaseService.tasks.findMany({
        skip,
        take: limitNum,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      this.logger.log(`Found ${tasks.length} tasks`);
      return tasks.map((task) => this.mapToTaskResponse(task));
    } catch (error) {
      this.logger.error('Error finding all tasks:', error);
      throw error;
    }
  }

  /**
   * Busca una tarea por ID
   */
  async findById(id: number): Promise<TaskResponse | null> {
    this.logger.log(`Finding task by ID: ${id}`);

    try {
      const task = await this.databaseService.tasks.findUnique({
        where: { id },
      });

      if (!task) {
        this.logger.warn(`Task with ID ${id} not found`);
        return null;
      }

      this.logger.log(`Task found: ${task.title}`);
      return this.mapToTaskResponse(task);
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
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options || {};

      // Asegurar que page y limit sean números
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const whereClause = this.buildWhereClause(filters);

      const tasks = await this.databaseService.tasks.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      this.logger.log(`Found ${tasks.length} tasks with filters`);
      return tasks.map((task) => this.mapToTaskResponse(task));
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
      const task = await this.databaseService.tasks.create({
        data: {
          title: data.title,
          description: data.description,
          status: data.status || TaskStatus.PENDING,
        },
      });

      this.logger.log(`Task created successfully: ${task.id} - ${task.title}`);
      return this.mapToTaskResponse(task);
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

    try {
      // Verificar que la tarea existe
      const existingTask = await this.findById(id);
      if (!existingTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      const updatedTask = await this.databaseService.tasks.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.status && { status: data.status }),
        },
      });

      this.logger.log(
        `Task updated successfully: ${updatedTask.id} - ${updatedTask.title}`,
      );
      return this.mapToTaskResponse(updatedTask);
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

    try {
      // Verificar que la tarea existe
      const existingTask = await this.findById(id);
      if (!existingTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      await this.databaseService.tasks.delete({
        where: { id },
      });

      this.logger.log(`Task deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cuenta el número total de tareas con filtros opcionales
   */
  async count(filters?: TaskFilters): Promise<number> {
    this.logger.log('Counting tasks');

    try {
      const whereClause = filters ? this.buildWhereClause(filters) : {};

      const count = await this.databaseService.tasks.count({
        where: whereClause,
      });

      this.logger.log(`Total tasks count: ${count}`);
      return count;
    } catch (error) {
      this.logger.error('Error counting tasks:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de las tareas
   */
  async getMetrics(): Promise<TaskMetrics> {
    this.logger.log('Getting task metrics');

    try {
      const [total, pending, inProgress, completed, cancelled, createdToday] =
        await Promise.all([
          this.databaseService.tasks.count(),
          this.databaseService.tasks.count({
            where: { status: TaskStatus.PENDING },
          }),
          this.databaseService.tasks.count({
            where: { status: TaskStatus.IN_PROGRESS },
          }),
          this.databaseService.tasks.count({
            where: { status: TaskStatus.COMPLETED },
          }),
          this.databaseService.tasks.count({
            where: { status: TaskStatus.CANCELLED },
          }),
          this.databaseService.tasks.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          }),
        ]);

      const metrics: TaskMetrics = {
        total,
        pending,
        inProgress,
        completed,
        cancelled,
        createdToday,
      };

      this.logger.log(`Task metrics: ${JSON.stringify(metrics)}`);
      return metrics;
    } catch (error) {
      this.logger.error('Error getting task metrics:', error);
      throw error;
    }
  }

  /**
   * Construye la cláusula WHERE para filtros
   */
  private buildWhereClause(filters: TaskFilters) {
    const where: {
      status?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      OR?: Array<{
        title?: {
          contains: string;
          mode: 'insensitive';
        };
        description?: {
          contains: string;
          mode: 'insensitive';
        };
      }>;
    } = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  /**
   * Mapea el resultado de Prisma a TaskResponse
   */
  private mapToTaskResponse(task: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status as TaskStatus,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
