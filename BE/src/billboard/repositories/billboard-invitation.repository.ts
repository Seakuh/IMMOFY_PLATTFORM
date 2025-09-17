import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { BillboardInvitation, InvitationStatus } from '../entities/billboard-invitation.entity';

@Injectable()
export class BillboardInvitationRepository {
  constructor(
    @InjectRepository(BillboardInvitation)
    private readonly repository: Repository<BillboardInvitation>,
  ) {}

  async create(invitationData: Partial<BillboardInvitation>): Promise<BillboardInvitation> {
    const invitation = this.repository.create(invitationData);
    return await this.repository.save(invitation);
  }

  async findById(id: string): Promise<BillboardInvitation | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByBillboardAndInvitee(billboardId: string, inviteeId: string): Promise<BillboardInvitation | null> {
    return await this.repository.findOne({
      where: { billboardId, inviteeId }
    });
  }

  async findByBillboard(billboardId: string, options?: { status?: InvitationStatus }): Promise<BillboardInvitation[]> {
    const whereCondition: any = { billboardId };
    if (options?.status) {
      whereCondition.status = options.status;
    }

    return await this.repository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }
    });
  }

  async findByInvitee(inviteeId: string, options?: { status?: InvitationStatus }): Promise<BillboardInvitation[]> {
    const whereCondition: any = { inviteeId };
    if (options?.status) {
      whereCondition.status = options.status;
    }

    return await this.repository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }
    });
  }

  async countByBillboard(billboardId: string): Promise<number> {
    return await this.repository.count({ where: { billboardId } });
  }

  async updateStatus(id: string, status: InvitationStatus): Promise<BillboardInvitation> {
    await this.repository.update(id, { status });
    return await this.findById(id);
  }

  async findExpiredInvitations(): Promise<BillboardInvitation[]> {
    return await this.repository.find({
      where: {
        status: InvitationStatus.PENDING,
        expiresAt: LessThan(new Date())
      }
    });
  }

  async markExpiredInvitations(): Promise<number> {
    const expired = await this.findExpiredInvitations();
    if (expired.length > 0) {
      await this.repository.update(
        expired.map(inv => inv.id),
        { status: InvitationStatus.EXPIRED }
      );
    }
    return expired.length;
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}