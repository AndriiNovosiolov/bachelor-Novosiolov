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
import { CarWashesService } from './car-washes.service';
import { CreateCarWashDto } from './dto/create-car-wash.dto';
import { CarWash } from './entities/car-wash.entity';
import { UpdateCarWashDto } from './dto/update-car-wash.dto';
import { ReviewsService } from '../reviews/reviews.service';

@ApiTags('car-washes')
@ApiBearerAuth('JWT-auth')
@Controller('car-washes')
export class CarWashesController {
  constructor(
    private readonly carWashesService: CarWashesService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post(':ownerId')
  @ApiOperation({ summary: 'Create a new car wash for an owner' })
  @ApiParam({ name: 'ownerId', description: 'ID of the owner user' })
  @ApiResponse({
    status: 201,
    description: 'The car wash has been successfully created.',
    type: CarWash,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Owner not found.' })
  create(
    @Param('ownerId') ownerId: string,
    @Body() createCarWashDto: CreateCarWashDto,
  ) {
    return this.carWashesService.create(createCarWashDto, ownerId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all car washes' })
  @ApiResponse({
    status: 200,
    description: 'Return all car washes.',
    type: [CarWash],
  })
  findAll() {
    return this.carWashesService.findAll();
  }

  @Get('search/location')
  @ApiOperation({ summary: 'Find car washes by location' })
  @ApiQuery({ name: 'lat', description: 'Latitude', type: Number })
  @ApiQuery({ name: 'lon', description: 'Longitude', type: Number })
  @ApiQuery({
    name: 'radius',
    description: 'Search radius in kilometers',
    type: Number,
    required: false,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns car washes sorted by distance.',
    type: [CarWash],
  })
  findByLocation(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius: number = 5,
  ) {
    return this.carWashesService.findByLocation(
      Number(lat),
      Number(lon),
      Number(radius),
    );
  }

  @Get('search/city/:city')
  @ApiOperation({ summary: 'Find car washes by city' })
  @ApiResponse({
    status: 200,
    description: 'Returns car washes in the specified city.',
    type: [CarWash],
  })
  findByCity(@Param('city') city: string) {
    return this.carWashesService.findByCity(city);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a car wash by id' })
  @ApiParam({ name: 'id', description: 'ID of the car wash' })
  @ApiResponse({
    status: 200,
    description: 'Return the car wash.',
    type: CarWash,
  })
  @ApiResponse({ status: 404, description: 'Car wash not found.' })
  findOne(@Param('id') id: string) {
    return this.carWashesService.findOne(id);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get all car washes owned by a specific user' })
  @ApiParam({ name: 'ownerId', description: 'ID of the owner user' })
  @ApiResponse({
    status: 200,
    description: 'Return all car washes for the owner.',
    type: [CarWash],
  })
  @ApiResponse({ status: 404, description: 'Owner not found.' })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.carWashesService.findByOwner(ownerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a car wash' })
  @ApiParam({ name: 'id', description: 'ID of the car wash' })
  @ApiResponse({
    status: 200,
    description: 'The car wash has been successfully updated.',
    type: CarWash,
  })
  @ApiResponse({ status: 404, description: 'Car wash not found.' })
  update(@Param('id') id: string, @Body() updateCarWashDto: UpdateCarWashDto) {
    return this.carWashesService.update(id, updateCarWashDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a car wash' })
  @ApiParam({ name: 'id', description: 'ID of the car wash' })
  @ApiResponse({
    status: 200,
    description: 'The car wash has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Car wash not found.' })
  remove(@Param('id') id: string) {
    return this.carWashesService.remove(id);
  }

  @Get(':id/average-rating')
  @ApiOperation({ summary: 'Get average rating for a car wash' })
  @ApiParam({ name: 'id', description: 'ID of the car wash' })
  @ApiResponse({ status: 200, description: 'Average rating', type: Number })
  async getAverageRating(@Param('id') id: string) {
    return { averageRating: await this.reviewsService.getAverageRating(id) };
  }
}
