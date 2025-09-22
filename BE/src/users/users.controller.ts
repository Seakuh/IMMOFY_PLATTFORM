import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { NewUserProcessDto } from './dto/NewUserProcess.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('new-user-process')
  async handleNewUserProcess(@Body() newUserProcessDto: NewUserProcessDto) {
    try {
      const newUser =
        await this.usersService.createUserWithPrompt(newUserProcessDto);
      return { message: 'User created successfully', user: newUser };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'Ein unerwarteter Fehler ist aufgetreten',
      );
    }
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    const user = await this.usersService.createUser(body.email, body.package, body.password);
    const token = this.authService.generateToken(user);
    return { user, token };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Find user; translate NotFound into 401 for consistent UX
    let user: any;
    try {
      user = await this.usersService.findUserByEmail(body.email);
    } catch {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const { accessToken } = await this.authService.login(user);

    // Normalize response for FE expectations
    const { password, ...safeUser } = user;
    return {
      token: accessToken,
      user: {
        id: safeUser.id,
        email: safeUser.email,
        name: safeUser.name,
        headline: safeUser.headline || null,
        bio: safeUser.bio || null,
        avatarUrl: safeUser.avatarUrl || null,
        budgetMin: safeUser.budgetMin || null,
        budgetMax: safeUser.budgetMax || null,
        locations: safeUser.locations || [],
        moveInFrom: safeUser.moveInFrom || null,
        roomsMin: safeUser.roomsMin || null,
        pets: safeUser.pets || null,
        tags: safeUser.tags || [],
        package: safeUser.packageId || 'basic',
        createdAt: (safeUser.createdAt?.toISOString?.() || new Date().toISOString()),
        updatedAt: (safeUser.updatedAt?.toISOString?.() || new Date().toISOString()),
        isVerified: true,
        lastLoginAt: new Date().toISOString(),
      },
      expiresIn: 60 * 60 * 24 * 30,
    };
  }

  @Patch('update-package')
  async updatePackage(@Body() body: UpdatePackageDto) {
    const user = await this.usersService.updatePackage(
      body.email,
      body.package,
    );
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword; // FE expects direct user object
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    const updatedUser = await this.usersService.updateProfile(userId, updateProfileDto);
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return { success: true, user: userWithoutPassword };
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    const user = await this.usersService.findUserById(userId);
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new HttpException('Current password is incorrect', HttpStatus.BAD_REQUEST);
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return { success: true, message: 'Password changed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('account-info')
  async getAccountInfo(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findUserById(userId);
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      accountInfo: {
        id: user.id,
        email: user.email,
        name: user.name,
        packageId: user.packageId,
        createdAt: user.createdAt,
        headline: user.headline,
        avatarUrl: user.avatarUrl
      }
    };
  }
}
