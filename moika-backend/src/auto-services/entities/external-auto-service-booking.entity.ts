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
import { ExternalAutoService } from './external-auto-service.entity';

@Entity('external_auto_service_bookings')
export class ExternalAutoServiceBooking {
  @ApiProperty({ example: 'uuid', description: 'ID бронювання' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'uuid', description: 'ID external_auto_service' })
  @Column()
  externalAutoServiceId!: string;

  @ManyToOne(() => ExternalAutoService)
  @JoinColumn({ name: 'externalAutoServiceId' })
  externalAutoService!: ExternalAutoService;

  @ApiProperty({ example: 'uuid', description: 'ID користувача' })
  @Column()
  userId!: string;

  @ApiProperty({ example: 'oil_change', description: 'Тип послуги' })
  @Column()
  serviceType!: string;

  @ApiProperty({
    example: '2024-05-11T10:00:00Z',
    description: 'Початок бронювання',
  })
  @Column('timestamp')
  startTime!: Date;

  @ApiProperty({
    example: '2024-05-11T11:00:00Z',
    description: 'Кінець бронювання',
  })
  @Column('timestamp')
  endTime!: Date;

  @ApiProperty({ example: 'Деталі замовлення', description: 'Нотатки' })
  @Column({ nullable: true })
  notes?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
