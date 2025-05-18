import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { NotificationsController } from './notifications.controller';
import { CronService } from './cron.service';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User])],
  providers: [EmailService, SmsService, CronService],
  controllers: [NotificationsController],
  exports: [EmailService, SmsService],
})
export class NotificationsModule {}
