import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '../enums/service-type.enum';

export class CreateAutoServiceDto {
  @ApiProperty({
    example: 'Заміна масла',
    description: 'Name of the service',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 'Повна заміна моторного масла та фільтра',
    description: 'Service description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: ServiceType,
    example: ServiceType.OIL_CHANGE,
    description: 'Type of the service',
  })
  @IsEnum(ServiceType)
  type!: ServiceType;

  @ApiProperty({
    example: 500.0,
    description: 'Service price',
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    example: 60,
    description: 'Service duration in minutes',
  })
  @IsNumber()
  @Min(1)
  durationMinutes!: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Car wash ID',
  })
  @IsUUID()
  carWashId!: string;

  @ApiProperty({
    example: ['sedan', 'suv'],
    description: 'Підтримувані розміри авто',
    isArray: true,
    required: false,
  })
  @IsOptional()
  supportedSizes?: string[];
}
