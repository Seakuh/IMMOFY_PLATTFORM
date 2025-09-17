import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: any,
  ) {
    const senderId = req.user.id;
    const { recipientId, content, relatedListingId, relatedHousingRequestId } =
      createMessageDto;
    const message = await this.messagesService.sendMessage(
      senderId,
      recipientId,
      content,
      relatedListingId,
      relatedHousingRequestId,
    );
    return { success: true, message };
  }

  @Post('thread/:threadId/reply')
  async replyToThread(
    @Param('threadId') threadId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: any,
  ) {
    const senderId = req.user.id;
    const { content } = createMessageDto;
    const reply = await this.messagesService.replyToThread(
      threadId,
      senderId,
      content,
    );
    return { success: true, reply };
  }

  @Get('thread/:threadId')
  async getThreadMessages(
    @Param('threadId') threadId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const messages = await this.messagesService.getMessagesByThread(
      threadId,
      userId,
    );
    return { success: true, messages };
  }

  @Get('conversations')
  async getConversations(@Req() req: any) {
    const userId = req.user.id;
    const conversations = await this.messagesService.getConversations(userId);
    return { success: true, conversations };
  }

  @Post('listing/:listingId')
  async sendMessageForListing(
    @Param('listingId') listingId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: any,
  ) {
    const senderId = req.user.id;
    const { content } = createMessageDto;
    const message = await this.messagesService.sendMessageForListing(
      senderId,
      listingId,
      content,
    );
    return { success: true, message };
  }

  @Post('housing-request/:housingRequestId')
  async sendMessageForHousingRequest(
    @Param('housingRequestId') housingRequestId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: any,
  ) {
    const senderId = req.user.id;
    const { content } = createMessageDto;
    const message = await this.messagesService.sendMessageForHousingRequest(
      senderId,
      housingRequestId,
      content,
    );
    return { success: true, message };
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    const count = await this.messagesService.getUnreadCount(userId);
    return { success: true, unreadCount: count };
  }

  @Post('thread/:threadId/mark-read')
  async markThreadAsRead(@Param('threadId') threadId: string, @Req() req: any) {
    const userId = req.user.id;
    await this.messagesService.markMessagesAsRead(threadId, userId);
    return { success: true, message: 'Messages marked as read' };
  }
}
