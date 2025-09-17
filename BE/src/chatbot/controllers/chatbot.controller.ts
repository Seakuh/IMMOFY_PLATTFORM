// src/chatbot/controllers/chatbot.controller.ts
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  GenerateInseratRequest,
  GenerateTextRequest,
} from '../dto/generate-inserat.dto';
import { ChatbotService } from '../services/chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('send')
  async sendMessage(
    @Body() body: { prompt: string; userId: string; packageId: string },
  ) {
    const response = await this.chatbotService.handleChat(
      body.prompt,
      body.userId,
      body.packageId,
    );
    return { response };
  }

  @Post('generate-inserat')
  @UseGuards(AuthGuard('jwt'))
  async generateInserat(
    @Request() req,
    @Body() body: GenerateInseratRequest,
  ): Promise<{ success: boolean; response: string }> {
    try {
      const email = req.user.email; // E-Mail aus `req.user`
      const packageId = req.user.packageId; // Package-ID aus `req.user
      const userId = req.user.id; // User-ID aus `req.user`
      console.log('User:', req.user);

      const response = await this.chatbotService.generateInseratText({
        ...body,
        email,
        packageId,
        userId,
      });

      return { success: true, response };
    } catch (error) {
      console.error('Error in generateInserat:', error);
      throw new HttpException(
        'Failed to generate inserat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-text')
  @UseGuards(AuthGuard('jwt'))
  async generateText(
    @Request() req,
    @Body() body: GenerateTextRequest,
  ): Promise<{ success: boolean; response: string }> {
    console.log('User:', req.user);

    try {
      const packageId = req.user.packageId; // Package-ID aus `req.user`
      const email = req.user.email; // E-Mail aus `req.user`
      const userId = req.user.id; // User-ID aus `req.user`
      const response = await this.chatbotService.generateTextText({
        ...body,
        email,
        link: body.link, // Ensure 'link' is included
        packageId,
        userId: userId,
      });

      return { success: true, response };
    } catch (error) {
      console.error('Error in generateInserat:', error);
      throw new HttpException(
        'Failed to generate inserat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
