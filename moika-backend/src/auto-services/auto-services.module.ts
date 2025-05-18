import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoServicesController } from './auto-services.controller';
import { AutoServicesService } from './auto-services.service';
import { AutoService } from './entities/auto-service.entity';
import { ServiceRequest } from './entities/service-request.entity';
import { ExternalAutoService } from './entities/external-auto-service.entity';
import { ExternalAutoServiceBooking } from './entities/external-auto-service-booking.entity';
import { ExternalAutoServiceReview } from './entities/external-auto-service-review.entity';
import { UserCar } from './entities/user-car.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AutoService,
      ServiceRequest,
      ExternalAutoService,
      ExternalAutoServiceBooking,
      ExternalAutoServiceReview,
      UserCar,
    ]),
  ],
  controllers: [AutoServicesController],
  providers: [AutoServicesService],
  exports: [AutoServicesService],
})
export class AutoServicesModule {}
