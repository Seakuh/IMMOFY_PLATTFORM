
import { Entity, ObjectIdColumn, ManyToOne, OneToMany, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Message } from './message.entity';

@Entity()
export class MessageThread {
  @ObjectIdColumn()
  id: string;

  @ManyToOne(() => User, { nullable: true })
  initiator: User;

  @ManyToOne(() => User, { nullable: true })
  responder: User;

  @OneToMany(() => Message, (message) => message.thread)
  messages: Message[];

  @Column({ nullable: true })
  relatedListingId?: string; // For threads related to listings

  @Column({ nullable: true })
  relatedHousingRequestId?: string; // For threads related to housing requests

  @Column({ nullable: true })
  lastMessageAt?: Date; // To sort conversations by latest activity

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
