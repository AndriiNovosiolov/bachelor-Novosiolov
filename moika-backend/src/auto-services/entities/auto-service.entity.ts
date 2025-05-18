import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CarWash } from '../../car-washes/entities/car-wash.entity';
import { ServiceType } from '../enums/service-type.enum';

@Entity('auto_services')
export class AutoService {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Auto service unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'Заміна масла',
    description: 'Name of the service',
  })
  @Column()
  name!: string;

  @ApiProperty({
    example: 'Повна заміна моторного масла та фільтра',
    description: 'Service description',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    enum: ServiceType,
    example: ServiceType.OIL_CHANGE,
    description: 'Type of the service',
  })
  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type!: ServiceType;

  @ApiProperty({
    example: 500.0,
    description: 'Service price',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @ApiProperty({
    example: 60,
    description: 'Service duration in minutes',
  })
  @Column()
  durationMinutes!: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Car wash ID',
  })
  @Column({ type: 'uuid' })
  carWashId!: string;

  @ApiProperty({ type: () => CarWash })
  @ManyToOne(() => CarWash)
  @JoinColumn({ name: 'carWashId' })
  carWash!: CarWash;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
