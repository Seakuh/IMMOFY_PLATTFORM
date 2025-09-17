import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_secret_key', // Verwendet einen festen Schlüssel; nutze in Produktion eine Umgebungsvariable
      signOptions: { expiresIn: '30d' }, // Token läuft nach 30 Tagen ab
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService], // Hier wird AuthService exportiert
})
export class AuthModule {}
