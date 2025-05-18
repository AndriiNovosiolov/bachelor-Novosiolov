import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {
    cron.schedule('* * * * *', () => this.sendReminders());
  }

  async sendReminders() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const bookings = await this.bookingsRepository.find({
      where: {
        reminderSent: false,
        startTime: oneHourLater,
      },
      relations: ['user'],
    });
    for (const booking of bookings) {
      try {
        await this.emailService.sendEmail(
          booking.user.email,
          'Нагадування про бронювання',
          `Ваше бронювання почнеться о ${booking.startTime.toLocaleString()}`,
        );
        if (booking.user.phone) {
          await this.smsService.sendSms(
            booking.user.phone,
            `Нагадування: ваше бронювання почнеться о ${booking.startTime.toLocaleString()}`,
          );
        }
        booking.reminderSent = true;
        await this.bookingsRepository.save(booking);
        this.logger.log(`Нагадування надіслано для booking ${booking.id}`);
      } catch (error: any) {
        this.logger.error(
          `Помилка надсилання нагадування для booking ${booking.id}: ${error?.message || error}`,
        );
      }
    }
  }
}
