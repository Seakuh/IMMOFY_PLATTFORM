import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HousingEmbedding } from './housing-embedding.service';

@Injectable()
export class HousingCogneeIntegrationService {
  private readonly cogneeApiUrl: string;
  private readonly cogneeApiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.cogneeApiUrl = this.configService.get<string>('COGNEE_API_URL') || 'https://api.cognee.ai';
    this.cogneeApiKey = this.configService.get<string>('COGNEE_API_KEY');
  }

  private get headers() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.cogneeApiKey) headers['Authorization'] = `Bearer ${this.cogneeApiKey}`;
    return headers;
  }

  /**
   * Store housing request as document + vector in Cognee
   */
  async storeHousingEmbedding(embedding: HousingEmbedding): Promise<void> {
    if (!this.cogneeApiKey) return; // Skip silently if not configured
    // Create a document
    const document = {
      id: `housing_${embedding.id}`,
      content: embedding.text,
      metadata: {
        type: 'housing_request',
        housing_id: embedding.id,
        ...embedding.metadata,
      },
    };

    const docRes = await fetch(`${this.cogneeApiUrl}/documents`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(document),
    });
    if (!docRes.ok && docRes.status !== 409) {
      throw new Error(`Cognee document error: ${docRes.statusText}`);
    }

    // Store vector
    const vectorData = {
      id: `housing_vector_${embedding.id}`,
      vector: embedding.embedding,
      metadata: {
        document_id: `housing_${embedding.id}`,
        type: 'housing_embedding',
        ...embedding.metadata,
      },
    };

    const vecRes = await fetch(`${this.cogneeApiUrl}/vectors`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(vectorData),
    });
    if (!vecRes.ok && vecRes.status !== 409) {
      throw new Error(`Cognee vector error: ${vecRes.statusText}`);
    }
  }

  /**
   * Vector similarity search in Cognee for housing requests
   */
  async searchSimilarHousing(
    queryEmbedding: number[],
    topK: number = 10,
    filters?: Record<string, any>,
  ): Promise<Array<{ id?: string; metadata?: any }>> {
    if (!this.cogneeApiKey) return [];
    const body = {
      vector: queryEmbedding,
      limit: topK,
      filters: { type: 'housing_embedding', ...(filters || {}) },
    };
    const res = await fetch(`${this.cogneeApiUrl}/search/vector`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    try {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
}

