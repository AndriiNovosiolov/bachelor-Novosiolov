import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    carWashId: string,
  ): Promise<Review> {
    const review = this.reviewsRepository.create({
      ...createReviewDto,
      carWashId,
    });
    return this.reviewsRepository.save(review);
  }

  async findByCarWash(carWashId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { carWashId },
      relations: ['user'],
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { userId },
      relations: ['carWash'],
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(
    id: string,
    updateDto: Partial<CreateReviewDto>,
  ): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, updateDto);
    return this.reviewsRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reviewsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Review not found');
  }

  async getAverageRating(carWashId: string): Promise<number> {
    const { avg } = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.carWashId = :carWashId', { carWashId })
      .getRawOne();
    return avg ? parseFloat(avg) : 0;
  }
}
