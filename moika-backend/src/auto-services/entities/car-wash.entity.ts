import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class CarWash {
  @ApiProperty({
    example: ['sedan', 'suv'],
    description: 'Підтримувані розміри авто',
    isArray: true,
  })
  @Column('text', {
    array: true,
    default: () => "'{sedan,suv,micro,minivan,pickup,other}'",
  })
  supportedSizes!: string[];
}
