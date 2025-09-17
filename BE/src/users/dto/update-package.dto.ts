import { IsEmail, IsString } from 'class-validator';

export class UpdatePackageDto {
  @IsEmail()
  email: string;

  @IsString()
  package: string;
}
