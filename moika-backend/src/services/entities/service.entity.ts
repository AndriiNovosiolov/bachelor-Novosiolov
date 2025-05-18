import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CarWash } from '../../car-washes/entities/car-wash.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('services')
export class Service {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Service unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the car wash this service belongs to',
  })
  @Column({ type: 'uuid' })
  carWashId!: string;

  @ApiProperty({ type: () => CarWash })
  @ManyToOne(() => CarWash, (carWash) => carWash.services)
  @JoinColumn({ name: 'carWashId' })
  carWash!: CarWash;

  @ApiProperty({
    example: 'Basic Car Wash',
    description: 'Name of the service',
  })
  @Column()
  name!: string;

  @ApiProperty({
    example: 'Complete exterior wash with hand drying',
    description: 'Description of the service',
  })
  @Column('text', { nullable: true })
  description!: string;

  @ApiProperty({
    example: 30,
    description: 'Duration of the service in minutes',
  })
  @Column()
  durationMinutes!: number;

  @ApiProperty({
    example: 29.99,
    description: 'Price of the service',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @ApiProperty({ type: () => [Booking] })
  @OneToMany(() => Booking, (booking) => booking.service)
  bookings!: Booking[];

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
}
