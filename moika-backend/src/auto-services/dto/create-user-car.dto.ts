import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserCarDto {
  @ApiProperty({ example: 'Toyota', description: 'Марка' })
  @IsString()
  brand!: string;

  @ApiProperty({ example: 'Camry', description: 'Модель' })
  @IsString()
  model!: string;

  @ApiProperty({ example: 2020, description: 'Рік випуску' })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  year!: number;

  @ApiProperty({ example: 'petrol', description: 'Тип двигуна' })
  @IsString()
  engineType!: string;

  @ApiProperty({ example: 50000, description: 'Пробіг' })
  @IsInt()
  @Min(0)
  mileage!: number;

  @ApiProperty({ example: 10000, description: 'Частота обслуговування (км)' })
  @IsInt()
  @Min(1000)
  serviceFrequency!: number;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00Z',
    description: 'Дата останньої заміни масла',
  })
  @IsOptional()
  @IsDateString()
  lastOilChangeDate?: string;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00Z',
    description: 'Дата останньої діагностики',
  })
  @IsOptional()
  @IsDateString()
  lastDiagnosticsDate?: string;

  @ApiProperty({
    example: 'sedan',
    description: 'Розмір авто',
    enum: ['micro', 'sedan', 'suv', 'minivan', 'pickup', 'other'],
  })
  @IsString()
  size!: string;
}
