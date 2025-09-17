
import { Entity, ObjectIdColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { MessageThread } from './message-thread.entity';

@Entity()
export class Message {
  @ObjectIdColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  recipient: User;

  @ManyToOne(() => MessageThread, (thread) => thread.messages, { nullable: true })
  thread: MessageThread;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  relatedListingId?: string; // For messages related to listings

  @Column({ nullable: true })
  relatedHousingRequestId?: string; // For messages related to housing requests

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
