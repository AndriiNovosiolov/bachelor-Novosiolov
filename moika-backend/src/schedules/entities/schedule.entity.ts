import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { CarWash } from '../../car-washes/entities/car-wash.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('schedules')
export class Schedule {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the schedule',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the associated car wash',
  })
  @Column({ type: 'uuid' })
  carWashId!: string;

  @ApiProperty({
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
    description: 'Day of the week for this schedule',
  })
  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek!: DayOfWeek;

  @ApiProperty({
    example: '09:00',
    description: 'Opening time in HH:MM format',
  })
  @Column({ type: 'time' })
  openTime!: string;

  @ApiProperty({
    example: '18:00',
    description: 'Closing time in HH:MM format',
  })
  @Column({ type: 'time' })
  closeTime!: string;

  @ApiProperty({
    example: true,
    description: 'Whether the car wash is working on this day',
  })
  @Column({ type: 'boolean', default: true })
  isWorking!: boolean;

  @ApiProperty({
    type: () => CarWash,
    description: 'Associated car wash entity',
  })
  @ManyToOne(() => CarWash)
  @JoinColumn({ name: 'carWashId' })
  carWash!: CarWash;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Timestamp of when the schedule was created',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Timestamp of when the schedule was last updated',
  })
  @UpdateDateColumn()
  updatedAt!: Date;
}
