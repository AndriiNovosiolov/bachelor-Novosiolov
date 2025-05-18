import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CarWash } from '../../car-washes/entities/car-wash.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('reviews')
export class Review {
  @ApiProperty({ example: 'uuid', description: 'Review ID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({ example: 'uuid', description: 'CarWash ID' })
  @Column({ type: 'uuid' })
  carWashId!: string;

  @ManyToOne(() => CarWash, (carWash) => carWash.reviews)
  @JoinColumn({ name: 'carWashId' })
  carWash!: CarWash;

  @ApiProperty({ example: 5, description: 'Rating (1-5)' })
  @Column({ type: 'int' })
  rating!: number;

  @ApiProperty({ example: 'Great service!', description: 'Review comment' })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  @CreateDateColumn()
  createdAt!: Date;
}
