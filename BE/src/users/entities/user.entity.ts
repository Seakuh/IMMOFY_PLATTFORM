import { HousingRequest } from 'src/housing-requests/entities/housing-request.entity';
import { Listing } from 'src/listings/entities/listing.entity';
import { Message } from 'src/message/entities/message.entity';
import { UserContext } from 'src/user-context/entities/user-context.entity';
import { Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  prompt: string;

  @Column()
  packageId: string;

  @Column({ nullable: true })
  headline?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ nullable: true })
  budgetMin?: number;

  @Column({ nullable: true })
  budgetMax?: number;

  @Column({ type: 'json', nullable: true })
  locations?: string[];

  @Column({ nullable: true })
  moveInFrom?: string;

  @Column({ nullable: true })
  roomsMin?: number;

  @Column({ nullable: true })
  pets?: boolean;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  bio?: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @OneToMany(() => UserContext, (userContext) => userContext.user)
  userContexts: UserContext[]; // Beziehung zu den Kontextdaten des Benutzers

  @OneToMany(() => Listing, (listing) => listing.user)
  listings: Listing[]; // Beziehung zu den Inseraten des Benutzers

  // Neue Felder für Nachrichten
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[]; // Nachrichten, die der Nutzer gesendet hat

  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Message[]; // Nachrichten, die der Nutzer empfangen hat

  @OneToMany(() => HousingRequest, (housingRequest) => housingRequest.user)
  housingRequests: HousingRequest[]; // Wohnungsgesuche des Benutzers
}
