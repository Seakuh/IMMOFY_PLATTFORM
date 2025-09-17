
import { forwardRef, Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageThread } from './entities/message-thread.entity';
import { User } from 'src/users/entities/user.entity';
import { ListingsService } from 'src/listings/listings.service';
import { HousingRequestsService } from 'src/housing-requests/housing-requests.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageThread)
    private readonly threadRepository: Repository<MessageThread>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => ListingsService))
    private readonly listingsService: ListingsService,
    @Inject(forwardRef(() => HousingRequestsService))
    private readonly housingRequestsService: HousingRequestsService,
  ) {}

  async sendMessage(
    senderId: string, 
    recipientId: string, 
    content: string,
    relatedListingId?: string,
    relatedHousingRequestId?: string
  ): Promise<Message> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const recipient = await this.userRepository.findOne({ where: { id: recipientId } });
    
    if (!sender) throw new NotFoundException('Sender not found');
    if (!recipient) throw new NotFoundException('Recipient not found');
    if (senderId === recipientId) throw new ForbiddenException('Cannot send message to yourself');

    // Find existing thread or create new one
    let thread = await this.findOrCreateThread(
      senderId, 
      recipientId, 
      relatedListingId, 
      relatedHousingRequestId
    );

    const message = this.messageRepository.create({ 
      sender, 
      recipient, 
      content, 
      thread,
      relatedListingId,
      relatedHousingRequestId
    });
    
    const savedMessage = await this.messageRepository.save(message);
    
    // Update thread's lastMessageAt
    thread.lastMessageAt = new Date();
    await this.threadRepository.save(thread);
    
    return savedMessage;
  }

  async sendMessageForListing(senderId: string, listingId: string, content: string): Promise<Message> {
    const listing = await this.listingsService.getListingWithOwner(listingId);

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const recipientId = listing.user.id;

    if (senderId === recipientId) {
      throw new Error('You cannot send a message to yourself.');
    }

    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const recipient = await this.userRepository.findOne({ where: { id: recipientId } });

    const message = this.messageRepository.create({
      sender,
      recipient,
      content,
    });

    return this.messageRepository.save(message);
  }
  

  async replyToThread(threadId: string, senderId: string, content: string): Promise<Message> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      relations: ['initiator', 'responder'],
    });
    if (!thread) throw new NotFoundException('Thread not found');
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const recipient = thread.initiator.id === senderId ? thread.responder : thread.initiator;
    const message = this.messageRepository.create({ sender, recipient, content, thread });
    return this.messageRepository.save(message);
  }

  async getMessagesByThread(threadId: string, userId: string): Promise<Message[]> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      relations: ['messages', 'messages.sender', 'messages.recipient', 'initiator', 'responder'],
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.initiator?.id !== userId && thread.responder?.id !== userId)
      throw new ForbiddenException('You are not part of this thread');
    
    // Mark messages as read for the current user
    await this.markMessagesAsRead(threadId, userId);
    
    return thread.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<MessageThread[]> {
    const threads = await this.threadRepository.find({
      where: [
        { initiator: { id: userId } },
        { responder: { id: userId } }
      ],
      relations: ['initiator', 'responder', 'messages', 'messages.sender', 'messages.recipient'],
      order: { lastMessageAt: 'DESC' }
    });

    // Filter threads that have at least one message and add unread count
    return threads.filter(thread => thread.messages && thread.messages.length > 0);
  }

  /**
   * Send message for housing request
   */
  async sendMessageForHousingRequest(
    senderId: string, 
    housingRequestId: string, 
    content: string
  ): Promise<Message> {
    try {
      const housingRequest = await this.housingRequestsService.findOne(housingRequestId);
      if (!housingRequest) {
        throw new NotFoundException('Housing request not found');
      }

      const recipientId = housingRequest.user?.id;
      if (!recipientId) {
        throw new NotFoundException('Housing request owner not found');
      }

      return this.sendMessage(senderId, recipientId, content, undefined, housingRequestId);
    } catch (error) {
      throw new NotFoundException('Housing request not found or inaccessible');
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(threadId: string, userId: string): Promise<void> {
    await this.messageRepository.update(
      { 
        thread: { id: threadId },
        recipient: { id: userId },
        isRead: false 
      },
      { isRead: true }
    );
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepository.count({
      where: {
        recipient: { id: userId },
        isRead: false
      }
    });
  }

  /**
   * Find or create thread between two users
   */
  private async findOrCreateThread(
    senderId: string, 
    recipientId: string,
    relatedListingId?: string,
    relatedHousingRequestId?: string
  ): Promise<MessageThread> {
    // Look for existing thread
    let thread = await this.threadRepository.findOne({
      where: [
        { 
          initiator: { id: senderId }, 
          responder: { id: recipientId },
          relatedListingId: relatedListingId || null,
          relatedHousingRequestId: relatedHousingRequestId || null
        },
        { 
          initiator: { id: recipientId }, 
          responder: { id: senderId },
          relatedListingId: relatedListingId || null,
          relatedHousingRequestId: relatedHousingRequestId || null
        }
      ],
      relations: ['initiator', 'responder']
    });

    if (!thread) {
      const initiator = await this.userRepository.findOne({ where: { id: senderId } });
      const responder = await this.userRepository.findOne({ where: { id: recipientId } });
      
      thread = this.threadRepository.create({ 
        initiator, 
        responder,
        relatedListingId,
        relatedHousingRequestId,
        lastMessageAt: new Date()
      });
      thread = await this.threadRepository.save(thread);
    }

    return thread;
  }
}
