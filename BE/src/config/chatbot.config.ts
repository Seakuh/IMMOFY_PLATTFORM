import { ChatbotConfig } from 'src/chatbot/interfaces/chatbot-config.interface';

// src/config/chatbot.config.ts
export const ChatbotPackages: Record<string, ChatbotConfig> = {
  Free: { maxTokens: 100, promptTemplate: 'Simple response: {prompt}' },
  Basic: { maxTokens: 200, promptTemplate: '{prompt}' },
  Student: {
    maxTokens: 300,
    promptTemplate: 'As a student assistant: {prompt}',
  },
  Business: {
    maxTokens: 500,
    promptTemplate: 'As a business consultant: {prompt}',
  },
};
