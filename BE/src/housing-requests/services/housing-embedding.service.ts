import { Injectable } from '@nestjs/common';
import { ChatGPTModel } from '../../chatbot/models/chatgpt.model';
import { HousingRequest } from '../entities/housing-request.entity';

export interface HousingEmbedding {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    name?: string;
    email?: string;
    location?: string;
    budget?: number;
    rooms?: number;
    tags?: string[];
    createdAt: string;
  };
}

@Injectable()
export class HousingEmbeddingService {
  constructor(private readonly chatGPTModel: ChatGPTModel) {}

  /**
   * Build a canonical text for embeddings from a housing request
   */
  generateEmbeddingText(request: HousingRequest): string {
    const parts: string[] = [];

    // Primary description
    if (request.generatedDescription) {
      parts.push(`Description: ${request.generatedDescription}`);
    } else if (request.prompt) {
      parts.push(`Prompt: ${request.prompt}`);
    }

    // Structured data
    const md = request.filteredData || {};
    if (md.location) parts.push(`Location: ${md.location}`);
    if (md.budget) parts.push(`Budget: €${md.budget}`);
    if (md.rooms) parts.push(`Rooms: ${md.rooms}`);
    if (Array.isArray(md.features) && md.features.length) {
      parts.push(`Features: ${md.features.join(', ')}`);
    }

    // Tags (if any in metadata)
    if (Array.isArray(md.tags) && md.tags.length) {
      parts.push(`Tags: ${md.tags.join(', ')}`);
    }

    // Name hint (optional)
    if (request.name) parts.push(`Name: ${request.name}`);

    return parts.join('\n');
  }

  /**
   * Generate an OpenAI embedding via ChatGPTModel
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return this.chatGPTModel.generateEmbedding(text);
  }

  /**
   * Create a full embedding payload
   */
  async createHousingEmbedding(request: HousingRequest): Promise<HousingEmbedding> {
    const text = this.generateEmbeddingText(request);
    const embedding = await this.generateEmbedding(text);

    const md = request.filteredData || {};
    return {
      id: request.id,
      text,
      embedding,
      metadata: {
        name: request.name,
        email: request.email,
        location: md.location,
        budget: md.budget,
        rooms: md.rooms,
        tags: md.tags || md.features || [],
        createdAt: request.createdAt?.toISOString?.() || new Date().toISOString(),
      },
    };
  }
}

