import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ObjectIdColumn, ManyToOne, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BillboardCategory {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  ROOM = 'room',
  SHARED_APARTMENT = 'shared_apartment',
  OFFICE = 'office',
  COMMERCIAL = 'commercial',
  PARKING = 'parking',
  OTHER = 'other'
}

export enum BillboardType {
  OFFER = 'offer',        // Angebot (Vermieter)
  SEARCH = 'search'       // Gesuch (Mieter)
}

export enum BillboardStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RENTED = 'rented',
  EXPIRED = 'expired'
}

@Entity('billboards')
@Index(['location'])
@Index(['category'])
@Index(['type'])
@Index(['status'])
@Index(['price'])
@Index(['createdAt'])
export class Billboard {
  @ObjectIdColumn()
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  content?: string; // User-added text with hashtags

  @Column({ type: 'json', default: [] })
  hashtags: string[]; // Extracted hashtags

  @Column({ type: 'enum', enum: BillboardCategory })
  category: BillboardCategory;

  @Column({ type: 'enum', enum: BillboardType })
  type: BillboardType;

  @Column({ type: 'enum', enum: BillboardStatus, default: BillboardStatus.ACTIVE })
  status: BillboardStatus;

  @Column({ nullable: true })
  price?: number;

  @Column({ nullable: true })
  priceType?: string; // 'monthly', 'weekly', 'daily', 'total'

  @Column()
  location: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  zipCode?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  latitude?: number;

  @Column({ nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  size?: number; // in sqm

  @Column({ nullable: true })
  rooms?: number;

  @Column({ nullable: true })
  bedrooms?: number;

  @Column({ nullable: true })
  bathrooms?: number;

  @Column({ nullable: true })
  floor?: number;

  @Column({ default: false })
  furnished: boolean;

  @Column({ default: false })
  petsAllowed: boolean;

  @Column({ default: false })
  smokingAllowed: boolean;

  @Column({ default: false })
  balcony: boolean;

  @Column({ default: false })
  garden: boolean;

  @Column({ default: false })
  parking: boolean;

  @Column({ default: false })
  elevator: boolean;

  @Column({ default: false })
  accessible: boolean;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ type: 'json', nullable: true })
  amenities?: string[];

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  availableFrom?: Date;

  @Column({ nullable: true })
  availableUntil?: Date;

  @Column({ nullable: true })
  contactName?: string;

  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ default: 0 })
  views: number;

  @Column({ type: 'json', default: [] })
  likedBy: string[]; // Array of user IDs

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  applicationCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 10 })
  maxInvitations: number; // Limited invitations per billboard

  @Column({ default: 0 })
  sentInvitations: number; // Current count of sent invitations

  @Column({ nullable: true })
  deadline?: Date; // ISO date when applications close

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ nullable: true })
  externalUrl?: string;

  @Column({ nullable: true })
  deposit?: number;

  @Column({ nullable: true })
  utilities?: number;

  @Column({ nullable: true })
  heatingType?: string;

  @Column({ type: 'json', nullable: true })
  additionalCosts?: Record<string, number>;

  @Column({ nullable: true })
  userName?: string;

  @Column({ nullable: true })
  userAvatar?: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  expiresAt?: Date;
}