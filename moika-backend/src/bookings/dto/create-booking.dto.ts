import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsDate,
} from 'class-validator';
import { BookingStatus } from '../enums/booking-status.enum';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the service to book',
  })
  @IsNotEmpty()
  @IsString()
  serviceId!: string;

  @ApiProperty({
    example: '2024-01-01T10:00:00Z',
    description: 'Start time of the booking',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startTime!: Date;

  @ApiProperty({
    example: 29.99,
    description: 'Total price of the booking',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @ApiPropertyOptional({
    example: 'Please clean the interior thoroughly',
    description: 'Additional notes for the booking',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: BookingStatus,
    example: BookingStatus.PENDING,
    description: 'Status of the booking',
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
