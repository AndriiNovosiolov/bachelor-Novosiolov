import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('external_auto_services')
export class ExternalAutoService {
  @ApiProperty({
    example: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    description: 'Google Place ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    description: 'Google Place ID',
  })
  @Column({ unique: true })
  placeId!: string;

  @ApiProperty({ example: 'СТО АвтоМайстер', description: 'Назва сервісу' })
  @Column()
  name!: string;

  @ApiProperty({
    example: 'вул. Велика Васильківська, 10, Київ',
    description: 'Адреса',
  })
  @Column()
  address!: string;

  @ApiProperty({ example: 50.4501, description: 'Широта' })
  @Column('decimal', { precision: 10, scale: 7 })
  lat!: number;

  @ApiProperty({ example: 30.5234, description: 'Довгота' })
  @Column('decimal', { precision: 10, scale: 7 })
  lng!: number;

  @ApiProperty({ example: 4.7, description: 'Рейтинг Google' })
  @Column('decimal', { precision: 2, scale: 1, nullable: true })
  rating?: number;

  @ApiProperty({ example: 120, description: 'Кількість відгуків у Google' })
  @Column({ nullable: true })
  userRatingsTotal?: number;

  @ApiProperty({
    example: 'car_repair,point_of_interest,establishment',
    description: 'Типи сервісу (через кому)',
  })
  @Column({ type: 'text', nullable: true })
  types?: string;

  @ApiProperty({ example: '+380501234567', description: 'Телефон' })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
