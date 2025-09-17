import { Entity, ObjectIdColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Billboard } from './billboard.entity';
import { User } from '../../users/entities/user.entity';

@Entity('billboard_comments')
@Index(['billboardId'])
@Index(['userId'])
@Index(['createdAt'])
export class BillboardComment {
  @ObjectIdColumn()
  id: string;

  @Column()
  billboardId: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column({ nullable: true })
  userAvatar?: string;

  @Column('text')
  content: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Billboard)
  billboard: Billboard;

  @ManyToOne(() => User)
  user: User;
}