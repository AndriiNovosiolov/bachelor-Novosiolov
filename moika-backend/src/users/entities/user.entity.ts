import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../dto/create-user.dto';
import { CarWash } from '../../car-washes/entities/car-wash.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('users')
export class User {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @Column()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @Column()
  lastName!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @ApiProperty({ example: '+380501234567', description: 'User phone number' })
  @Column()
  phone!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: 'User role',
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @ApiProperty({
    type: () => [CarWash],
    description: 'Car washes owned by the user (if role is owner)',
  })
  @OneToMany(() => CarWash, (carWash) => carWash.owner)
  carWashes?: CarWash[];

  @ApiProperty({ type: () => [Booking], description: 'User bookings' })
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings?: Booking[];

  @ApiProperty({ type: () => [Review], description: 'User reviews' })
  @OneToMany(() => Review, (review) => review.user)
  reviews?: Review[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
