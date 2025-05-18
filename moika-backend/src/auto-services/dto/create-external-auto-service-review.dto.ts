import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExternalAutoServiceReviewDto {
  @ApiProperty({ example: 'uuid', description: 'ID external_auto_service' })
  @IsUUID()
  externalAutoServiceId!: string;

  @ApiProperty({ example: 'oil_change', description: 'Тип послуги' })
  @IsString()
  @IsNotEmpty()
  serviceType!: string;

  @ApiProperty({ example: 5, description: 'Рейтинг' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    example: 'Все сподобалось!',
    description: 'Коментар',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
