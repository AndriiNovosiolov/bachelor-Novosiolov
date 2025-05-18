import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: 5, description: 'Rating (1-5)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    example: 'Great service!',
    description: 'Review comment',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
