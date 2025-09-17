import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsModule } from 'src/listings/listings.module';
import { UserContext } from 'src/user-context/entities/user-context.entity';
import { UserContextModule } from 'src/user-context/user-context.module';
import { VectorListingsModule } from 'src/vector-listings/vector-listings.module';
import { ChatbotController } from './controllers/chatbot.controller';
import { ChatGPTModel } from './models/chatgpt.model';
import { ChatbotService } from './services/chatbot.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserContext]),
    UserContextModule,
    forwardRef(() => ListingsModule), // Handle circular dependency
    forwardRef(() => VectorListingsModule),
  ],
  controllers: [ChatbotController], // Controller hier registrieren
  providers: [ChatbotService, ChatGPTModel], // ChatGPTModel hier registrieren
  exports: [ChatbotService, ChatGPTModel], // Optional: falls in anderen Modulen benötigt
})
export class ChatbotModule {}
