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
export class Listing {
  @ObjectIdColumn()
  id: string;

  @Column()
  platform: string; // Platform name (e.g., "Immobilienscout24")

  @Column({ nullable: true })
  link: string; // Link to the listing

  @Column({ nullable: true })
  title: string; // Title of the listing

  @Column({ type: 'text', nullable: true })
  description: string; // Description of the listing

  @Column({ type: 'text' })
  generatedMessage: string; // Generated message or response

  @Column({ type: 'text', nullable: true  })
  location: string; // Generated message or response

  @Column({ nullable: true })
  landlordName: string; // Name of the landlord

  @Column({ nullable: true })
  landlordEmail: string; // Contact email of the landlord

  @Column({ nullable: true })
  textType: string; // Type of generated text (e.g., "Inserat", "Response")

  @Column({ type: 'json', nullable: true })
  additionalData: Record<string, any>; // Flexible field for extra metadata

  @Column({ type: 'json', nullable: true })
  uploadedImages: string[]; // URLs of uploaded images

  @Column({ type: 'json', nullable: true })
  filteredData: Record<string, any>; // AI-filtered structured data

  @Column({ nullable: true })
  price: number; // Extracted price

  @Column({ nullable: true })
  rooms: number; // Number of rooms

  @Column({ nullable: true })
  size: number; // Size in sqm

  @Column({ default: 'pending' })
  status: string; // pending, processed, published

  @Column({ default: true })
  isPublished: boolean; // Whether listing is published

  @ManyToOne(() => User, (user) => user.listings)
  user: User; // Relationship to the user

  @CreateDateColumn()
  createdAt: Date; // Timestamp of creation

  @UpdateDateColumn()
  updatedAt: Date;

  // New fields for anonymization and messaging

  @Column({ default: true })
  isAnonymized: boolean; // Whether the listing should be displayed anonymously

  @Column({ nullable: true })
  anonymizedContactId: string; // Unique ID for contacting the user anonymously (e.g., hash or UUID)

  @Column({ default: 0 })
  views: number; // Number of times the listing has been viewed (optional)

  @Column({ type: 'text', nullable: true })
  messageInstructions: string; // Optional field for specific messaging instructions
}
