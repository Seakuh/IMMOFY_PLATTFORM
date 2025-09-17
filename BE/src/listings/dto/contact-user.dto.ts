import { IsNotEmpty, IsString } from 'class-validator';

export class ContactUserDto {
  @IsNotEmpty()
  @IsString()
  message: string; // Die Nachricht, die an den anonymisierten Benutzer gesendet werden soll
}
