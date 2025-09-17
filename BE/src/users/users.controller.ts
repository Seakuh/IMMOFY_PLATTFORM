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
    const user = await this.usersService.findUserByEmail(body.email);

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password); // Vergleich des Klartext-Passworts mit dem gehashten Passwort

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.authService.login(user);
    return { user, token };
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
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
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
