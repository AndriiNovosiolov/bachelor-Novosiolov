import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarWash } from './entities/car-wash.entity';
import { CreateCarWashDto } from './dto/create-car-wash.dto';
import { UpdateCarWashDto } from './dto/update-car-wash.dto';
import axios from 'axios';
import { In } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Review } from '../reviews/entities/review.entity';

async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await axios.get(url);
  const location = response.data.results[0]?.geometry.location;
  if (!location) throw new Error('Address not found');
  return { lat: location.lat, lng: location.lng };
}

@Injectable()
export class CarWashesService {
  constructor(
    @InjectRepository(CarWash)
    private carWashesRepository: Repository<CarWash>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(
    createCarWashDto: CreateCarWashDto,
    ownerId: string,
  ): Promise<CarWash> {
    let { latitude, longitude } = createCarWashDto;
    if (latitude === undefined || longitude === undefined) {
      const geo = await geocodeAddress(createCarWashDto.address);
      latitude = geo.lat;
      longitude = geo.lng;
    }
    const carWash = this.carWashesRepository.create({
      ...createCarWashDto,
      latitude,
      longitude,
      ownerId,
    });
    return this.carWashesRepository.save(carWash);
  }

  async findAll(): Promise<CarWash[]> {
    return this.carWashesRepository.find({
      relations: ['owner', 'services'],
    });
  }

  async findOne(id: string): Promise<CarWash> {
    const carWash = await this.carWashesRepository.findOne({
      where: { id },
      relations: ['owner', 'services'],
    });

    if (!carWash) {
      throw new NotFoundException(`Car wash with ID ${id} not found`);
    }

    return carWash;
  }

  async findByOwner(ownerId: string): Promise<CarWash[]> {
    return this.carWashesRepository.find({
      where: { ownerId },
      relations: ['owner', 'services'],
    });
  }

  async findByLocation(lat: number, lon: number, radiusKm: number) {
    const earthRadiusKm = 6371;
    const distanceExpr = `
      ${earthRadiusKm} * 2 * ASIN(SQRT(
        POWER(SIN((RADIANS(carWash.latitude) - RADIANS(:lat)) / 2), 2) +
        COS(RADIANS(:lat)) * COS(RADIANS(carWash.latitude)) *
        POWER(SIN((RADIANS(carWash.longitude) - RADIANS(:lon)) / 2), 2)
      ))
    `;
    const query = this.carWashesRepository
      .createQueryBuilder('carWash')
      .select([
        'carWash.id',
        'carWash.name',
        'carWash.address',
        'carWash.latitude',
        'carWash.longitude',
        'carWash.city',
        'carWash.description',
        'carWash.phone',
        'carWash.ownerId',
        'carWash.createdAt',
        'carWash.updatedAt',
      ])
      .addSelect(distanceExpr, 'distance')
      .groupBy('carWash.id')
      .addGroupBy('carWash.name')
      .addGroupBy('carWash.address')
      .addGroupBy('carWash.latitude')
      .addGroupBy('carWash.longitude')
      .addGroupBy('carWash.city')
      .addGroupBy('carWash.description')
      .addGroupBy('carWash.phone')
      .addGroupBy('carWash.ownerId')
      .addGroupBy('carWash.createdAt')
      .addGroupBy('carWash.updatedAt')
      .having(`${distanceExpr} <= :radius`, { lat, lon, radius: radiusKm })
      .orderBy(distanceExpr, 'ASC')
      .setParameters({ lat, lon, radius: radiusKm });

    return query.getRawMany();
  }

  async findByCity(city: string) {
    return this.carWashesRepository.find({
      where: { city },
      relations: ['owner', 'services'],
    });
  }

  async update(
    id: string,
    updateCarWashDto: UpdateCarWashDto,
  ): Promise<CarWash> {
    const carWash = await this.findOne(id);
    Object.assign(carWash, updateCarWashDto);
    return this.carWashesRepository.save(carWash);
  }

  async remove(id: string): Promise<void> {
    const result = await this.carWashesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Car wash with ID ${id} not found`);
    }
  }

  async getOwnerStatistics(ownerId: string) {
    // Знайти всі автомийки власника
    const carWashes = await this.carWashesRepository.find({
      where: { ownerId },
    });
    const carWashIds = carWashes.map((cw) => cw.id);
    if (carWashIds.length === 0) {
      return {
        bookingsCount: 0,
        totalIncome: 0,
        averageRating: 0,
        reviewsCount: 0,
      };
    }
    // Кількість бронювань
    const bookingsCount = await this.bookingsRepository.count({
      where: { carWashId: In(carWashIds) },
    });
    // Сума доходу
    const { sum } = await this.bookingsRepository
      .createQueryBuilder('booking')
      .select('SUM(booking.totalPrice)', 'sum')
      .where('booking.carWashId IN (:...ids)', { ids: carWashIds })
      .getRawOne();
    // Середній рейтинг
    const { avg } = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.carWashId IN (:...ids)', { ids: carWashIds })
      .getRawOne();
    // Кількість відгуків
    const reviewsCount = await this.reviewsRepository.count({
      where: { carWashId: In(carWashIds) },
    });
    return {
      bookingsCount,
      totalIncome: sum ? parseFloat(sum) : 0,
      averageRating: avg ? parseFloat(avg) : 0,
      reviewsCount,
    };
  }
}
