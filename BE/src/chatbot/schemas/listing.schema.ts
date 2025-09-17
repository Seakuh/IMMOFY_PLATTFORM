import { z } from 'zod';

export const ListingSchema = z.object({
  platform: z.string().nullable(), // Plattformname (z. B. "Immobilienscout24")
  title: z.string().nullable(), // Titel des Inserats
  description: z.string().nullable(), // Beschreibung des Inserats
  landlordName: z.string().nullable(), // Name des Vermieters
  landlordEmail: z.string().nullable(), // Kontakt-E-Mail des Vermieters
});
