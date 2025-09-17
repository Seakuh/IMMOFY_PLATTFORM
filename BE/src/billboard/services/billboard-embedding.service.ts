import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';

export interface BillboardEmbedding {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    title: string;
    location: string;
    category: string;
    type: string;
    price?: number;
    hashtags: string[];
    createdAt: string;
  };
}

@Injectable()
export class BillboardEmbeddingService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Generate embedding text from billboard data
   */
  generateEmbeddingText(billboard: any): string {
    const parts = [];

    // Title and description
    parts.push(`Title: ${billboard.title}`);
    parts.push(`Description: ${billboard.description}`);

    // Content if available
    if (billboard.content) {
      parts.push(`Content: ${billboard.content}`);
    }

    // Location information
    parts.push(`Location: ${billboard.location}`);
    if (billboard.city) parts.push(`City: ${billboard.city}`);
    if (billboard.address) parts.push(`Address: ${billboard.address}`);

    // Property details
    parts.push(`Category: ${billboard.category}`);
    parts.push(`Type: ${billboard.type}`);

    if (billboard.price) {
      parts.push(`Price: €${billboard.price} ${billboard.priceType || 'monthly'}`);
    }

    if (billboard.size) parts.push(`Size: ${billboard.size} sqm`);
    if (billboard.rooms) parts.push(`Rooms: ${billboard.rooms}`);
    if (billboard.bedrooms) parts.push(`Bedrooms: ${billboard.bedrooms}`);
    if (billboard.bathrooms) parts.push(`Bathrooms: ${billboard.bathrooms}`);

    // Features
    const features = [];
    if (billboard.furnished) features.push('furnished');
    if (billboard.balcony) features.push('balcony');
    if (billboard.garden) features.push('garden');
    if (billboard.parking) features.push('parking');
    if (billboard.elevator) features.push('elevator');
    if (billboard.petsAllowed) features.push('pets allowed');
    if (billboard.smokingAllowed) features.push('smoking allowed');
    if (billboard.accessible) features.push('accessible');

    if (features.length > 0) {
      parts.push(`Features: ${features.join(', ')}`);
    }

    // Amenities
    if (billboard.amenities && billboard.amenities.length > 0) {
      parts.push(`Amenities: ${billboard.amenities.join(', ')}`);
    }

    // Hashtags
    if (billboard.hashtags && billboard.hashtags.length > 0) {
      parts.push(`Tags: ${billboard.hashtags.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Generate embedding using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Create billboard embedding for storage
   */
  async createBillboardEmbedding(billboard: any): Promise<BillboardEmbedding> {
    const text = this.generateEmbeddingText(billboard);
    const embedding = await this.generateEmbedding(text);

    return {
      id: billboard.id,
      text,
      embedding,
      metadata: {
        title: billboard.title,
        location: billboard.location,
        category: billboard.category,
        type: billboard.type,
        price: billboard.price,
        hashtags: billboard.hashtags || [],
        createdAt: billboard.createdAt.toISOString(),
      },
    };
  }
}