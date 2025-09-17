import { z } from 'zod';

export const UserContextSchema = z.object({
  location: z.string().nullable(), // Stadt oder Umkreis
  budget: z.number().nullable(), // Maximale Miete
  bedrooms: z.number().nullable(), // Anzahl der Schlafzimmer
  features: z.array(z.string()).nullable(), // Zusätzliche Merkmale wie Balkon, Garten etc.
  petsAllowed: z.boolean().nullable(), // Haustiere erlaubt
  furnished: z.boolean().nullable(), // Möbliert
  earliestMoveInDate: z.string().nullable(), // Frühestes Einzugsdatum (ISO-Format)
  latestMoveInDate: z.string().nullable(), // Spätestes Einzugsdatum (ISO-Format)
  districts: z.array(z.string()).nullable(), // Stadtteile
  address: z.string().nullable(), // Adresse
  maxDistance: z.number().nullable(), // Maximale Entfernung in km
  recentListingsSince: z.string().nullable(), // Neue Angebote seit (ISO-Format)
  swapOffer: z.boolean().nullable(), // Tauschangebot
  kitchenIncluded: z.boolean().nullable(), // Küche vorhanden
  floor: z.string().nullable(), // Gewünschte Etage (z.B. "EG", "1. OG")
  barrierFree: z.boolean().nullable(), // Barrierefrei
  hasPhotos: z.boolean().nullable(), // Nur Angebote mit Fotos
  garden: z.boolean().nullable(), // Garten vorhanden
  balcony: z.boolean().nullable(), // Balkon oder Terrasse
  onlineViewing: z.boolean().nullable(), // Online-Besichtigung möglich
});
