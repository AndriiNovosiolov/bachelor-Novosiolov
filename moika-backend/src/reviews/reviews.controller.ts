import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('reviews')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('car-wash/:carWashId')
  @ApiOperation({ summary: 'Create a review for a car wash' })
  @ApiParam({ name: 'carWashId', description: 'ID of the car wash' })
  @ApiResponse({ status: 201, type: Review })
  create(
    @Param('carWashId') carWashId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(createReviewDto, carWashId);
  }

  @Get('car-wash/:carWashId')
  @ApiOperation({ summary: 'Get all reviews for a car wash' })
  @ApiParam({ name: 'carWashId', description: 'ID of the car wash' })
  @ApiResponse({ status: 200, type: [Review] })
  findByCarWash(@Param('carWashId') carWashId: string) {
    return this.reviewsService.findByCarWash(carWashId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all reviews by a user' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiResponse({ status: 200, type: [Review] })
  findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiParam({ name: 'id', description: 'ID of the review' })
  @ApiResponse({ status: 200, type: Review })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateReviewDto>) {
    return this.reviewsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'ID of the review' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
