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
import { ServiceType } from '../enums/service-type.enum';
import { RequestStatus } from '../enums/request-status.enum';

@Entity('service_requests')
export class ServiceRequest {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Service request unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  @Column({ type: 'uuid' })
  userId!: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

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

  @ApiProperty({
    enum: ServiceType,
    example: ServiceType.OIL_CHANGE,
    description: 'Type of service requested',
  })
  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type!: ServiceType;

  @ApiProperty({
    example: 'Потрібно замінити масло та фільтр',
    description: 'Service request description',
  })
  @Column('text')
  description!: string;

  @ApiProperty({
    enum: RequestStatus,
    example: RequestStatus.PENDING,
    description: 'Current status of the request',
  })
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
