/**
 * DTO para crear una nueva Task
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../entities/types';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Implementar autenticación JWT',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  @Transform(({ value }: { value: string }) => value?.trim())
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea (opcional)',
    example:
      'Implementar sistema de autenticación usando JWT tokens con refresh tokens y middleware de validación',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }: { value?: string }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Estado inicial de la tarea',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    default: TaskStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `Status must be one of: ${Object.values(TaskStatus).join(', ')}`,
  })
  status?: TaskStatus = TaskStatus.PENDING;
}
