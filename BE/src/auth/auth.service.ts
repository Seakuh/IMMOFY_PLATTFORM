import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // Zur Überprüfung verschlüsselter Passwörter
import { UsersService } from 'src/users/users.service'; // Dein Service zum Zugriff auf Benutzer

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService, // Benutzer-Service injizieren
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email); // Benutzer aus DB laden
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result; // Passwort entfernen, nur relevante Daten zurückgeben
    }
    return null; // Benutzer nicht gefunden oder falsches Passwort
  }

  async login(user: any): Promise<{ accessToken: string }> {
    const dbUser = await this.usersService.findById(user.id); // Benutzer erneut laden, falls nötig
    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }
    const payload = {
      email: dbUser.email,
      id: dbUser.id, // "sub" ist Standard in JWTs für die Benutzer-ID
      packageId: dbUser.packageId, // Zusätzliche Daten hinzufügen
    };

    const token = await this.jwtService.sign(payload);

    return {
      accessToken: token, // Signiere den Token
    };
  }

  generateToken(user: any): string {
    const payload = { email: user.email, id: user.id };
    return this.jwtService.sign(payload);
  }
}
