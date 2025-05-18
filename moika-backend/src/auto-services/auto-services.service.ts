import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, MoreThan } from 'typeorm';
import { AutoService } from './entities/auto-service.entity';
import { ServiceRequest } from './entities/service-request.entity';
import { CreateAutoServiceDto } from './dto/create-auto-service.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { SearchServicesDto } from './dto/search-services.dto';
import { RequestStatus } from './enums/request-status.enum';
import { ExternalAutoService } from './entities/external-auto-service.entity';
import axios from 'axios';
import { ExternalAutoServiceBooking } from './entities/external-auto-service-booking.entity';
import { ExternalAutoServiceReview } from './entities/external-auto-service-review.entity';
import { CreateExternalAutoServiceBookingDto } from './dto/create-external-auto-service-booking.dto';
import { CreateExternalAutoServiceReviewDto } from './dto/create-external-auto-service-review.dto';
import { UserCar } from './entities/user-car.entity';
import { CreateUserCarDto } from './dto/create-user-car.dto';
import { differenceInYears } from 'date-fns';

interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  types: string[];
}

@Injectable()
export class AutoServicesService {
  constructor(
    @InjectRepository(AutoService)
    private autoServiceRepository: Repository<AutoService>,
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(ExternalAutoService)
    private externalAutoServiceRepository: Repository<ExternalAutoService>,
    @InjectRepository(ExternalAutoServiceBooking)
    private externalAutoServiceBookingRepository: Repository<ExternalAutoServiceBooking>,
    @InjectRepository(ExternalAutoServiceReview)
    private externalAutoServiceReviewRepository: Repository<ExternalAutoServiceReview>,
    @InjectRepository(UserCar)
    private userCarRepository: Repository<UserCar>,
  ) {}

  async createService(
    createAutoServiceDto: CreateAutoServiceDto,
  ): Promise<AutoService> {
    const service = this.autoServiceRepository.create(createAutoServiceDto);
    return this.autoServiceRepository.save(service);
  }

