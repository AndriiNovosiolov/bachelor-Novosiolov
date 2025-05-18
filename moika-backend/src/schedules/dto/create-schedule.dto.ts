import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { DayOfWeek } from '../enums/day-of-week.enum';

export class CreateScheduleDto {
  @ApiProperty({
    description: 'The ID of the car wash this schedule belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  carWashId!: string;

  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @ApiProperty({
    description: 'Opening time in HH:MM format',
    example: '09:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Open time must be in format HH:MM (24-hour)',
  })
  openTime!: string;

  @ApiProperty({
    description: 'Closing time in HH:MM format',
    example: '18:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Close time must be in format HH:MM (24-hour)',
  })
  closeTime!: string;

  @ApiProperty({
    description: 'Whether the car wash is working on this day',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isWorking!: boolean;
}
