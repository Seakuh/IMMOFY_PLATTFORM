import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { BillboardApplication, ApplicationStatus } from '../entities/billboard-application.entity';

@Injectable()
export class BillboardApplicationRepository {
  constructor(
    @InjectRepository(BillboardApplication)
    private readonly repository: Repository<BillboardApplication>,
  ) {}

  async create(applicationData: Partial<BillboardApplication>): Promise<BillboardApplication> {
    const application = this.repository.create(applicationData);
    return await this.repository.save(application);
  }

  async findById(id: string): Promise<BillboardApplication | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByBillboardAndApplicant(billboardId: string, applicantId: string): Promise<BillboardApplication | null> {
    return await this.repository.findOne({
      where: { billboardId, applicantId }
    });
  }

  async findByBillboard(billboardId: string, options?: { status?: ApplicationStatus }): Promise<BillboardApplication[]> {
    const whereCondition: any = { billboardId };
    if (options?.status) {
      whereCondition.status = options.status;
    }

    return await this.repository.find({
      where: whereCondition,
      order: { applicationDate: 'DESC' }
    });
  }

  async findByApplicant(applicantId: string, options?: { status?: ApplicationStatus }): Promise<BillboardApplication[]> {
    const whereCondition: any = { applicantId };
    if (options?.status) {
      whereCondition.status = options.status;
    }

    return await this.repository.find({
      where: whereCondition,
      order: { applicationDate: 'DESC' }
    });
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<BillboardApplication> {
    await this.repository.update(id, { status });
    return await this.findById(id);
  }

  async countByBillboard(billboardId: string): Promise<number> {
    return await this.repository.count({ where: { billboardId } });
  }

  async countUserApplicationsToday(applicantId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.repository.count({
      where: {
        applicantId,
        applicationDate: Between(today, tomorrow)
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}