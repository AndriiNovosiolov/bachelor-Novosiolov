import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Schedule } from './entities/schedule.entity';

@ApiTags('schedules')
@ApiBearerAuth('JWT-auth')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({
    status: 201,
    description: 'The schedule has been successfully created.',
    type: Schedule,
  })
  create(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiResponse({
    status: 200,
    description: 'Return all schedules',
    type: [Schedule],
  })
  findAll(): Promise<Schedule[]> {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a schedule by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the schedule.',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found.' })
  findOne(@Param('id') id: string): Promise<Schedule> {
    return this.schedulesService.findOne(id);
  }

  @Get('car-wash/:carWashId')
  @ApiOperation({ summary: 'Get schedules by car wash id' })
  @ApiResponse({
    status: 200,
    description: 'Return schedules for the specified car wash.',
    type: [Schedule],
  })
  findByCarWash(@Param('carWashId') carWashId: string): Promise<Schedule[]> {
    return this.schedulesService.findByCarWash(carWashId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiResponse({
    status: 200,
    description: 'The schedule has been successfully updated.',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found.' })
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a schedule' })
  @ApiResponse({
    status: 200,
    description: 'The schedule has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.schedulesService.remove(id);
  }
}