  async findAll(searchDto?: SearchServicesDto): Promise<AutoService[]> {
    const query = this.autoServiceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.carWash', 'carWash');

    if (searchDto?.type) {
      query.andWhere('service.type = :type', { type: searchDto.type });
    }

    if (searchDto?.minPrice) {
      query.andWhere('service.price >= :minPrice', {
        minPrice: searchDto.minPrice,
      });
    }

    if (searchDto?.maxPrice) {
      query.andWhere('service.price <= :maxPrice', {
        maxPrice: searchDto.maxPrice,
      });
    }

    if (searchDto?.minRating) {
      query.andWhere('carWash.rating >= :minRating', {
        minRating: searchDto.minRating,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<AutoService> {
    const service = await this.autoServiceRepository.findOne({
      where: { id },
      relations: ['carWash'],
    });

    if (!service) {
      throw new NotFoundException(`Auto service with ID ${id} not found`);
    }

    return service;
  }

  async createRequest(
    createServiceRequestDto: CreateServiceRequestDto,
    userId: string,
  ): Promise<ServiceRequest> {
    const request = this.serviceRequestRepository.create({
      ...createServiceRequestDto,
      userId,
      status: RequestStatus.PENDING,
    });
    return this.serviceRequestRepository.save(request);
  }

  async compareServices(serviceIds: string[]): Promise<AutoService[]> {
    const services = await this.autoServiceRepository.find({
      where: { id: In(serviceIds) },
      relations: ['carWash'],
    });

    if (services.length !== serviceIds.length) {
      throw new NotFoundException('One or more services not found');
    }

    return services;
  }

  async updateRequestStatus(
    id: string,
    status: RequestStatus,
  ): Promise<ServiceRequest> {
    const request = await this.serviceRequestRepository.findOne({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(`Service request with ID ${id} not found`);
    }

    request.status = status;
    return this.serviceRequestRepository.save(request);
  }

  async searchExternalAutoServices(
    lat: number,
    lng: number,
    radius: number = 5000,
    type: string = 'car_repair',
  ) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
    const response = await axios.get<{ results: GooglePlace[] }>(url);
    return response.data.results.map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types.join(','),
    }));
  }

  async saveExternalAutoServiceIfNotExists(
    data: Partial<ExternalAutoService>,
  ): Promise<ExternalAutoService> {
    let service = await this.externalAutoServiceRepository.findOne({
      where: { placeId: data.placeId },
    });
    if (!service) {
      service = this.externalAutoServiceRepository.create(data);
      await this.externalAutoServiceRepository.save(service);
    }
    return service;
  }

  async createExternalAutoServiceBooking(
    dto: CreateExternalAutoServiceBookingDto,
    userId: string,
  ): Promise<ExternalAutoServiceBooking> {
    const overlapping = await this.externalAutoServiceBookingRepository.findOne(
      {
        where: {
          externalAutoServiceId: dto.externalAutoServiceId,
          startTime: LessThan(new Date(dto.endTime)),
          endTime: MoreThan(new Date(dto.startTime)),
        },
      },
    );
    if (overlapping) {
      throw new BadRequestException(
        'Цей час вже заброньовано для цього автосервісу!',
      );
    }
    const booking = this.externalAutoServiceBookingRepository.create({
      ...dto,
      userId,
    });
    return this.externalAutoServiceBookingRepository.save(booking);
  }

  async createExternalAutoServiceReview(
    dto: CreateExternalAutoServiceReviewDto,
    userId: string,
  ): Promise<ExternalAutoServiceReview> {
    const review = this.externalAutoServiceReviewRepository.create({
      ...dto,
      userId,
    });
    return this.externalAutoServiceReviewRepository.save(review);
  }

  async getExternalBookingsByUser(userId: string) {
    return this.externalAutoServiceBookingRepository.find({
      where: { userId },
      relations: ['externalAutoService'],
      order: { startTime: 'DESC' },
    });
  }

  async createUserCar(dto: CreateUserCarDto, userId: string): Promise<UserCar> {
    const car = this.userCarRepository.create({ ...dto, userId });
    return this.userCarRepository.save(car);
  }

  async findAllUserCars(userId: string): Promise<UserCar[]> {
    return this.userCarRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneUserCar(id: string, userId: string): Promise<UserCar | null> {
    return this.userCarRepository.findOne({ where: { id, userId } });
  }

  async updateUserCar(
    id: string,
    userId: string,
    dto: Partial<CreateUserCarDto>,
  ): Promise<UserCar | null> {
    const car = await this.userCarRepository.findOne({ where: { id, userId } });
    if (!car) return null;
    Object.assign(car, dto);
    return this.userCarRepository.save(car);
  }

  async removeUserCar(id: string, userId: string): Promise<boolean> {
    const res = await this.userCarRepository.delete({ id, userId });
    return res.affected === 1;
  }

  async getCarMaintenanceRecommendation(
    userId: string,
    carId: string,
    lat?: number,
    lng?: number,
  ) {
    const car = await this.userCarRepository.findOne({
      where: { id: carId, userId },
    });
    if (!car) throw new NotFoundException('Авто не знайдено');
    const now = new Date();
    const recommendations: string[] = [];
    if (car.lastOilChangeDate && car.mileage && car.serviceFrequency) {
      if (car.mileage > car.serviceFrequency) {
        recommendations.push('Пора міняти масло');
      }
    }

    if (car.lastDiagnosticsDate) {
      const years = differenceInYears(now, car.lastDiagnosticsDate);
      if (years >= 1) {
        recommendations.push('Пора на діагностику');
      }
    }
    let recommendedServices: any[] = [];
    if (lat && lng) {
      recommendedServices = await this.searchExternalAutoServices(
        lat,
        lng,
        5000,
        'car_repair',
      );
    }
    return { recommendations, recommendedServices };
  }
}
