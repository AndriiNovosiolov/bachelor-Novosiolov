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
import { User } from '../../users/entities/user.entity';
import { CarWash } from '../../car-washes/entities/car-wash.entity';
import { Service } from '../../services/entities/service.entity';
import { BookingStatus } from '../enums/booking-status.enum';

@Entity('bookings')
export class Booking {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Booking unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the user who made the booking',
  })
  @Column({ type: 'uuid' })
  userId!: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the car wash',
  })
  @Column({ type: 'uuid' })
  carWashId!: string;

  @ApiProperty({ type: () => CarWash })
  @ManyToOne(() => CarWash, (carWash) => carWash.bookings)
  @JoinColumn({ name: 'carWashId' })
  carWash!: CarWash;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the booked service',
  })
  @Column({ type: 'uuid' })
  serviceId!: string;

  @ApiProperty({ type: () => Service })
  @ManyToOne(() => Service, (service) => service.bookings)
  @JoinColumn({ name: 'serviceId' })
  service!: Service;

  @ApiProperty({
    example: '2024-01-01T10:00:00Z',
    description: 'Start time of the booking',
  })
  @Column('timestamp')
  startTime!: Date;

  @ApiProperty({
    example: '2024-01-01T11:00:00Z',
    description: 'End time of the booking',
  })
  @Column('timestamp')
  endTime!: Date;

  @ApiProperty({
    example: 29.99,
    description: 'Total price of the booking',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.PENDING,
    description: 'Current status of the booking',
  })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  @ApiProperty({
    example: 'Please clean the interior thoroughly',
    description: 'Additional notes for the booking',
  })
  @Column('text', { nullable: true })
  notes?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Creation timestamp',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Last update timestamp',
  })
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: false })
  reminderSent!: boolean;
}
