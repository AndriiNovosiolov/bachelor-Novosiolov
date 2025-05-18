import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsArray,
  IsUrl,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCarWashDto {
  @ApiProperty({
    example: 'Super Clean Car Wash',
    description: 'Name of the car wash',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: '123 Main St, City',
    description: 'Physical address of the car wash',
  })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiProperty({
    example: 50.4501,
    description: 'Latitude coordinate',
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({
    example: 30.5234,
    description: 'Longitude coordinate',
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({
    example: 'Kyiv',
    description: 'City where the car wash is located',
  })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({
    example: {
      monday: { open: '08:00', close: '20:00' },
      tuesday: { open: '08:00', close: '20:00' },
      wednesday: { open: '08:00', close: '20:00' },
      thursday: { open: '08:00', close: '20:00' },
      friday: { open: '08:00', close: '20:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '09:00', close: '18:00' },
    },
    description: 'Working hours for each day of the week',
    type: Object,
  })
  @IsObject()
  @IsNotEmpty()
  workingHours!: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };

  @ApiProperty({
    example: 'Professional car wash services with modern equipment',
    description: 'Description of the car wash',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({
    example: '+380501234567',
    description: 'Contact phone number',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/photo1.jpg'],
    description: 'Array of photo URLs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
