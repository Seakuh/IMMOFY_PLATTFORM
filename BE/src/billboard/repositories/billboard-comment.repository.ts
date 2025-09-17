import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillboardComment } from '../entities/billboard-comment.entity';

@Injectable()
export class BillboardCommentRepository {
  constructor(
    @InjectRepository(BillboardComment)
    private readonly repository: Repository<BillboardComment>,
  ) {}

  async create(commentData: Partial<BillboardComment>): Promise<BillboardComment> {
    const comment = this.repository.create(commentData);
    return await this.repository.save(comment);
  }

  async findById(id: string): Promise<BillboardComment | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByBillboard(billboardId: string, options?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean
  }): Promise<{ comments: BillboardComment[]; total: number }> {
    const { page = 1, limit = 20, includeInactive = false } = options || {};

    const whereCondition: any = { billboardId };
    if (!includeInactive) {
      whereCondition.isActive = true;
    }

    const [comments, total] = await this.repository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { comments, total };
  }

  async countByBillboard(billboardId: string): Promise<number> {
    return await this.repository.count({
      where: { billboardId, isActive: true }
    });
  }

  async update(id: string, updates: Partial<BillboardComment>): Promise<BillboardComment> {
    await this.repository.update(id, updates);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }

  async hardDelete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}