import { IsString } from 'class-validator';

export class GenerateInseratDto {
  @IsString()
  prompt: string; // Prompt zur Generierung eines Inserats
}
