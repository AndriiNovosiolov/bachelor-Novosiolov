import { Test, TestingModule } from '@nestjs/testing';
import { CarWashesService } from './car-washes.service';

describe('CarWashesService', () => {
  let service: CarWashesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarWashesService],
    }).compile();

    service = module.get<CarWashesService>(CarWashesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
