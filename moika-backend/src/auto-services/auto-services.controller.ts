import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AutoServicesService } from './auto-services.service';
import { CreateAutoServiceDto } from './dto/create-auto-service.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { SearchServicesDto } from './dto/search-services.dto';
import { AutoService } from './entities/auto-service.entity';
import { ServiceRequest } from './entities/service-request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestStatus } from './enums/request-status.enum';
import { CreateExternalAutoServiceBookingDto } from './dto/create-external-auto-service-booking.dto';
import { CreateExternalAutoServiceReviewDto } from './dto/create-external-auto-service-review.dto';
import { CreateUserCarDto } from './dto/create-user-car.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('auto-services')
@Controller('auto-services')
export class AutoServicesController {
  constructor(private readonly autoServicesService: AutoServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new auto service' })
  @ApiResponse({
    status: 201,
    description: 'The service has been successfully created.',
    type: AutoService,
  })
  create(
    @Body() createAutoServiceDto: CreateAutoServiceDto,
  ): Promise<AutoService> {
    return this.autoServicesService.createService(createAutoServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all auto services with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Return all services matching the filters.',
    type: [AutoService],
  })
  findAll(@Query() searchDto?: SearchServicesDto): Promise<AutoService[]> {
    return this.autoServicesService.findAll(searchDto);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare multiple services' })
  @ApiResponse({
    status: 200,
    description: 'Return the services for comparison.',
    type: [AutoService],
  })
  @ApiResponse({ status: 404, description: 'One or more services not found.' })
  compareServices(@Query('ids') ids: string): Promise<AutoService[]> {
    const serviceIds = ids.split(',');
    return this.autoServicesService.compareServices(serviceIds);
  }

  @Post('request/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service request status' })
  @ApiResponse({
    status: 200,
    description: 'The request status has been successfully updated.',
    type: ServiceRequest,
  })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  updateRequestStatus(
    @Param('id') id: string,
    @Body('status') status: RequestStatus,
  ): Promise<ServiceRequest> {
    return this.autoServicesService.updateRequestStatus(id, status);
  }

  @Get('external/search')
  @ApiOperation({ summary: 'Пошук автосервісів через Google Places API' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description: 'Радіус у метрах (default 5000)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Тип сервісу (car_repair, tire_shop, ...)',
  })
  async searchExternalAutoServices(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
    @Query('type') type?: string,
  ) {
    return this.autoServicesService.searchExternalAutoServices(
      lat,
      lng,
      radius,
      type,
    );
  }

  @Post('external/save')
  @ApiOperation({ summary: 'Зберегти взаємодіяний автосервіс з Google у базу' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async saveExternalAutoService(@Body() data: any) {
    return this.autoServicesService.saveExternalAutoServiceIfNotExists(data);
  }

  @Post('external/:id/bookings')
  @ApiOperation({ summary: 'Створити бронювання для external_auto_service' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createExternalAutoServiceBooking(
    @Param('id') externalAutoServiceId: string,
    @Body() dto: CreateExternalAutoServiceBookingDto,
    @Request() req: RequestWithUser,
  ) {
    return this.autoServicesService.createExternalAutoServiceBooking(
      { ...dto, externalAutoServiceId },
      req.user.id,
    );
  }

  @Post('external/:id/reviews')
  @ApiOperation({ summary: 'Створити відгук для external_auto_service' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createExternalAutoServiceReview(
    @Param('id') externalAutoServiceId: string,
    @Body() dto: CreateExternalAutoServiceReviewDto,
    @Request() req: RequestWithUser,
  ) {
    return this.autoServicesService.createExternalAutoServiceReview(
      { ...dto, externalAutoServiceId },
      req.user.id,
    );
  }

  @Get('external/bookings/my')
  @ApiOperation({
    summary:
      'Отримати всі бронювання external_auto_services для поточного користувача',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyExternalBookings(@Request() req: RequestWithUser) {
    return this.autoServicesService.getExternalBookingsByUser(req.user.id);
  }

  @Post('/user-cars')
  @ApiOperation({ summary: 'Додати авто користувача' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createUserCar(
    @Body() dto: CreateUserCarDto,
    @Request() req: RequestWithUser,
  ) {
    return this.autoServicesService.createUserCar(dto, req.user.id);
  }

  @Get('/user-cars')
  @ApiOperation({ summary: 'Отримати всі авто користувача' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAllUserCars(@Request() req: RequestWithUser) {
    return this.autoServicesService.findAllUserCars(req.user.id);
  }

  @Get('/user-cars/:id/recommendation')
  @ApiOperation({
    summary: 'AI-підказка для ТО та рекомендація сервісу під авто',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCarMaintenanceRecommendation(
    @Param('id') carId: string,
    @Request() req: RequestWithUser,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ) {
    return this.autoServicesService.getCarMaintenanceRecommendation(
      req.user.id,
      carId,
      lat,
      lng,
    );
  }

  @Get('/user-cars/:id')
  @ApiOperation({ summary: 'Отримати одне авто користувача' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findOneUserCar(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.autoServicesService.findOneUserCar(id, req.user.id);
  }

  @Patch('/user-cars/:id')
  @ApiOperation({ summary: 'Оновити авто користувача' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateUserCar(
    @Param('id') id: string,
    @Body() dto: Partial<CreateUserCarDto>,
    @Request() req: RequestWithUser,
  ) {
    return this.autoServicesService.updateUserCar(id, req.user.id, dto);
  }

  @Delete('/user-cars/:id')
  @ApiOperation({ summary: 'Видалити авто користувача' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async removeUserCar(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.autoServicesService.removeUserCar(id, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific auto service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the service.',
    type: AutoService,
  })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  findOne(@Param('id') id: string): Promise<AutoService> {
    return this.autoServicesService.findOne(id);
  }
  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service request' })
  @ApiResponse({
    status: 201,
    description: 'The request has been successfully created.',
    type: ServiceRequest,
  })
  createRequest(
    @Body() createServiceRequestDto: CreateServiceRequestDto,
    @Request() req: RequestWithUser,
  ): Promise<ServiceRequest> {
    return this.autoServicesService.createRequest(
      createServiceRequestDto,
      req.user.id,
    );
  }
}
