import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ObjectIdColumn,
} from 'typeorm';
import { SwipeDirection, SwipeType } from '../dto/swipe.dto';

@Entity()
export class Swipe {
  @ObjectIdColumn()
  id: string;

  @Column()
  itemId: string; // ID of housing request or apartment

  @Column({ type: 'enum', enum: SwipeDirection })
  direction: SwipeDirection;

  @Column({ type: 'enum', enum: SwipeType })
  itemType: SwipeType;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column()
  userId: string; // For easier querying

  @CreateDateColumn()
  createdAt: Date;
}