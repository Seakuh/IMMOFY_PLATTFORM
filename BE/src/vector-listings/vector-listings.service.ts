import { Injectable } from '@nestjs/common';
import { ChatGPTModel } from 'src/chatbot/models/chatgpt.model';
import { pineconeClient } from 'src/pinecone-client';

export interface VectorListingData {
  id: string;
  title?: string;
  description: string;
  location?: string;
  price?: number;
  features?: string[];
  listingType: 'apartment' | 'housing-request';
  email?: string;
  userId?: string;
  [key: string]: any; // Allow additional metadata
}

@Injectable()
export class VectorListingsService {
  constructor(private readonly chatGPTModel: ChatGPTModel) {}
  private indexName = 'listings';

  async addListing(listing: VectorListingData) {
    const index = pineconeClient.Index(this.indexName);

    // Build input text based on listing type
    let inputText: string;
    if (listing.listingType === 'housing-request') {
      inputText = `Housing Request: ${listing.description}`;
      if (listing.location) inputText += `, location: ${listing.location}`;
      if (listing.price) inputText += `, budget: ${listing.price}`;
      if (listing.features?.length)
        inputText += `, features: ${listing.features.join(', ')}`;
    } else {
      inputText = `${listing.title || 'Apartment'}, ${listing.description}`;
      if (listing.location) inputText += `, located in ${listing.location}`;
      if (listing.price) inputText += `, price: ${listing.price}`;
      if (listing.features?.length)
        inputText += `, features: ${listing.features.join(', ')}`;
    }

    const embedding = await this.chatGPTModel.generateEmbedding(inputText);

    await index.namespace('listings').upsert([
      {
        id: listing.id,
        values: embedding,
        metadata: listing,
      },
    ]);
  }

  /**
   * Add housing request to vector database
   */
  async addHousingRequest(housingRequest: {
    id: string;
    description: string;
    filteredData?: any;
    email: string;
    userId?: string;
  }) {
    const vectorData: VectorListingData = {
      id: housingRequest.id,
      description: housingRequest.description,
      listingType: 'housing-request',
      email: housingRequest.email,
      userId: housingRequest.userId,
      // Extract location, price, features from filtered data
      location: housingRequest.filteredData?.location,
      price: housingRequest.filteredData?.budget,
      features: housingRequest.filteredData?.features || [],
      // Include all filtered data as metadata
      ...housingRequest.filteredData,
    };

    await this.addListing(vectorData);
  }

  async searchListings(
    queryText: string,
    searchType: 'tenant' | 'landlord',
    filters: any,
  ) {
    console.log('Search Query:', queryText);
    console.log('Search Type:', searchType);

    // Generiere das Embedding aus dem Freitext
    const searchEmbedding =
      await this.chatGPTModel.generateEmbedding(queryText);
    console.log('Generated Embedding:', searchEmbedding);

    // Ergänze den Filter basierend auf dem Suchtyp
    const baseFilters = filters || {}; // Zusätzliche Filter vom Nutzer
    if (searchType === 'tenant') {
      baseFilters.listingType = { $eq: 'apartment' }; // Mieter suchen Wohnungen
    } else if (searchType === 'landlord') {
      baseFilters.listingType = { $eq: 'housing-request' }; // Vermieter suchen Gesuche
    }

    // Anfrage an Pinecone senden
    const results = await pineconeClient
      .Index(this.indexName)
      .namespace('listings')
      .query({
        vector: searchEmbedding,
        topK: 10, // Anzahl der gewünschten Ergebnisse
        includeMetadata: true,
        filter: baseFilters,
      });

    console.log('Search Results:', results.matches);

    // Extrahiere die relevanten Metadaten aus den Treffern
    return results.matches.map((match) => match.metadata);
  }

  /**
   * Search for similar housing requests using vector similarity
   */
  async searchSimilarRequests(
    queryVector: number[],
    topK: number = 10,
  ): Promise<Array<{ id: string; similarity?: number; metadata?: any }>> {
    try {
      const index = pineconeClient.Index(this.indexName);

      const results = await index.namespace('listings').query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        filter: {
          listingType: { $eq: 'housing-request' },
        },
      });

      return results.matches.map((match) => ({
        id: match.id,
        similarity: match.score,
        metadata: match.metadata,
      }));
    } catch (error) {
      console.error('Error searching similar requests in Pinecone:', error);
      return [];
    }
  }

  /**
   * Search for listings using vector similarity (more generic)
   */
  async searchSimilarListings(
    queryVector: number[],
    listingType?: 'apartment' | 'housing-request',
    topK: number = 10,
  ): Promise<Array<{ id: string; similarity?: number; metadata?: any }>> {
    try {
      const index = pineconeClient.Index(this.indexName);

      const filter: any = {};
      if (listingType) {
        filter.listingType = { $eq: listingType };
      }

      const results = await index.namespace('listings').query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });

      return results.matches.map((match) => ({
        id: match.id,
        similarity: match.score,
        metadata: match.metadata,
      }));
    } catch (error) {
      console.error('Error searching similar listings in Pinecone:', error);
      return [];
    }
  }
}
