import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '../enums/service-type.enum';

export class SearchServicesDto {
  @ApiPropertyOptional({
    enum: ServiceType,
    example: ServiceType.OIL_CHANGE,
    description: 'Type of service to search for',
  })
  @IsEnum(ServiceType)
  @IsOptional()
  type?: ServiceType;

  @ApiPropertyOptional({
    example: 100,
    description: 'Minimum price',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Maximum price',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 4.5,
    description: 'Minimum rating',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minRating?: number;
}
