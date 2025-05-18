import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../enums/service-type.enum';

export class CreateServiceRequestDto {
  @ApiProperty({
    enum: ServiceType,
    example: ServiceType.OIL_CHANGE,
    description: 'Type of service requested',
  })
  @IsEnum(ServiceType)
  type!: ServiceType;

  @ApiProperty({
    example: 'Потрібно замінити масло та фільтр',
    description: 'Service request description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Car wash ID',
  })
  @IsUUID()
  carWashId!: string;
}
