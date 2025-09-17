import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_secret_key', // Nutze .env in der Produktion
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload in validate:', payload); // Debugging: Überprüfen des Payloads

    // Gib die benötigten Felder zurück
    return {
      id: payload.id,
      email: payload.email,
      packageId: payload.packageId,
    };
  }
}
