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
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';

@ApiTags('services')
@ApiBearerAuth('JWT-auth')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('car-wash/:carWashId')
  @ApiOperation({ summary: 'Create a new service for a car wash' })
  @ApiParam({ name: 'carWashId', description: 'ID of the car wash' })
  @ApiResponse({
    status: 201,
    description: 'The service has been successfully created.',
    type: Service,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Car wash not found.' })
  create(
    @Param('carWashId') carWashId: string,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(createServiceDto, carWashId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services or filter by name/price' })
  @ApiResponse({
    status: 200,
    description: 'Return all or filtered services.',
    type: [Service],
  })
  findAll(
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    if (name || minPrice || maxPrice) {
      return this.servicesService.filterServices({
        name,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
    }
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by id' })
  @ApiParam({ name: 'id', description: 'ID of the service' })
  @ApiResponse({
    status: 200,
    description: 'Return the service.',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Get('car-wash/:carWashId')
  @ApiOperation({ summary: 'Get all services for a specific car wash' })
  @ApiParam({ name: 'carWashId', description: 'ID of the car wash' })
  @ApiResponse({
    status: 200,
    description: 'Return all services for the car wash.',
    type: [Service],
  })
  @ApiResponse({ status: 404, description: 'Car wash not found.' })
  findByCarWash(@Param('carWashId') carWashId: string) {
    return this.servicesService.findByCarWash(carWashId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', description: 'ID of the service' })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully updated.',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', description: 'ID of the service' })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
