// src/chatbot/interfaces/chatbot.interface.ts
export interface Chatbot {
  sendMessage(prompt: string, userId: string): Promise<string>;
}
