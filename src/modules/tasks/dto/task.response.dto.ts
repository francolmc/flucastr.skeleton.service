/**
 * DTO para respuestas de Task
 */

import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../entities/types';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Identificador único de la tarea',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Implementar autenticación JWT',
  })
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea',
    example:
      'Implementar sistema de autenticación usando JWT tokens con refresh tokens y middleware de validación',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Estado actual de la tarea',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Fecha de creación de la tarea',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la tarea',
    example: '2024-01-15T14:45:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<TaskResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO para respuestas paginadas de Tasks
 */
export class PaginatedTaskResponseDto {
  @ApiProperty({
    description: 'Lista de tareas',
    type: [TaskResponseDto],
  })
  data: TaskResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  constructor(partial: Partial<PaginatedTaskResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO para métricas de Tasks
 */
export class TaskMetricsResponseDto {
  @ApiProperty({
    description: 'Total de tareas',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Tareas pendientes',
    example: 45,
  })
  pending: number;

  @ApiProperty({
    description: 'Tareas en progreso',
    example: 30,
  })
  inProgress: number;

  @ApiProperty({
    description: 'Tareas completadas',
    example: 70,
  })
  completed: number;

  @ApiProperty({
    description: 'Tareas canceladas',
    example: 5,
  })
  cancelled: number;

  @ApiProperty({
    description: 'Tareas creadas hoy',
    example: 8,
  })
  createdToday: number;

  constructor(partial: Partial<TaskMetricsResponseDto>) {
    Object.assign(this, partial);
  }
}
