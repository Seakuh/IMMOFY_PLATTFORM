import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment content is required' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  content: string;
}