import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('car_washes')
export class CarWash {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Car wash unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Owner user ID',
  })
  @Column({ type: 'uuid' })
  ownerId!: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @ApiProperty({
    example: 'Clean & Shine',
    description: 'Name of the car wash',
  })
  @Column()
  name!: string;

  @ApiProperty({
    example: '123 Main St, City',
    description: 'Address of the car wash',
  })
  @Column()
  address!: string;

  @ApiProperty({ example: 50.4501 })
  @Column('decimal', { precision: 10, scale: 7 })
  latitude!: number;

  @ApiProperty({ example: 30.5234 })
  @Column('decimal', { precision: 10, scale: 7 })
  longitude!: number;

  @ApiProperty({ example: 'Kyiv' })
  @Column()
  city!: string;

  @Column('jsonb')
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
  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  website?: string;

  @ApiProperty({
    example: ['https://example.com/photo1.jpg'],
    description: 'Array of photo URLs',
    type: [String],
  })
  @Column('text', { array: true, default: [] })
  photos!: string[];

  @ApiProperty({ type: () => [Service] })
  @OneToMany(() => Service, (service) => service.carWash)
  services!: Service[];

  @ApiProperty({ type: () => [Booking] })
  @OneToMany(() => Booking, (booking) => booking.carWash)
  bookings!: Booking[];

  @ApiProperty({
    example: true,
    description: 'Whether the car wash is currently active',
  })
  @Column({ default: true })
  isActive!: boolean;

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

  @ApiProperty({ type: () => [Review], description: 'Car wash reviews' })
  @OneToMany(() => Review, (review) => review.carWash)
  reviews?: Review[];

  @ApiProperty({
    example: ['sedan', 'suv', 'minivan'],
    description: 'Підтримувані розміри авто',
    isArray: true,
  })
  @Column('text', {
    array: true,
    default: () => "'{sedan,suv,micro,minivan,pickup,other}'",
  })
  supportedSizes!: string[];
}
