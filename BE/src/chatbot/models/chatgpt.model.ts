// src/chatbot/models/chatgpt.model.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { UserContextSchema } from 'src/chatbot/schemas/user-context.schema';
import z from 'zod/lib';
import { Chatbot } from '../interfaces/chatbot.interface';
import { ListingSchema } from '../schemas/listing.schema';

@Injectable()
export class ChatGPTModel implements Chatbot {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // API-Key aus .env-Datei
    });
  }

  async sendMessage(prompt: string, userId: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Modell auswählen
        messages: [{ role: 'user', content: prompt }],
      });

      return response.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Error in ChatGPTModel:', error);
      throw new Error('Failed to fetch response from OpenAI API');
    }
  }

  async extractUserData(
    prompt: string,
  ): Promise<z.infer<typeof UserContextSchema>> {
    const extractionPrompt = `
    Extract user apartment search preferences into structured data based on the schema below. Only fill fields if they are explicitly mentioned. If unsure, set them to null.
    Schema:
    - location: City or area (string or null)
    - budget: Max rent in € (number or null)
    - bedrooms: Number of bedrooms (number or null)
    - features: Additional features like balcony, garden, etc. (array of strings or null)
    - petsAllowed: Pets allowed? (boolean or null)
    - furnished: Furnished? (boolean or null)
    - earliestMoveInDate: Earliest move-in date (ISO format or null)
    - latestMoveInDate: Latest move-in date (ISO format or null)
    - districts: Preferred districts (array of strings or null)
    - address: Specific address if provided (string or null)
    - maxDistance: Max distance in km (number or null)
    - recentListingsSince: Only listings since (ISO format or null)
    - swapOffer: Swap offer preferred? (boolean or null)
    - kitchenIncluded: Kitchen required? (boolean or null)
    - floor: Preferred floor (e.g., "ground floor" or "1st floor", string or null)
    - barrierFree: Accessible? (boolean or null)
    - hasPhotos: Only listings with photos? (boolean or null)
    - garden: Garden required? (boolean or null)
    - balcony: Balcony or terrace required? (boolean or null)
    - onlineViewing: Online viewing available? (boolean or null)
    `;

    try {
      const completion = await this.openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: extractionPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: zodResponseFormat(UserContextSchema, 'context'),
      });

      return completion.choices[0].message.parsed;
    } catch (error) {
      if (error.status === 429) {
        throw new HttpException(
          'API-Limit erreicht. Bitte versuchen Sie es später erneut.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Allgemeine Fehler
      throw new HttpException(
        'Fehler bei der Datenextraktion. Bitte wenden Sie sich an den Support.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createChatCompletionWithSystem(
    systemContent: string,
    userPrompt: string,
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userPrompt },
        ],
      });

      return response.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error(
        'Error in ChatGPTModel (createChatCompletionWithSystem):',
        error,
      );
      throw new Error('Failed to fetch response from OpenAI API');
    }
  }

  /**
   * Extrahiert strukturierte Daten aus einem Listing-Link.
   */
  async extractListingData(
    link: string,
  ): Promise<z.infer<typeof ListingSchema>> {
    try {
      // 2. Prompt für GPT-4 erstellen
      const extractionPrompt = `
        Extract structured information about a real estate listing from the following HTML content.
        The extracted data should include:
        - platform (e.g., "Immobilienscout24", "Craigslist")
        - title (the listing's headline)
        - description (details about the property)
        - landlordName (if available)
        - landlordEmail (if available)

        Respond in JSON format matching this schema:
        {
          "platform": "string | null",
          "title": "string | null",
          "description": "string | null",
          "landlordName": "string | null",
          "landlordEmail": "string | null"
        }

        HTML content:
        ${link}
      `;

      // 3. GPT-4 API-Aufruf mit zodResponseFormat
      const completion = await this.openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: extractionPrompt },
          { role: 'user', content: 'Please analyze this listing.' },
        ],
        response_format: zodResponseFormat(ListingSchema, 'listing'),
      });

      // 4. Geparste Daten zurückgeben
      return completion.choices[0].message.parsed;
    } catch (error) {
      console.error('Error in extractListingData:', error);
      throw new Error('Failed to extract listing data');
    }
  }

  async generateEmbedding(input: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: input,
        encoding_format: 'float',
      });

      if (response.data && response.data.length > 0) {
        return response.data[0].embedding;
      } else {
        throw new Error('No embedding data received from OpenAI API.');
      }
    } catch (error) {
      console.error('Error generating embedding:', error.message || error);
      throw new Error('Failed to generate embedding');
    }
  }

  // async enhanceQuery(queryText: string): Promise<string[]> {
  //   const response = await this.openai.generateSuggestions(queryText);
  //   return response; // Liefert alternative Suchbegriffe
  // }
}
