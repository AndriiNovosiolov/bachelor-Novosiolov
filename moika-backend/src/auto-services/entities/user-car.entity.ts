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

@Entity('user_cars')
export class UserCar {
  @ApiProperty({ example: 'uuid', description: 'ID авто' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'uuid', description: 'ID користувача' })
  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({ example: 'Toyota', description: 'Марка' })
  @Column()
  brand!: string;

  @ApiProperty({ example: 'Camry', description: 'Модель' })
  @Column()
  model!: string;

  @ApiProperty({ example: 2020, description: 'Рік випуску' })
  @Column()
  year!: number;

  @ApiProperty({ example: 'petrol', description: 'Тип двигуна' })
  @Column()
  engineType!: string;

  @ApiProperty({ example: 50000, description: 'Пробіг' })
  @Column()
  mileage!: number;

  @ApiProperty({ example: 10000, description: 'Частота обслуговування (км)' })
  @Column()
  serviceFrequency!: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Дата останньої заміни масла',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastOilChangeDate?: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Дата останньої діагностики',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastDiagnosticsDate?: Date;

  @ApiProperty({
    example: 'sedan',
    description: 'Розмір авто',
    enum: ['micro', 'sedan', 'suv', 'minivan', 'pickup', 'other'],
  })
  @Column()
  size!: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
