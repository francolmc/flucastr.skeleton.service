/**
 * DTO para actualizar una Task existente
 */

import { IsString, IsOptional, IsEnum, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../entities/types';

export class UpdateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Implementar autenticación JWT - Actualizado',
    minLength: 1,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  @Transform(({ value }: { value?: string }) => value?.trim())
  title?: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea',
    example:
      'Implementar sistema de autenticación usando JWT tokens con refresh tokens, middleware de validación y manejo de roles',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }: { value?: string }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Estado de la tarea',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `Status must be one of: ${Object.values(TaskStatus).join(', ')}`,
  })
  status?: TaskStatus;
}
