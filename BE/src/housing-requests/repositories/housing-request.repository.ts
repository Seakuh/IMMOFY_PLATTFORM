import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { HousingRequest } from '../entities/housing-request.entity';

@Injectable()
export class HousingRequestRepository extends Repository<HousingRequest> {
  constructor(private readonly dataSource: DataSource) {
    super(HousingRequest, dataSource.createEntityManager());
  }

  /**
   * Find all published housing requests ordered by creation date
   */
  async findPublished(): Promise<HousingRequest[]> {
    return this.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Find published housing request by ID
   */
  async findPublishedById(id: string): Promise<HousingRequest | null> {
    return this.findOne({
      where: { id, isPublished: true },
      relations: ['user'],
    });
  }

  /**
   * Find housing requests by user ID
   */
  async findByUserId(userId: string): Promise<HousingRequest[]> {
    return this.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Find housing requests by email
   */
  async findByEmail(email: string): Promise<HousingRequest[]> {
    return this.find({
      where: { email },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Create and save housing request
   */
  async createAndSave(housingRequestData: Partial<HousingRequest>): Promise<HousingRequest> {
    const housingRequest = this.create(housingRequestData);
    return this.save(housingRequest);
  }

  /**
   * Update housing request status
   */
  async updateStatus(id: string, status: string): Promise<void> {
    await this.update(id, { status });
  }

  /**
   * Publish housing request
   */
  async publishRequest(id: string): Promise<void> {
    await this.update(id, { isPublished: true, status: 'published' });
  }

  /**
   * Unpublish housing request
   */
  async unpublishRequest(id: string): Promise<void> {
    await this.update(id, { isPublished: false, status: 'unpublished' });
  }

  /**
   * Update housing request with new data
   */
  async updateHousingRequest(id: string, updateData: Partial<HousingRequest>): Promise<HousingRequest> {
    await this.update(id, updateData);
    return this.findOne({ where: { id }, relations: ['user'] });
  }
}