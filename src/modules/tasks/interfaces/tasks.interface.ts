/**
 * Interfaces para el módulo de Tasks
 */

import {
  TaskStatus,
  TaskFilters,
  TaskMetrics,
  PaginationOptions,
} from '../entities/types';

/**
 * Interface para respuesta de Task
 */
export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para crear una nueva Task
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  userId: string;
}

/**
 * Interface para actualizar una Task existente
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * Interface para el repositorio de Tasks
 */
export interface TaskRepositoryInterface {
  findAll(userId: string, options?: PaginationOptions): Promise<TaskResponse[]>;
  findById(id: number, userId: string): Promise<TaskResponse | null>;
  findByFilters(
    filters: TaskFilters,
    userId: string,
    options?: PaginationOptions,
  ): Promise<TaskResponse[]>;
  create(data: CreateTaskData): Promise<TaskResponse>;
  update(
    id: number,
    data: UpdateTaskData,
    userId: string,
  ): Promise<TaskResponse>;
  delete(id: number, userId: string): Promise<void>;
  count(userId: string, filters?: TaskFilters): Promise<number>;
  getMetrics(userId: string): Promise<TaskMetrics>;
}

/**
 * Interface para el servicio de Tasks
 */
export interface TaskServiceInterface {
  findAll(userId: string, options?: PaginationOptions): Promise<TaskResponse[]>;
  findById(id: number, userId: string): Promise<TaskResponse>;
  findByFilters(
    filters: TaskFilters,
    userId: string,
    options?: PaginationOptions,
  ): Promise<TaskResponse[]>;
  create(data: CreateTaskData): Promise<TaskResponse>;
  update(
    id: number,
    data: UpdateTaskData,
    userId: string,
  ): Promise<TaskResponse>;
  delete(id: number, userId: string): Promise<void>;
  getMetrics(userId: string): Promise<TaskMetrics>;
  markAsCompleted(id: number, userId: string): Promise<TaskResponse>;
  markAsInProgress(id: number, userId: string): Promise<TaskResponse>;
  markAsCancelled(id: number, userId: string): Promise<TaskResponse>;
}

/**
 * Interface para opciones de búsqueda avanzada
 */
export interface TaskSearchOptions extends PaginationOptions {
  filters?: TaskFilters;
  includeDeleted?: boolean;
}

/**
 * Interface para estadísticas de Tasks
 */
export interface TaskStatistics {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksCreatedThisWeek: number;
  tasksCreatedThisMonth: number;
  averageCompletionTime?: number; // en días
  mostActiveDay?: string;
}

/**
 * Interface para eventos de Task
 */
export interface TaskEvent {
  taskId: number;
  eventType: 'created' | 'updated' | 'deleted' | 'status_changed';
  previousData?: Partial<TaskResponse>;
  newData: Partial<TaskResponse>;
  timestamp: Date;
  userId?: string; // Para futuras implementaciones de autenticación
}
