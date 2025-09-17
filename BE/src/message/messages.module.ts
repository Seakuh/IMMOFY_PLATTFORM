
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { MessageThread } from './entities/message-thread.entity';
import { User } from 'src/users/entities/user.entity';
import { ListingsModule } from 'src/listings/listings.module';
import { HousingRequestsModule } from 'src/housing-requests/housing-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageThread, User]),
    forwardRef(() => ListingsModule),
    forwardRef(() => HousingRequestsModule),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
