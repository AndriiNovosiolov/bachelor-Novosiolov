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

@Entity('external_auto_service_reviews')
export class ExternalAutoServiceReview {
  @ApiProperty({ example: 'uuid', description: 'ID відгуку' })
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

  @ApiProperty({ example: 5, description: 'Рейтинг' })
  @Column('int')
  rating!: number;

  @ApiProperty({ example: 'Все сподобалось!', description: 'Коментар' })
  @Column({ nullable: true })
  comment?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
