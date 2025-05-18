import { Test, TestingModule } from '@nestjs/testing';
import { CarWashesController } from './car-washes.controller';

describe('CarWashesController', () => {
  let controller: CarWashesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarWashesController],
    }).compile();

    controller = module.get<CarWashesController>(CarWashesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
