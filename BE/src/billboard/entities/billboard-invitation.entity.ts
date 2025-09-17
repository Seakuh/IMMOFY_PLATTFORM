import { Entity, ObjectIdColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Billboard } from './billboard.entity';
import { User } from '../../users/entities/user.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

@Entity('billboard_invitations')
@Index(['billboardId', 'inviteeId'], { unique: true }) // One invitation per user per billboard
@Index(['billboardId'])
@Index(['inviteeId'])
@Index(['inviterId'])
@Index(['status'])
@Index(['expiresAt'])
export class BillboardInvitation {
  @ObjectIdColumn()
  id: string;

  @Column()
  billboardId: string;

  @Column()
  inviterId: string; // Billboard creator who sent the invitation

  @Column()
  inviterName: string;

  @Column()
  inviteeId: string; // User who received the invitation

  @Column()
  inviteeName: string;

  @Column({ nullable: true })
  inviteeAvatar?: string;

  @Column({ type: 'enum', enum: InvitationStatus, default: InvitationStatus.PENDING })
  status: InvitationStatus;

  @Column('text', { nullable: true })
  message?: string; // Optional invitation message

  @Column()
  expiresAt: Date; // Invitations expire after 7 days

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Billboard)
  billboard: Billboard;

  @ManyToOne(() => User, { eager: false })
  inviter: User;

  @ManyToOne(() => User, { eager: false })
  invitee: User;
}