import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ChatGPTModel } from '../chatbot/models/chatgpt.model';
import { ImageService } from '../images/image.service';
import { UserManagementService } from '../users/services/user-management.service';
import { VectorListingsService } from '../vector-listings/vector-listings.service';
import {
  CreateHousingRequestDto,
  OnboardingResponse,
} from './dto/create-housing-request.dto';
import { UpdateHousingRequestDto } from './dto/update-housing-request.dto';
import { HousingRequest } from './entities/housing-request.entity';
import { HousingRequestRepository } from './repositories/housing-request.repository';

@Injectable()
export class HousingRequestsService {
  constructor(
    private readonly housingRequestRepository: HousingRequestRepository,
    private readonly imageService: ImageService,
    private readonly chatGPTModel: ChatGPTModel,
    @Inject(forwardRef(() => UserManagementService))
    private readonly userManagementService: UserManagementService,
    @Inject(forwardRef(() => VectorListingsService))
    private readonly vectorListingsService: VectorListingsService,
  ) {}

  async create(
    createHousingRequestDto: CreateHousingRequestDto,
    images?: Express.Multer.File[],
  ): Promise<OnboardingResponse> {
    try {
      // 1. Find or create user
      const { user, password, isNewUser } =
        await this.userManagementService.getOrCreateUserForHousingRequest(
          createHousingRequestDto.email,
          createHousingRequestDto.prompt,
        );

      // 2. Parse metadata if provided
      let metadata = {};
      if (createHousingRequestDto.metadata) {
        try {
          metadata = JSON.parse(createHousingRequestDto.metadata);
        } catch (error) {
          console.error('Error parsing metadata:', error);
        }
      }

      // 3. Upload images to Hetzner if provided
      let uploadedImageUrls: string[] = [];
      if (images && images.length > 0) {
        uploadedImageUrls = await Promise.all(
          images.map((image) => this.imageService.uploadImage(image)),
        );
      }

      // 4. Use AI to filter and extract structured data from prompt
      const filteredData = await this.extractAndFilterData(
        createHousingRequestDto.prompt,
        metadata,
      );

      // 5. Generate enhanced description using AI
      const generatedDescription = await this.generateEnhancedDescription(
        createHousingRequestDto.prompt,
        filteredData,
        uploadedImageUrls.length > 0,
      );

      // 6. Generate vector embedding
      const inputText = `Housing Request: ${generatedDescription}`;
      const vector = await this.chatGPTModel.generateEmbedding(inputText);

      // 7. Create housing request in database
      const savedRequest = await this.housingRequestRepository.createAndSave({
        prompt: createHousingRequestDto.prompt,
        email: createHousingRequestDto.email,
        name: createHousingRequestDto.name,
        metadata,
        filteredData,
        generatedDescription,
        uploadedImages: uploadedImageUrls,
        vector,
        status: 'processed',
        isPublished: true,
        user, // Link to user
      });

      // 8. Add to vector database for semantic search
      await this.vectorListingsService.addHousingRequest({
        id: savedRequest.id,
        description: generatedDescription,
        filteredData,
        email: createHousingRequestDto.email,
        userId: user.id,
      });

      // 9. Send confirmation email if new user
      if (isNewUser && password) {
        try {
          await this.userManagementService.sendHousingRequestNotification(
            user,
            password,
            {
              id: savedRequest.id,
              generatedDescription,
              filteredData,
            },
          );
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the entire operation if email fails
        }
      }

      return {
        success: true,
        message:
          'Wohnungsgesuch erfolgreich erstellt, veröffentlicht und für die Suche indexiert',
        submissionId: savedRequest.id,
        housingRequest: {
          id: savedRequest.id,
          filteredData: savedRequest.filteredData,
          uploadedImages: savedRequest.uploadedImages,
        },
      };
    } catch (error) {
      console.error('Error creating housing request:', error);
      throw new Error(`Failed to create housing request: ${error.message}`);
    }
  }

