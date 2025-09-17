import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../../mail/mail.service';
import { User } from '../entities/user.entity';
import { UserRepository } from '../users.repository';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  /**
   * Find or create user by email
   * Creates a basic user profile if none exists
   */
  async findOrCreateUser(email: string, additionalData?: Partial<User>): Promise<User> {
    // First try to find existing user
    const existingUser = await this.userRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      return existingUser;
    }

    // Create new user with default data
    return this.createBasicUser(email, additionalData);
  }

  /**
   * Create a basic user profile
   */
  async createBasicUser(email: string, additionalData?: Partial<User>): Promise<User> {
    const defaultPassword = this.generateDefaultPassword();
    const hashedPassword = await this.hashPassword(defaultPassword);

    const userData = {
      email,
      password: hashedPassword,
      name: additionalData?.name || email.split('@')[0], // Use email prefix as default name
      prompt: additionalData?.prompt || 'Suche nach einer Wohnung',
      packageId: additionalData?.packageId || 'basic',
      ...additionalData,
    };

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email }
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id }
    });
  }

  /**
   * Update user profile data
   */
  async updateUserProfile(userId: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, updateData);
    return this.findById(userId);
  }

  /**
   * Generate a default password
   */
  private generateDefaultPassword(): string {
    return uuidv4().slice(0, 12); // 12-character password
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Check if user exists by email
   */
  async userExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  /**
   * Get or create user for housing request
   * Optimized for housing request creation flow with email notification
   */
  async getOrCreateUserForHousingRequest(
    email: string, 
    prompt?: string
  ): Promise<{ user: User; password?: string; isNewUser: boolean }> {
    // Check if user exists
    const existingUser = await this.findByEmail(email);
    
    if (existingUser) {
      return { user: existingUser, isNewUser: false };
    }

    // Create new user with password
    const password = this.generateDefaultPassword();
    const hashedPassword = await this.hashPassword(password);

    const userData = {
      email,
      password: hashedPassword,
      name: email.split('@')[0], // Use email prefix as default name
      prompt: prompt || 'Suche nach einer Wohnung',
      packageId: 'basic', // Default package for housing requests
    };

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);

    return { 
      user: savedUser, 
      password, // Return plain password for email
      isNewUser: true 
    };
  }

  /**
   * Send housing request notification email
   */
  async sendHousingRequestNotification(
    user: User,
    password: string,
    housingRequestData: {
      id: string;
      generatedDescription: string;
      filteredData: any;
    }
  ): Promise<void> {
    await this.mailService.sendHousingRequestEmail({
      email: user.email,
      password,
      housingRequestId: housingRequestData.id,
      generatedDescription: housingRequestData.generatedDescription,
      filteredData: housingRequestData.filteredData,
    });
  }
}