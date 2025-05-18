import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExternalAutoServiceBookingDto {
  @ApiProperty({ example: 'uuid', description: 'ID external_auto_service' })
  @IsUUID()
  externalAutoServiceId!: string;

  @ApiProperty({ example: 'oil_change', description: 'Тип послуги' })
  @IsString()
  @IsNotEmpty()
  serviceType!: string;

  @ApiProperty({
    example: '2024-05-11T10:00:00Z',
    description: 'Початок бронювання',
  })
  @IsDateString()
  startTime!: string;

  @ApiProperty({
    example: '2024-05-11T11:00:00Z',
    description: 'Кінець бронювання',
  })
  @IsDateString()
  endTime!: string;

  @ApiProperty({
    example: 'Деталі замовлення',
    description: 'Нотатки',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
