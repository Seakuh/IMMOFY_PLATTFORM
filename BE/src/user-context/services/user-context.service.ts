import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContext } from '../entities/user-context.entity';

@Injectable()
export class UserContextService {
  constructor(
    @InjectRepository(UserContext)
    private readonly userContextRepository: Repository<UserContext>,
  ) {}

  async createContext(userId: string, contextData: Record<string, any>) {
    const userContext = this.userContextRepository.create({
      user: { id: userId },
      contextData,
    });

    return await this.userContextRepository.save(userContext);
  }

  async saveContext(userId: string, contextData: Record<string, any>) {
    // Abrufen des aktuellen Kontextes, falls vorhanden
    const existingContext = await this.userContextRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    let updatedContextData = contextData;

    if (existingContext) {
      // Kombination der bestehenden Daten mit den neuen, ohne `null`- oder `undefined`-Werte zu überschreiben
      updatedContextData = {
        ...existingContext.contextData,
        ...Object.fromEntries(
          Object.entries(contextData).filter(
            ([_, value]) => value !== null && value !== undefined,
          ),
        ),
      };
    }

    // Erstellen oder Aktualisieren des Kontexts
    const userContext = this.userContextRepository.create({
      user: { id: userId },
      contextData: updatedContextData,
    });

    return await this.userContextRepository.save(userContext);
  }

  async createOrUpdateContext(
    userId: string,
    contextData: Record<string, any>,
  ): Promise<any> {
    // Versuche, den existierenden Kontext zu finden
    const existingContext = await this.userContextRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (existingContext) {
      // Aktualisiere nur die neuen Werte, ohne vorhandene Daten zu überschreiben
      existingContext.contextData = {
        ...existingContext.contextData,
        ...Object.fromEntries(
          Object.entries(contextData).filter(
            ([_, value]) => value !== null && value !== undefined,
          ),
        ),
      };

      // Speichere die Änderungen
      return await this.userContextRepository.save(existingContext);
    }

    // Falls kein Kontext existiert, erstelle einen neuen
    const newContext = this.userContextRepository.create({
      user: { id: userId },
      contextData,
    });

    return await this.userContextRepository.save(newContext);
  }
  async getContext(userId: string) {
    const contexts = await this.userContextRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' }, // Alle Einträge in chronologischer Reihenfolge
    });

    if (!contexts) {
      throw new NotFoundException(`Context for user ${userId} not found`);
    }

    return contexts.reduce((acc, entry) => {
      return { ...acc, ...entry.contextData };
    }, {});
  }

  async getUserContext(userId: string) {
    const context = await this.userContextRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }, // Hole den neuesten Kontext
    });
    return context ? context.contextData : null; // Gib die Kontextdaten zurück
  }

  async updateField(userId: string, field: string, value: any) {
    const userContext = await this.userContextRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (!userContext) {
      throw new NotFoundException(`Context for user ${userId} not found`);
    }

    // Aktualisiere das spezifische Feld
    userContext.contextData[field] = value;

    // Speichere die Änderungen
    return await this.userContextRepository.save(userContext);
  }

  async getContextHistory(userId: string): Promise<UserContext[]> {
    return await this.userContextRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });
  }
}
