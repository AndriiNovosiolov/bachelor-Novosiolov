import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarWashesService } from './car-washes.service';
import { CarWashesController } from './car-washes.controller';
import { CarWash } from './entities/car-wash.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Review } from '../reviews/entities/review.entity';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarWash, Booking, Review]),
    ReviewsModule,
  ],
  controllers: [CarWashesController],
  providers: [CarWashesService],
  exports: [CarWashesService],
})
export class CarWashesModule {}
