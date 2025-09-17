import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  // password is string server is running
  @IsString()
  password: string;

  @IsOptional() // Macht das Feld optional
  @IsString()
  package?: string; // Optionales Feld, falls kein Paket angegeben wird
}
