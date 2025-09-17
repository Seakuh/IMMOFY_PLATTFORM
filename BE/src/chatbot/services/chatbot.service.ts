// src/chatbot/services/chatbot.service.ts
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ListingsService } from 'src/listings/listings.service';
import { UserContextService } from 'src/user-context/services/user-context.service';
import { VectorListingsService } from 'src/vector-listings/vector-listings.service';
import {
  GenerateInseratTextBody,
  GenerateTextTextBody,
} from '../dto/generate-inserat.dto';
import { ChatGPTModel } from '../models/chatgpt.model';
import {
  systemContentBasic,
  systemContentBusiness,
  systemContentFree,
  systemContentStudent,
} from './systemContent';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly chatGPTModel: ChatGPTModel,
    private readonly userContextService: UserContextService,
    @Inject(forwardRef(() => ListingsService))
    private readonly listingsService: ListingsService,
    private readonly vectorListingsService: VectorListingsService,
  ) {}

  async handleChat(
    prompt: string,
    userId: string,
    packageId: string,
  ): Promise<string> {
    // Paketlogik: Wähle Modell basierend auf Pakettyp
    if (packageId === 'Business') {
      // Beispiel: Erweitertes Prompt
      prompt = `As a business consultant, respond professionally: ${prompt}`;
    } else if (packageId === 'Student') {
      prompt = `As a student assistant, respond informally: ${prompt}`;
    }
    return this.chatGPTModel.sendMessage(prompt, userId);
  }

  /**
   * Generate Inserat Text, Process User Data, and Save the Listing
   */
  async generateInseratText(body: GenerateInseratTextBody): Promise<string> {
    const { prompt, packageId, userId } = body;

    try {
      // 1. Extract updated user data from the prompt
      const updatedContextData =
        await this.chatGPTModel.extractUserData(prompt);

      // 2. Update and retrieve user context data
      const userData = await this.userContextService.createOrUpdateContext(
        userId,
        updatedContextData,
      );

      // 3. Generate an enriched prompt using user data and package details
      const enrichedPrompt = this.createEnrichedPrompt(prompt, userData);

      // 4. Generate the system and user prompts
      const { systemContent, userPrompt } = this.generatePrompt(
        packageId,
        enrichedPrompt,
      );

      // 5. Generate text using ChatGPT
      const generatedMessage =
        await this.chatGPTModel.createChatCompletionWithSystem(
          systemContent,
          userPrompt,
        );
      // 6. Save the generated inserat text to the database
      await this.saveListing({
        platform: 'Inserat',
        location: userData.location,
        generatedMessage: generatedMessage,
        description: enrichedPrompt,
        additionalData: userData,
        textType: 'Inserat',
        userId: userId,
      });

      return generatedMessage;
    } catch (error) {
      console.error('Error in generateInseratText:', error);
      throw new Error('Failed to generate inserat text');
    }
  }

  /**
   * Generate Text with a Link, Process User Data, and Save the Listing
   */
  async generateTextText(body: GenerateTextTextBody): Promise<string> {
    const { prompt, link, userId, packageId } = body;

    try {
      // 1. Extract updated user data from the prompt
      const userData = await this.chatGPTModel.extractUserData(prompt);

      // 2. Update and retrieve user context data
      await this.userContextService.createOrUpdateContext(userId, userData);

      // 3. Generate the system and user prompts with a link
      const { systemContent, userPrompt } = this.generatePromptWithLink(
        userData,
        packageId,
        link,
        prompt,
      );

      // 4. Generate text using ChatGPT
      const generatedMessage =
        await this.chatGPTModel.createChatCompletionWithSystem(
          systemContent,
          userPrompt,
        );

      // 5. Save the generated text to the database
      await this.saveListing({
        platform: 'Text Generation',
        generatedMessage: generatedMessage,
        link: link || '', // Sicherstellen, dass link einen gültigen Wert hat
        title: '', // Standardwert für title, wenn nicht benötigt
        description: prompt, // Prompt wird als description genutzt
        textType: 'Text',
        userId: userId,
        additionalData: userData || {}, // Sicherstellen, dass additionalData ein Objekt ist
      });

      return generatedMessage;
    } catch (error) {
      console.error('Error in generateTextText:', error);
      throw new Error('Failed to generate text');
    }
  }

  async generateResponseWithContext(body: { prompt: string; userId: string }) {
    const { prompt, userId } = body;

    const context = await this.userContextService.getContext(userId);
    const systemContent = `Context-based Response: ${JSON.stringify(context)}`;

    const response = await this.chatGPTModel.createChatCompletionWithSystem(
      systemContent,
      prompt,
    );
    return response;
  }

  async saveListing(data: {
    platform: string;
    location?: string;
    link?: string;
    title?: string;
    description?: string;
    generatedMessage: string;
    textType: string;
    userId: string;
    additionalData?: Record<string, any>;
  }): Promise<void> {
    const { userId, additionalData, ...listingData } = data;
    await this.listingsService.saveListingOrText({
      ...listingData,
      additionalData: additionalData,
      userId,
    });
  }

  private createEnrichedPrompt(
    prompt: string,
    userData: Record<string, any>,
  ): string {
    return `
      User Data: ${JSON.stringify(userData)}.
      Original Prompt: ${prompt}
    `;
  }

  generatePrompt(
    packageId: string,
    userInput: string,
  ): { systemContent: string; userPrompt: string } {
    let systemContent = '';
    let userPrompt = '';

    // Determine the system content and user-specific prompt based on the package type
    switch (packageId) {
      case 'business':
        systemContent = systemContentBusiness;
        userPrompt = `Professionelle Antwort: ${userInput}`;
        break;
      case 'student':
        systemContent = systemContentStudent;
        userPrompt = `Professionelle Antwort: ${userInput}`;
        break;
      case 'basic':
        systemContent = systemContentBasic;
        userPrompt = `Professionelle-Antwort: ${userInput}`;
        break;
      case 'free':
        systemContent = systemContentFree;
        userPrompt = `Professionelle Antwort: ${userInput}`;
        break;
      default:
        throw new HttpException(
          `Ungültiger Pakettyp: ${packageId}`,
          HttpStatus.BAD_REQUEST,
        );
    }

    return { systemContent, userPrompt };
  }

  generatePromptWithLink(
    userData: Record<string, any>,
    packageId: string,
    userInput: string,
    link: string,
  ): { systemContent: string; userPrompt: string } {
    let systemContent = '';
    let userPrompt = '';
    console.log(userData);

    const formattedUserData = `
    Budget: ${userData.budget ? `${userData.budget}€` : 'Keine Angabe'}
    Schlafzimmer: ${userData.bedrooms || 'Keine Angabe'}
    Eigenschaften: ${userData.features ? userData.features.join(', ') : 'Keine Angabe'}
    Haustiere erlaubt: ${userData.petsAllowed ? 'Ja' : 'Nein'}
    Möbliert: ${userData.furnished ? 'Ja' : 'Nein'}
    Frühester Einzug: ${userData.earliestMoveInDate || 'Keine Angabe'}
    Spätester Einzug: ${userData.latestMoveInDate || 'Keine Angabe'}
    Max. Entfernung: ${userData.maxDistance ? `${userData.maxDistance} km` : 'Keine Angabe'}
    Letzte Inserate seit: ${userData.recentListingsSince || 'Keine Angabe'}
    Tauschangebot: ${userData.swapOffer ? 'Ja' : 'Nein'}
    Küche enthalten: ${userData.kitchenIncluded ? 'Ja' : 'Nein'}
    Stockwerk: ${userData.floor || 'Keine Angabe'}
    Barrierefrei: ${userData.barrierFree ? 'Ja' : 'Nein'}
    Fotos vorhanden: ${userData.hasPhotos ? 'Ja' : 'Nein'}
    Garten: ${userData.garden ? 'Ja' : 'Nein'}
    Balkon: ${userData.balcony ? 'Ja' : 'Nein'}
    Online-Besichtigung möglich: ${userData.onlineViewing ? 'Ja' : 'Nein'}
    `;

    console.log(formattedUserData);

    // Systemcontent und User-Prompt basierend auf dem Pakettyp generieren
    switch (packageId) {
      case 'business':
        systemContent = `${systemContentBusiness}\nZusätzlicher Kontext-Link: ${link}\nNutzer-Daten:\n${formattedUserData}`;
        userPrompt = `Erstelle eine professionelle Nachricht an den Vermieter basierend auf den obigen Nutzerdaten und dem nutzer input: ${userInput}`;
        break;
      case 'student':
        systemContent = `${systemContentStudent}\nZusätzlicher Kontext-Link: ${link}\nNutzer-Daten:\n${formattedUserData}`;
        userPrompt = `Erstelle eine informelle Nachricht an den Vermieter basierend auf den obigen Nutzerdaten und dem nutzer input: ${userInput}`;
        break;
      case 'basic':
        systemContent = `${systemContentBasic}\nZusätzlicher Kontext-Link: ${link}\nNutzer-Daten:\n${formattedUserData}`;
        userPrompt = `Erstelle eine professionelle an den Vermieter basierend auf den obigen Nutzerdaten und dem nutzer input: ${userInput}`;
        break;
      case 'free':
        systemContent = `${systemContentFree}\nZusätzlicher Kontext-Link: ${link}\nNutzer-Daten:\n${formattedUserData}`;
        userPrompt = `Erstelle eine professionelle Nachricht an den Vermieter basierend auf den obigen Nutzerdaten und dem nutzer input: ${userInput}`;
        break;
      default:
        throw new HttpException(
          `Ungültiger Pakettyp: ${packageId}`,
          HttpStatus.BAD_REQUEST,
        );
    }

    return { systemContent, userPrompt };
  }
}
