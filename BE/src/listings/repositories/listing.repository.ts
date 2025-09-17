import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Listing } from '../entities/listing.entity';

@Injectable()
export class ListingRepository extends Repository<Listing> {
  constructor(private readonly dataSource: DataSource) {
    super(Listing, dataSource.createEntityManager());
  }

  /**
   * Find all listings with user relations
   */
  async findAllWithUser(): Promise<Listing[]> {
    return this.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find listings by user ID
   */
  async findByUserId(userId: string): Promise<Listing[]> {
    return this.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Find listing by ID with user relations
   */
  async findByIdWithUser(id: string): Promise<Listing | null> {
    return this.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Find listings by text type
   */
  async findByTextType(textType: string): Promise<Listing[]> {
    return this.find({
      where: { textType },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Find anonymous listings by anonymized contact ID
   */
  async findByAnonymizedContactId(anonymizedContactId: string): Promise<Listing | null> {
    return this.findOne({
      where: { anonymizedContactId },
      relations: ['user'],
    });
  }

  /**
   * Create and save listing
   */
  async createAndSave(listingData: Partial<Listing>): Promise<Listing> {
    const listing = this.create(listingData);
    return this.save(listing);
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    await this.increment({ id }, 'views', 1);
  }

  /**
   * Update anonymization status
   */
  async updateAnonymization(id: string, isAnonymized: boolean, anonymizedContactId?: string): Promise<void> {
    await this.update(id, { 
      isAnonymized, 
      anonymizedContactId: anonymizedContactId || null 
    });
  }
}