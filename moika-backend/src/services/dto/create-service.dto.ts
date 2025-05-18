import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Basic Car Wash',
    description: 'Name of the service',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Complete exterior wash with hand drying',
    description: 'Description of the service',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({
    example: 30,
    description: 'Duration of the service in minutes',
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  durationMinutes!: number;

  @ApiProperty({
    example: 29.99,
    description: 'Price of the service',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsObject()
  additionalInfo?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