  private async extractAndFilterData(
    prompt: string,
    metadata: any,
  ): Promise<any> {
    const systemPrompt = `
    Du bist ein KI-Assistent, der Wohnungsgesuche analysiert und strukturiert. 
    Extrahiere alle relevanten Informationen aus dem Text und gib sie als JSON-Objekt zurück.
    
    Erwartete Felder (alle optional):
    - budget: Maximaler Mietpreis
    - location: Gewünschte Gegend/Stadt
    - rooms: Anzahl Zimmer
    - size: Wohnungsgröße in qm
    - moveInDate: Gewünschter Einzugstermin
    - duration: Mietdauer (befristet/unbefristet)
    - furnished: Möblierung gewünscht (boolean)
    - pets: Haustiere (boolean)
    - smoking: Rauchen erlaubt (boolean)
    - parking: Parkplatz gewünscht (boolean)
    - balcony: Balkon gewünscht (boolean)
    - garden: Garten gewünscht (boolean)
    - elevator: Aufzug gewünscht (boolean)
    - accessible: Barrierefreiheit (boolean)
    - wg: WG-tauglich (boolean)
    - description: Kurze Zusammenfassung der Anfrage
    - contactName: Name des Suchenden
    - phoneNumber: Telefonnummer
    - occupation: Beruf/Tätigkeit
    - income: Einkommen
    - guarantor: Bürgschaft verfügbar (boolean)
    - references: Referenzen vorhanden (boolean)
    
    Gib nur das JSON-Objekt zurück, ohne zusätzlichen Text.
    `;

    const userPrompt = `
    Prompt: ${prompt}
    
    Zusätzliche Metadaten: ${JSON.stringify(metadata)}
    `;

    try {
      const response = await this.chatGPTModel.createChatCompletionWithSystem(
        systemPrompt,
        userPrompt,
      );

      // Try to parse the response as JSON
      try {
        // Clean the response from markdown code blocks
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '');
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse
            .replace(/^```\s*/, '')
            .replace(/\s*```$/, '');
        }

        return JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.error('Raw response:', response);
        // Return a fallback object with basic extracted info
        return {
          description: prompt.substring(0, 200),
          rawResponse: response,
        };
      }
    } catch (error) {
      console.error('Error extracting data with AI:', error);
      return { description: prompt.substring(0, 200) };
    }
  }

  private async generateEnhancedDescription(
    originalPrompt: string,
    filteredData: any,
    hasImages: boolean,
  ): Promise<string> {
    const systemPrompt = `
    Du bist ein Experte für Wohnungsgesuche. Erstelle basierend auf den gegebenen Daten 
    eine professionelle und ansprechende Beschreibung für ein Wohnungsgesuch.
    
    Die Beschreibung soll:
    - Professionell und höflich formuliert sein
    - Alle wichtigen Informationen enthalten
    - Vertrauen erwecken
    - Circa 150-250 Wörter lang sein
    - In der ersten Person geschrieben sein
    `;

    const userPrompt = `
    Original Anfrage: ${originalPrompt}
    
    Strukturierte Daten: ${JSON.stringify(filteredData)}
    
    Hat Bilder: ${hasImages ? 'Ja' : 'Nein'}
    
    Erstelle eine optimierte Beschreibung für dieses Wohnungsgesuch.
    `;

    try {
      const response = await this.chatGPTModel.createChatCompletionWithSystem(
        systemPrompt,
        userPrompt,
      );
      return response;
    } catch (error) {
      console.error('Error generating enhanced description:', error);
      return originalPrompt; // Fallback to original prompt
    }
  }

  async findAll(): Promise<HousingRequest[]> {
    return this.housingRequestRepository.findPublished();
  }

  async findOne(id: string): Promise<HousingRequest> {
    return this.housingRequestRepository.findPublishedById(id);
  }

  /**
   * Find housing requests by user
   */
  async findByUser(userId: string): Promise<HousingRequest[]> {
    return this.housingRequestRepository.findByUserId(userId);
  }

  /**
   * Find housing requests by email
   */
  async findByEmail(email: string): Promise<HousingRequest[]> {
    return this.housingRequestRepository.findByEmail(email);
  }

  /**
   * Find similar housing requests using vector similarity
   */
  async findSimilar(id: string, limit: number = 5): Promise<HousingRequest[]> {
    try {
      // Get the housing request to find similar ones for
      const targetRequest =
        await this.housingRequestRepository.findPublishedById(id);
      if (!targetRequest || !targetRequest.vector) {
        throw new Error(
          `Housing request with ID ${id} not found or has no vector`,
        );
      }

      // Find all other published housing requests
      const allRequests = await this.housingRequestRepository.findPublished();

      // Calculate similarity scores and filter out the target request
      const similarities = allRequests
        .filter((request) => request.id !== id && request.vector)
        .map((request) => ({
          request,
          similarity: this.calculateCosineSimilarity(
            targetRequest.vector,
            request.vector,
          ),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map((item) => item.request);

      return similarities;
    } catch (error) {
      console.error('Error finding similar housing requests:', error);
      throw new Error(
        `Failed to find similar housing requests: ${error.message}`,
      );
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(
    vectorA: number[],
    vectorB: number[],
  ): number {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Get homepage data with latest and featured housing requests
   */
  async getHomepageData(): Promise<{
    latest: HousingRequest[];
    featured: HousingRequest[];
    stats: {
      totalRequests: number;
      activeRequests: number;
      recentRequests: number;
    };
  }> {
    try {
      const allRequests = await this.housingRequestRepository.findPublished();

      // Get latest 6 requests
      const latest = allRequests
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 6);

      // Get featured requests (requests with high engagement or special criteria)
      const featured = allRequests
        .filter((req) => req.uploadedImages && req.uploadedImages.length > 0)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 4);

      // Calculate stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRequests = allRequests.filter(
        (req) => new Date(req.createdAt) > thirtyDaysAgo,
      ).length;

      const stats = {
        totalRequests: allRequests.length,
        activeRequests: allRequests.filter((req) => req.status === 'processed')
          .length,
        recentRequests,
      };

      return {
        latest,
        featured,
        stats,
      };
    } catch (error) {
      console.error('Error getting homepage data:', error);
      throw new Error(`Failed to get homepage data: ${error.message}`);
    }
  }

  /**
   * Find similar housing requests using improved vector similarity with filters
   */
  async findSimilarWithVectors(
    id: string,
    limit: number = 5,
  ): Promise<{
    similar: HousingRequest[];
    similarityScores?: number[];
  }> {
    try {
      // Get the housing request to find similar ones for
      const targetRequest =
        await this.housingRequestRepository.findPublishedById(id);
      if (!targetRequest || !targetRequest.vector) {
        throw new Error(
          `Housing request with ID ${id} not found or has no vector`,
        );
      }

      // Use vector listings service for better similarity search
      const vectorResults =
        await this.vectorListingsService.searchSimilarRequests(
          targetRequest.vector,
          limit + 1, // +1 because we'll filter out the target request
        );

      // Filter out the target request and convert to housing requests
      const similarIds = vectorResults
        .filter((result) => result.id !== id)
        .slice(0, limit)
        .map((result) => result.id);

      const similarRequests = await Promise.all(
        similarIds.map((id) =>
          this.housingRequestRepository.findPublishedById(id),
        ),
      );

      // Get similarity scores for reference
      const similarityScores = vectorResults
        .filter((result) => result.id !== id)
        .slice(0, limit)
        .map((result) => result.similarity || 0);

      return {
        similar: similarRequests.filter((req) => req !== null),
        similarityScores,
      };
    } catch (error) {
      console.error(
        'Error finding similar housing requests with vectors:',
        error,
      );
      // Fallback to the original method
      const similar = await this.findSimilar(id, limit);
      return { similar };
    }
  }

  /**
   * Search for similar housing requests based on description text
   */
  async searchSimilarByDescription(
    description: string,
    priceRange?: { min: number; max: number },
    location?: string,
    propertyType?: string,
    limit: number = 10,
  ): Promise<{
    results: HousingRequest[];
    searchVector?: number[];
  }> {
    try {
      // Generate embedding for search description
      const searchVector = await this.chatGPTModel.generateEmbedding(
        `Housing Request: ${description}`,
      );

      // Use vector service to find similar requests
      const vectorResults =
        await this.vectorListingsService.searchSimilarRequests(
          searchVector,
          limit * 2, // Get more results to apply filters
        );

      // Get housing requests from vector results
      const allResults = await Promise.all(
        vectorResults.map(async (result) => {
          const request = await this.housingRequestRepository.findPublishedById(
            result.id,
          );
          return request
            ? { request, similarity: result.similarity || 0 }
            : null;
        }),
      );

      // Filter out null results and apply additional filters
      let filteredResults = allResults
        .filter((item) => item !== null)
        .map((item) => item!);

      // Apply price range filter
      if (priceRange) {
        filteredResults = filteredResults.filter((item) => {
          const budget = item.request.filteredData?.budget;
          if (!budget) return true; // Include if no budget specified
          return budget >= priceRange.min && budget <= priceRange.max;
        });
      }

      // Apply location filter
      if (location) {
        filteredResults = filteredResults.filter((item) => {
          const requestLocation = item.request.filteredData?.location;
          return (
            requestLocation &&
            requestLocation.toLowerCase().includes(location.toLowerCase())
          );
        });
      }

      // Apply property type filter
      if (propertyType) {
        filteredResults = filteredResults.filter((item) => {
          const description =
            item.request.generatedDescription?.toLowerCase() || '';
          return description.includes(propertyType.toLowerCase());
        });
      }

      const results = filteredResults
        .slice(0, limit)
        .map((item) => item.request);

      return {
        results,
        searchVector,
      };
    } catch (error) {
      console.error('Error searching similar by description:', error);
      throw new Error(`Failed to search similar requests: ${error.message}`);
    }
  }

  /**
   * Update housing request
   */
  async update(
    id: string,
    updateDto: UpdateHousingRequestDto,
    images?: Express.Multer.File[],
  ): Promise<HousingRequest> {
    try {
      // Get existing housing request
      const existingRequest = await this.housingRequestRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!existingRequest) {
        throw new Error(`Housing request with ID ${id} not found`);
      }

      // Handle new image uploads
      let newUploadedImages: string[] = [];
      if (images && images.length > 0) {
        newUploadedImages = await Promise.all(
          images.map((image) => this.imageService.uploadImage(image)),
        );
      }

      // Parse metadata if provided
      let metadata = existingRequest.metadata;
      if (updateDto.metadata) {
        try {
          metadata = JSON.parse(updateDto.metadata);
        } catch (error) {
          console.error('Error parsing metadata:', error);
        }
      }

      // Re-process AI filtering if prompt changed
      let filteredData = existingRequest.filteredData;
      let generatedDescription = existingRequest.generatedDescription;
      let vector = existingRequest.vector;

      if (updateDto.prompt) {
        filteredData = await this.extractAndFilterData(
          updateDto.prompt,
          metadata,
        );
        generatedDescription = await this.generateEnhancedDescription(
          updateDto.prompt,
          filteredData,
          (existingRequest.uploadedImages?.length || 0) +
            newUploadedImages.length >
            0,
        );

        // Generate new vector embedding
        const inputText = `Housing Request: ${generatedDescription}`;
        vector = await this.chatGPTModel.generateEmbedding(inputText);
      }

      // Merge uploaded images
      const allImages = [
        ...(existingRequest.uploadedImages || []),
        ...newUploadedImages,
      ];

      // Update housing request
      const updateData: Partial<HousingRequest> = {
        ...updateDto,
        metadata,
        filteredData,
        generatedDescription,
        uploadedImages: allImages,
        vector,
      };

      const updatedRequest =
        await this.housingRequestRepository.updateHousingRequest(
          id,
          updateData,
        );

      // Update vector database if description changed
      if (updateDto.prompt || newUploadedImages.length > 0) {
        await this.vectorListingsService.addHousingRequest({
          id: updatedRequest.id,
          description: updatedRequest.generatedDescription,
          filteredData: updatedRequest.filteredData,
          email: updatedRequest.email,
          userId: updatedRequest.user?.id,
        });
      }

      return updatedRequest;
    } catch (error) {
      console.error('Error updating housing request:', error);
      throw new Error(`Failed to update housing request: ${error.message}`);
    }
  }
}
