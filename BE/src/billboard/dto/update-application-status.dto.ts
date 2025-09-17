import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../entities/billboard-application.entity';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus, { message: 'Status must be one of: pending, accepted, rejected' })
  status: ApplicationStatus;
}