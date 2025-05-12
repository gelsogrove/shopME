import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { BaseDTO } from './base.dto';

/**
 * ServiceDTO - Complete service data transfer object
 */
export class ServiceDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string = 'EUR';

  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number = 60;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsUUID(4)
  workspaceId: string;
}

/**
 * CreateServiceDTO - DTO for creating a new service
 */
export class CreateServiceDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID(4)
  workspaceId: string;
}

/**
 * UpdateServiceDTO - DTO for updating a service
 */
export class UpdateServiceDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 