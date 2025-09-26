/**
 * DTOs para filtros y búsquedas de Tasks
 */

import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../entities/types';

export class TaskFiltersDto {
  @ApiProperty({
    description: 'Filtrar por estado de la tarea',
    enum: TaskStatus,
    required: false,
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Fecha de inicio para filtrar tareas (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin para filtrar tareas (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Búsqueda por texto en título y descripción',
    required: false,
    example: 'autenticación',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  search?: string;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Número de página (comenzando desde 1)',
    minimum: 1,
    default: 1,
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Número de elementos por página',
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Campo por el cual ordenar',
    enum: ['id', 'title', 'status', 'createdAt', 'updatedAt'],
    default: 'createdAt',
    required: false,
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['id', 'title', 'status', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Orden de clasificación',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class TaskSearchDto extends PaginationDto {
  @ApiProperty({
    description: 'Filtrar por estado de la tarea',
    enum: TaskStatus,
    required: false,
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Fecha de inicio para filtrar tareas (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin para filtrar tareas (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Búsqueda por texto en título y descripción',
    required: false,
    example: 'autenticación',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  search?: string;
}
