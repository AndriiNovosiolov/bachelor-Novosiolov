import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking } from './entities/booking.entity';

@ApiTags('bookings')
@ApiBearerAuth('JWT-auth')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('user/:userId')
  @ApiOperation({ summary: 'Create a new booking for a user' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user making the booking',
  })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created.',
    type: Booking,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'User or service not found.' })
  create(
    @Param('userId') userId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Get('available-slots')
  @ApiOperation({
    summary: 'Get available booking slots for a car wash and service on a date',
  })
  @ApiQuery({
    name: 'carWashId',
    required: true,
    description: 'ID of the car wash',
  })
  @ApiQuery({
    name: 'serviceId',
    required: true,
    description: 'ID of the service',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of available time slots',
    type: [String],
  })
  getAvailableSlots(
    @Query('carWashId') carWashId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailableSlots(carWashId, serviceId, date);
  }

  @Get('optimal-slot')
  @ApiOperation({
    summary:
      'Get optimal (nearest) available booking slot for a car wash and service on a date',
  })
  @ApiQuery({
    name: 'carWashId',
    required: true,
    description: 'ID of the car wash',
  })
  @ApiQuery({
    name: 'serviceId',
    required: true,
    description: 'ID of the service',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Optimal available time slot',
    type: String,
  })
  async getOptimalSlot(
    @Query('carWashId') carWashId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    const slot = await this.bookingsService.getOptimalSlot(
      carWashId,
      serviceId,
      date,
    );
    if (slot) {
      return { slot };
    } else {
      return { slot: null, message: 'No available slots for this date' };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings.',
    type: [Booking],
  })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by id' })
  @ApiParam({ name: 'id', description: 'ID of the booking' })
  @ApiResponse({
    status: 200,
    description: 'Return the booking.',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all bookings for a specific user' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings for the user.',
    type: [Booking],
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findByUser(@Param('userId') userId: string) {
    return this.bookingsService.findByUser(userId);
  }

  @Get('car-wash/:carWashId')
  @ApiOperation({ summary: 'Get all bookings for a specific car wash' })
  @ApiParam({ name: 'carWashId', description: 'ID of the car wash' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings for the car wash.',
    type: [Booking],
  })
  @ApiResponse({ status: 404, description: 'Car wash not found.' })
  findByCarWash(@Param('carWashId') carWashId: string) {
    return this.bookingsService.findByCarWash(carWashId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  @ApiParam({ name: 'id', description: 'ID of the booking' })
  @ApiResponse({
    status: 200,
    description: 'The booking status has been successfully updated.',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, updateBookingStatusDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiParam({ name: 'id', description: 'ID of the booking' })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

  @Get('recommendation')
  @ApiOperation({
    summary:
      'Get AI-recommended booking slot for a user (history, availability, weather)',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiQuery({
    name: 'carWashId',
    required: true,
    description: 'ID of the car wash',
  })
  @ApiQuery({
    name: 'serviceId',
    required: true,
    description: 'ID of the service',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommended slot and weather info',
    type: Object,
  })
  async getRecommendation(
    @Query('userId') userId: string,
    @Query('carWashId') carWashId: string,
    @Query('serviceId') serviceId: string,
  ) {
    return this.bookingsService.getRecommendation(userId, carWashId, serviceId);
  }
}
