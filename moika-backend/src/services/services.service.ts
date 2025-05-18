import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { CarWashesService } from '../car-washes/car-washes.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    private carWashesService: CarWashesService,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
    carWashId: string,
  ): Promise<Service> {
    // Verify that car wash exists
    await this.carWashesService.findOne(carWashId);

    const service = this.servicesRepository.create({
      ...createServiceDto,
      carWashId,
    });
    return this.servicesRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return this.servicesRepository.find({
      relations: ['carWash'],
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['carWash'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async findByCarWash(carWashId: string): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { carWashId },
      relations: ['carWash'],
    });
  }

  async update(
    id: string,
    updateServiceDto: Partial<CreateServiceDto>,
  ): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, updateServiceDto);
    return this.servicesRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const result = await this.servicesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }

  async filterServices(query: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Service[]> {
    const qb = this.servicesRepository.createQueryBuilder('service');
    if (query.name) {
      qb.andWhere('service.name ILIKE :name', { name: `%${query.name}%` });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('service.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('service.price <= :maxPrice', { maxPrice: query.maxPrice });
    }
    return qb.getMany();
  }
}
