/**
 * Entidad Task - Representa una tarea en el sistema
 * Basada en el modelo Prisma Tasks
 */

import { TaskStatus } from './types';

export class Task {
  /**
   * Identificador único de la tarea
   */
  id: number;

  /**
   * Título de la tarea (único)
   */
  title: string;

  /**
   * Descripción opcional de la tarea
   */
  description?: string;

  /**
   * Estado actual de la tarea
   */
  status: TaskStatus;

  /**
   * Fecha de creación de la tarea
   */
  createdAt: Date;

  /**
   * Fecha de última actualización de la tarea
   */
  updatedAt: Date;

  constructor(partial: Partial<Task>) {
    Object.assign(this, partial);
  }

  /**
   * Verifica si la tarea está completada
   */
  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  /**
   * Verifica si la tarea está pendiente
   */
  isPending(): boolean {
    return this.status === TaskStatus.PENDING;
  }

  /**
   * Verifica si la tarea está en progreso
   */
  isInProgress(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }

  /**
   * Verifica si la tarea está cancelada
   */
  isCancelled(): boolean {
    return this.status === TaskStatus.CANCELLED;
  }

  /**
   * Marca la tarea como completada
   */
  markAsCompleted(): void {
    this.status = TaskStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  /**
   * Marca la tarea como en progreso
   */
  markAsInProgress(): void {
    this.status = TaskStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  /**
   * Marca la tarea como cancelada
   */
  markAsCancelled(): void {
    this.status = TaskStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  /**
   * Convierte la entidad a un objeto plano para respuestas
   */
  toResponse(): Omit<
    Task,
    | 'markAsCompleted'
    | 'markAsInProgress'
    | 'markAsCancelled'
    | 'isCompleted'
    | 'isPending'
    | 'isInProgress'
    | 'isCancelled'
    | 'toResponse'
  > {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
