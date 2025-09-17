import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SwipeDirection, SwipeType } from '../dto/swipe.dto';
import { Swipe } from '../entities/swipe.entity';

@Injectable()
export class SwipeRepository extends Repository<Swipe> {
  constructor(private readonly dataSource: DataSource) {
    super(Swipe, dataSource.createEntityManager());
  }

  /**
   * Find swipe by user and item
   */
  async findByUserAndItem(userId: string, itemId: string): Promise<Swipe | null> {
    return this.findOne({
      where: { userId, itemId },
      relations: ['user'],
    });
  }

  /**
   * Get all swiped item IDs for a user
   */
  async getSwipedItemIds(userId: string, itemType: SwipeType): Promise<string[]> {
    const swipes = await this.find({
      where: { userId, itemType },
      select: ['itemId'],
    });
    return swipes.map(swipe => swipe.itemId);
  }

  /**
   * Check for mutual right swipes (matches)
   */
  async findMutualRightSwipes(
    userId1: string,
    userId2: string,
    itemId1: string,
    itemId2: string
  ): Promise<{ swipe1: Swipe | null; swipe2: Swipe | null }> {
    const swipe1 = await this.findOne({
      where: { 
        userId: userId1, 
        itemId: itemId2, 
        direction: SwipeDirection.RIGHT 
      },
      relations: ['user'],
    });

    const swipe2 = await this.findOne({
      where: { 
        userId: userId2, 
        itemId: itemId1, 
        direction: SwipeDirection.RIGHT 
      },
      relations: ['user'],
    });

    return { swipe1, swipe2 };
  }

  /**
   * Get user's right swipes for specific item type
   */
  async getRightSwipesByUser(userId: string, itemType: SwipeType): Promise<Swipe[]> {
    return this.find({
      where: { 
        userId, 
        itemType, 
        direction: SwipeDirection.RIGHT 
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create and save swipe
   */
  async createAndSave(swipeData: Partial<Swipe>): Promise<Swipe> {
    const swipe = this.create(swipeData);
    return this.save(swipe);
  }
}