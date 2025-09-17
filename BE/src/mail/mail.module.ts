import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ChatbotModule } from 'src/chatbot/chatbot.module';
import { MailService } from './mail.service';
import { TemplateService } from './template.service';

@Module({
  imports: [ChatbotModule, MailerModule], // Chatbot-Modul für AI-Kommunikation
  providers: [MailService, TemplateService],
  exports: [MailService], // MailService für andere Module verfügbar machen
})
export class MailModule {}
