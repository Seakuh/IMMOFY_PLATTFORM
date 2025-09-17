import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { NewUserProcessDto } from './dto/NewUserProcess.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Entry point for user creation process.
   */
  async createUserWithPrompt(
    newUserProcessDto: NewUserProcessDto,
  ): Promise<User> {
    const { email, prompt, packageId } = newUserProcessDto;

    try {
      console.log(`[INFO] Initiating user creation for email: ${email}.`);

      // Validate email
      await this.ensureEmailIsUnique(email);

      // Generate and hash password
      const generatedPassword = this.generatePassword();
      const hashedPassword = await this.hashPassword(generatedPassword);

      // Create user
      const newUser = await this.createUserWithPromptInDatabase(
        email,
        hashedPassword,
        prompt,
        packageId,
      );

      // Send welcome email
      await this.sendWelcomeEmail(newUser, generatedPassword);

      console.log(`[SUCCESS] User creation completed for email: ${email}.`);
      return newUser;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Ensures the email is unique.
   */
  private async ensureEmailIsUnique(email: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      console.warn(
        `[WARNING] Registration failed: Email ${email} is already registered.`,
      );
      throw new BadRequestException(
        `The email ${email} is already registered.`,
      );
    }
  }

  /**
   * Generates a secure password.
   */
  private generatePassword(): string {
    return uuidv4().slice(0, 8); // Simple 8-character password
  }

  /**
   * Hashes a given password using bcrypt.
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Creates a new user in the database.
   */
  private async createUserWithPromptInDatabase(
    email: string,
    hashedPassword: string,
    prompt: string,
    packageId: string,
  ): Promise<User> {
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      prompt,
      packageId,
    });
    try {
      await this.userRepository.save(newUser);
      console.log(`[SUCCESS] User saved to database: ${email}.`);
      return newUser;
    } catch (error) {
      console.error(
        `[ERROR] Failed to save user to database: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to save user to database.',
      );
    }
  }

  /**
   * Sends a welcome email to the user.
   */
  private async sendWelcomeEmail(user: User, password: string): Promise<void> {
    const { email, prompt, packageId } = user;
    try {
      console.log(`[INFO] Sending welcome email to: ${email}.`);
      await this.mailService.sendMail(user.id, {
        to: email,
        subject: '🌳 Welcome to Home Finder',
        email,
        password,
        prompt,
        packageId,
      });
      console.log(`[SUCCESS] Welcome email sent to: ${email}.`);
    } catch (error) {
      console.error(
        `[ERROR] Failed to send welcome email to ${email}: ${error.message}`,
      );
      throw new Error('Failed to send welcome email.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const where: FindOptionsWhere<User> = { email }; // Expliziter Typ
    return this.userRepository.findOne({ where });
  }

  async findById(id: string): Promise<User | null> {
    const where: FindOptionsWhere<User> = { id }; // Expliziter Typ
    return this.userRepository.findOne({ where });
  }

  /**
   * Handles errors uniformly.
   */
  private handleError(error: any): void {
    if (error instanceof BadRequestException) {
      console.error(`[ERROR] Bad request: ${error.message}`);
      throw error; // Re-throw to propagate
    }
    console.error(`[ERROR] An unexpected error occurred: ${error.message}`);
    throw new InternalServerErrorException('An unexpected error occurred.');
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        `Benutzer mit der E-Mail ${email} wurde nicht gefunden.`,
      );
    }
    return user;
  }

  async createUser(
    email: string,
    packageType: string,
    password?: string,
  ): Promise<User> {
    // Prüfen, ob die E-Mail bereits existiert
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException(
        `Die E-Mail ${email} ist bereits registriert.`,
      );
    }

    // Benutzer erstellen und speichern
    const newUser = this.userRepository.create({
      name: email.split('@')[0], // Verwende E-Mail-Prefix als Namen
      email,
      password: password
        ? await bcrypt.hash(password, 10)
        : await bcrypt.hash('default_password', 10),
      packageId: packageType,
      prompt: '', // Leerer Prompt
    });
    return this.userRepository.save(newUser);
  }

  async updatePackage(email: string, packageType: string): Promise<User> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `Benutzer mit der E-Mail ${email} wurde nicht gefunden.`,
      );
    }

    // Paket aktualisieren
    user.packageId = packageType;
    return this.userRepository.save(user);
  }

  async findUserById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(
          `Benutzer mit ID ${id} wurde nicht gefunden.`,
        );
      }
      return user;
    } catch (error) {
      // Falls es ein MongoDB ObjectId Problem gibt, versuche mit ObjectId
      const ObjectId = require('mongodb').ObjectId;
      try {
        const objectId = new ObjectId(id);
        const user = await this.userRepository.findOne({
          where: { id: objectId } as any,
        });
        if (!user) {
          throw new NotFoundException(
            `Benutzer mit ID ${id} wurde nicht gefunden.`,
          );
        }
        return user;
      } catch (err) {
        throw new NotFoundException(
          `Benutzer mit ID ${id} wurde nicht gefunden.`,
        );
      }
    }
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findUserById(id);

    // Update only provided fields
    Object.keys(updateProfileDto).forEach((key) => {
      if (updateProfileDto[key] !== undefined) {
        user[key] = updateProfileDto[key];
      }
    });

    return this.userRepository.save(user);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update({ id }, { password: hashedPassword });
  }
}
