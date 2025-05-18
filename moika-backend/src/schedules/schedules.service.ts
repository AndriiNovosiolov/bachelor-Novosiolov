import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CarWashesService } from '../car-washes/car-washes.service';
import { DayOfWeek } from './enums/day-of-week.enum';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    private carWashesService: CarWashesService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    // Verify car wash exists
    await this.carWashesService.findOne(createScheduleDto.carWashId);

    // Check if schedule for this day already exists
    const existingSchedule = await this.schedulesRepository.findOne({
      where: {
        carWashId: createScheduleDto.carWashId,
        dayOfWeek: createScheduleDto.dayOfWeek,
      },
    });

    if (existingSchedule) {
      throw new BadRequestException(
        `Schedule for ${createScheduleDto.dayOfWeek} already exists for this car wash`,
      );
    }

    // Validate time format and order
    const openTime = new Date(`1970-01-01T${createScheduleDto.openTime}`);
    const closeTime = new Date(`1970-01-01T${createScheduleDto.closeTime}`);

    if (closeTime <= openTime) {
      throw new BadRequestException('Close time must be after open time');
    }

    const schedule = this.schedulesRepository.create(createScheduleDto);
    return this.schedulesRepository.save(schedule);
  }

  async findAll(): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      relations: ['carWash'],
    });
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id },
      relations: ['carWash'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async findByCarWash(carWashId: string): Promise<Schedule[]> {
    // Verify car wash exists
    await this.carWashesService.findOne(carWashId);

    return this.schedulesRepository.find({
      where: { carWashId },
      relations: ['carWash'],
    });
  }

  async findByCarWashAndDate(
    carWashId: string,
    date: string,
  ): Promise<Schedule | null> {
    const jsDay = new Date(date).getDay(); // 0 (Sun) - 6 (Sat)
    const dayOfWeekMap = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    const dayOfWeek = dayOfWeekMap[jsDay];
    return this.schedulesRepository.findOne({
      where: { carWashId, dayOfWeek },
    });
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.findOne(id);

    if (updateScheduleDto.openTime || updateScheduleDto.closeTime) {
      const openTime = new Date(
        `1970-01-01T${updateScheduleDto.openTime || schedule.openTime}`,
      );
      const closeTime = new Date(
        `1970-01-01T${updateScheduleDto.closeTime || schedule.closeTime}`,
      );

      if (closeTime <= openTime) {
        throw new BadRequestException('Close time must be after open time');
      }
    }

    Object.assign(schedule, updateScheduleDto);
    return this.schedulesRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    const result = await this.schedulesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
  }
}
