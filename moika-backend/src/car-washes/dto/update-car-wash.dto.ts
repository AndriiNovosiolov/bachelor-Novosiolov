import { PartialType } from '@nestjs/swagger';
import { CreateCarWashDto } from './create-car-wash.dto';

export class UpdateCarWashDto extends PartialType(CreateCarWashDto) {}
