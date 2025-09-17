import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for generating inserat request
 */
export class GenerateInseratRequest {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
export class GenerateTextRequest {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  link: string;
}

/**
 * DTO for generating inserat text body, including user ID
 */
export class GenerateInseratTextBody extends GenerateInseratRequest {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class GenerateTextTextBody extends GenerateTextRequest {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

/**
 * Interface for ChatGPT response
 */
export interface ChatGPTResponse {
  content: string;
}
