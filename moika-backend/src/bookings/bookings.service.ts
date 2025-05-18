import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ServicesService } from '../services/services.service';
import { CarWashesService } from '../car-washes/car-washes.service';
import { UsersService } from '../users/users.service';
import { BookingStatus } from './enums/booking-status.enum';
import axios from 'axios';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private servicesService: ServicesService,
    private carWashesService: CarWashesService,
    private usersService: UsersService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<Booking> {
    // Verify that user exists
    await this.usersService.findOne(userId);

    // Verify that service exists and get its details
    const service = await this.servicesService.findOne(
      createBookingDto.serviceId,
    );

    // Verify that car wash exists
    const carWash = await this.carWashesService.findOne(service.carWashId);

    // Verify car wash is active
    if (!carWash.isActive) {
      throw new BadRequestException(
        'This car wash is currently not accepting bookings',
      );
    }

    // Calculate end time based on service duration
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(
      startTime.getTime() + service.durationMinutes * 60000,
    );

    // Check if the time slot is available
    const conflictingBooking = await this.bookingsRepository.findOne({
      where: {
        carWashId: service.carWashId,
        status: BookingStatus.CONFIRMED,
        startTime: Between(startTime, endTime),
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException('This time slot is already booked');
    }

    // Create the booking
    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      userId,
      carWashId: service.carWashId,
      startTime,
      endTime,
      status: BookingStatus.PENDING,
    });

    return this.bookingsRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: ['user', 'carWash', 'service'],
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['user', 'carWash', 'service'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByUser(userId: string): Promise<Booking[]> {
    // Verify that user exists
    await this.usersService.findOne(userId);

    return this.bookingsRepository.find({
      where: { userId },
      relations: ['user', 'carWash', 'service'],
    });
  }

  async findByCarWash(carWashId: string): Promise<Booking[]> {
    // Verify that car wash exists
    await this.carWashesService.findOne(carWashId);

    return this.bookingsRepository.find({
      where: { carWashId },
      relations: ['user', 'carWash', 'service'],
    });
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = status;
    return this.bookingsRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookingsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }

  async getAvailableSlots(
    carWashId: string,
    serviceId: string,
    date: string,
  ): Promise<string[]> {
    // 1. Отримати автомийку та її години роботи
    const carWash = await this.carWashesService.findOne(carWashId);
    const jsDay = new Date(date).getDay(); // 0 (Sun) - 6 (Sat)
    const dayOfWeekMap = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayOfWeek = dayOfWeekMap[jsDay];
    const workingHours = carWash.workingHours as Record<
      string,
      { open: string; close: string }
    >;
    const working = workingHours[dayOfWeek];
    if (
      !working ||
      typeof working.open !== 'string' ||
      typeof working.close !== 'string'
    )
      return [];

    // 2. Дізнатись тривалість сервісу
    const service = await this.servicesService.findOne(serviceId);
    const duration = service.durationMinutes;

    // 3. Знайти всі бронювання на цю дату
    const bookings = await this.bookingsRepository.find({
      where: {
        carWashId,
        serviceId,
        startTime: Between(
          new Date(date + 'T00:00:00'),
          new Date(date + 'T23:59:59'),
        ),
      },
    });

    // 4. Генерувати всі можливі слоти
    const slots: string[] = [];
    const startDate = new Date(`${date}T${working.open}`);
    const endDate = new Date(`${date}T${working.close}`);
    let currentDate = new Date(startDate);
    while (addMinutes(currentDate, duration) <= endDate) {
      const slotStart = new Date(currentDate);
      const slotEnd = addMinutes(slotStart, duration);
      const conflict = bookings.some(
        (b) => slotStart < b.endTime && slotEnd > b.startTime,
      );
      if (!conflict) slots.push(slotStart.toTimeString().slice(0, 5));
      currentDate = addMinutes(currentDate, 15);
    }
    return slots;
  }

  async getOptimalSlot(
    carWashId: string,
    serviceId: string,
    date: string,
  ): Promise<string | null> {
    const slots = await this.getAvailableSlots(carWashId, serviceId, date);
    return slots.length > 0 ? slots[0] : null;
  }

  /**
   * AI-рекомендація часу для запису з урахуванням історії, доступності та погоди
   */
  async getRecommendation(
    userId: string,
    carWashId: string,
    serviceId: string,
  ) {
    // 1. Останні бронювання користувача
    const bookings = await this.bookingsRepository.find({
      where: { userId, carWashId, serviceId },
      order: { startTime: 'DESC' },
      take: 10,
    });
    // 2. Визначаємо найчастіший день тижня і час
    const stats: Record<string, number> = {};
    for (const b of bookings) {
      const date = new Date(b.startTime);
      const day = date.getDay();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const key = `${day}-${hour}:${minute}`;
      stats[key] = (stats[key] || 0) + 1;
    }
    let bestDay: number | null = null;
    let bestHour: number | null = null;
    if (Object.keys(stats).length > 0) {
      const [bestKey] = Object.entries(stats).sort((a, b) => b[1] - a[1])[0];
      const [dayStr, hourStr] = bestKey.split('-');
      bestDay = Number.isNaN(Number(dayStr)) ? null : Number(dayStr);
      bestHour = Number.isNaN(Number(hourStr?.split(':')[0]))
        ? null
        : Number(hourStr.split(':')[0]);
    }
    // 3. Доступні слоти на тиждень
    const today = new Date();
    const availableSlots: { date: string; time: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const slots = await this.getAvailableSlots(carWashId, serviceId, dateStr);
      for (const time of slots) {
        availableSlots.push({ date: dateStr, time });
      }
    }
    // 4. Для кожного слоту — перевіряємо погоду через OpenWeatherMap
    const carWash = await this.carWashesService.findOne(carWashId);
    const weatherApiKey = process.env.WEATHER_API_KEY;
    let recommended: {
      slot: { date: string; time: string };
      weather: unknown;
    } | null = null;
    for (const slot of availableSlots) {
      const slotDateTime = new Date(`${slot.date}T${slot.time}:00`);
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${carWash.latitude}&lon=${carWash.longitude}&appid=${weatherApiKey}&units=metric&lang=ua`;
      try {
        const response = await axios.get<{ list: any[] }>(url);
        const forecasts = Array.isArray(response.data?.list)
          ? response.data.list
          : [];
        if (!forecasts.length) continue;
        let bestForecast = forecasts[0];
        let minDiff = bestForecast?.dt_txt
          ? Math.abs(
              new Date(bestForecast.dt_txt).getTime() - slotDateTime.getTime(),
            )
          : Number.MAX_SAFE_INTEGER;
        for (const f of forecasts) {
          if (!f?.dt_txt) continue;
          const diff = Math.abs(
            new Date(f.dt_txt).getTime() - slotDateTime.getTime(),
          );
          if (diff < minDiff) {
            minDiff = diff;
            bestForecast = f;
          }
        }
        const weatherMain =
          bestForecast?.weather?.[0]?.main?.toLowerCase?.() ?? '';
        const isGoodWeather = !['rain', 'snow', 'thunderstorm'].includes(
          weatherMain,
        );
        if (
          isGoodWeather &&
          bestDay !== null &&
          bestHour !== null &&
          new Date(slot.date).getDay() === bestDay &&
          parseInt(slot.time.split(':')[0], 10) === bestHour
        ) {
          recommended = { slot, weather: bestForecast };
          break;
        }
        if (isGoodWeather && !recommended) {
          recommended = { slot, weather: bestForecast };
        }
      } catch (e) {
        continue;
      }
    }
    if (!recommended && availableSlots.length > 0) {
      recommended = { slot: availableSlots[0], weather: null };
    }
    return recommended || { message: 'No available slots found' };
  }
}

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60000);
}
