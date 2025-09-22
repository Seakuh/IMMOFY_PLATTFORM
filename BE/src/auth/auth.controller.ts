import { Body, Controller, Post, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // Support username as email
    const email = body.username;
    const user = await this.authService.validateUser(email, body.password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Fetch full user record
    const fullUser = await this.usersService.findByEmail(email);
    const { accessToken } = await this.authService.login(fullUser);
    const { password, ...safeUser } = fullUser as any;

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

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
