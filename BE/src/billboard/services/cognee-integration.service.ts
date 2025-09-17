import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillboardEmbedding } from './billboard-embedding.service';

@Injectable()
export class CogneeIntegrationService {
  private readonly cogneeApiUrl: string;
  private readonly cogneeApiKey: string;

  constructor(private configService: ConfigService) {
    this.cogneeApiUrl = this.configService.get<string>('COGNEE_API_URL') || 'https://api.cognee.ai';
    this.cogneeApiKey = this.configService.get<string>('COGNEE_API_KEY');
  }

  /**
   * Store billboard embedding in Cognee
   */
  async storeBillboardEmbedding(embedding: BillboardEmbedding): Promise<void> {
    try {
      // Create document in Cognee
      const document = {
        id: `billboard_${embedding.id}`,
        content: embedding.text,
        metadata: {
          type: 'billboard_listing',
          billboard_id: embedding.id,
          ...embedding.metadata,
        },
      };

      await this.createCogneeDocument(document);

      // Store embedding vector
      await this.storeEmbeddingVector(embedding);

      // Create relations
      await this.createBillboardRelations(embedding);

    } catch (error) {
      console.error('Error storing billboard in Cognee:', error);
      throw new Error('Failed to store billboard in Cognee');
    }
  }

  /**
   * Create document in Cognee
   */
  private async createCogneeDocument(document: any): Promise<void> {
    const response = await fetch(`${this.cogneeApiUrl}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cogneeApiKey}`,
      },
      body: JSON.stringify(document),
    });

    if (!response.ok) {
      throw new Error(`Cognee document creation failed: ${response.statusText}`);
    }
  }

  /**
   * Store embedding vector in Cognee
   */
  private async storeEmbeddingVector(embedding: BillboardEmbedding): Promise<void> {
    const vectorData = {
      id: `billboard_vector_${embedding.id}`,
      vector: embedding.embedding,
      metadata: {
        document_id: `billboard_${embedding.id}`,
        type: 'billboard_embedding',
        ...embedding.metadata,
      },
    };

    const response = await fetch(`${this.cogneeApiUrl}/vectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cogneeApiKey}`,
      },
      body: JSON.stringify(vectorData),
    });

    if (!response.ok) {
      throw new Error(`Cognee vector storage failed: ${response.statusText}`);
    }
  }

  /**
   * Create relations in Cognee knowledge graph
   */
  private async createBillboardRelations(embedding: BillboardEmbedding): Promise<void> {
    const relations = [];

    // Location-based relations
    relations.push({
      source_id: `billboard_${embedding.id}`,
      target_id: `location_${embedding.metadata.location.toLowerCase().replace(/\s+/g, '_')}`,
      relation_type: 'LOCATED_IN',
      properties: {
        location: embedding.metadata.location,
      },
    });

    // Category-based relations
    relations.push({
      source_id: `billboard_${embedding.id}`,
      target_id: `category_${embedding.metadata.category}`,
      relation_type: 'BELONGS_TO_CATEGORY',
      properties: {
        category: embedding.metadata.category,
      },
    });

    // Type-based relations
    relations.push({
      source_id: `billboard_${embedding.id}`,
      target_id: `type_${embedding.metadata.type}`,
      relation_type: 'IS_TYPE',
      properties: {
        type: embedding.metadata.type,
      },
    });

    // Price-based relations (if price exists)
    if (embedding.metadata.price) {
      const priceRange = this.getPriceRange(embedding.metadata.price);
      relations.push({
        source_id: `billboard_${embedding.id}`,
        target_id: `price_range_${priceRange}`,
        relation_type: 'IN_PRICE_RANGE',
        properties: {
          price: embedding.metadata.price,
          price_range: priceRange,
        },
      });
    }

    // Hashtag-based relations
    embedding.metadata.hashtags.forEach(hashtag => {
      relations.push({
        source_id: `billboard_${embedding.id}`,
        target_id: `hashtag_${hashtag}`,
        relation_type: 'TAGGED_WITH',
        properties: {
          hashtag,
        },
      });
    });

    // Store all relations
    for (const relation of relations) {
      await this.createCogneeRelation(relation);
    }
  }

  /**
   * Create a relation in Cognee
   */
  private async createCogneeRelation(relation: any): Promise<void> {
    const response = await fetch(`${this.cogneeApiUrl}/relations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cogneeApiKey}`,
      },
      body: JSON.stringify(relation),
    });

    if (!response.ok && response.status !== 409) { // 409 = relation already exists
      console.warn(`Failed to create relation: ${response.statusText}`);
    }
  }

  /**
   * Determine price range for relations
   */
  private getPriceRange(price: number): string {
    if (price <= 500) return 'budget';
    if (price <= 1000) return 'affordable';
    if (price <= 1500) return 'mid_range';
    if (price <= 2500) return 'premium';
    return 'luxury';
  }

  /**
   * Search similar billboards using Cognee
   */
  async searchSimilarBillboards(
    queryEmbedding: number[],
    limit: number = 10,
    filters?: any
  ): Promise<any[]> {
    try {
      const searchRequest = {
        vector: queryEmbedding,
        limit,
        filters: {
          type: 'billboard_embedding',
          ...filters,
        },
      };

      const response = await fetch(`${this.cogneeApiUrl}/search/vector`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.cogneeApiKey}`,
        },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        throw new Error(`Cognee search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching similar billboards:', error);
      return [];
    }
  }
}