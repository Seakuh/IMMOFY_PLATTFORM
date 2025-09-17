import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class HousingRequest {
  @ObjectIdColumn()
  id: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column()
  email: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  filteredData: Record<string, any>; // AI-gefilterte Daten

  @Column({ type: 'text', nullable: true })
  generatedDescription: string; // KI-generierte Beschreibung

  @Column({ type: 'json', nullable: true })
  uploadedImages: string[]; // URLs der hochgeladenen Bilder

  @Column({ type: 'json', nullable: true })
  vector: number[]; // Vector embedding for similarity search

  @Column({ nullable: true })
  name: string; // Optional name of the person making the request

  @Column({ default: 'pending' })
  status: string; // pending, processed, published

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => User, (user) => user.housingRequests, { nullable: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
