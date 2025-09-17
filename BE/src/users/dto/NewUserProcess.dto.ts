import { IsEmail, IsString } from 'class-validator';

export class NewUserProcessDto {
  @IsEmail()
  email: string;

  @IsString()
  prompt: string;

  @IsString()
  packageId: string;
}
