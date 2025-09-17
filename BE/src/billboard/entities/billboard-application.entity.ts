import { Entity, ObjectIdColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Billboard } from './billboard.entity';
import { User } from '../../users/entities/user.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

@Entity('billboard_applications')
@Index(['billboardId', 'applicantId'], { unique: true }) // One application per user per billboard
@Index(['billboardId'])
@Index(['applicantId'])
@Index(['status'])
@Index(['applicationDate'])
export class BillboardApplication {
  @ObjectIdColumn()
  id: string;

  @Column()
  billboardId: string;

  @Column()
  applicantId: string;

  @Column()
  applicantName: string;

  @Column({ nullable: true })
  applicantAvatar?: string;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @Column('text', { nullable: true })
  message?: string; // Optional application message

  @Column({ default: true })
  isBinding: boolean; // Applications are binding commitments

  @CreateDateColumn()
  applicationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Billboard)
  billboard: Billboard;

  @ManyToOne(() => User)
  applicant: User;
}