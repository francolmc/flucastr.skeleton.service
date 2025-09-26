/**
 * Enums y tipos para el módulo de Tasks
 */

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const TASK_STATUS_VALUES = Object.values(TaskStatus);

/**
 * Tipo para filtros de búsqueda de tasks
 */
export interface TaskFilters {
  status?: TaskStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

/**
 * Tipo para métricas de tasks
 */
export interface TaskMetrics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  createdToday: number;
}

/**
 * Tipo para opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tipo para respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
