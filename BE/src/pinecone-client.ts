import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey:
    'pcsk_6bnPc3_28tRc3DD82DwNG5gjijYNG8iG1Uy7uaEpvxjEvau6xRHQShzizFeZbbT5scLZXU',
});

export const pineconeClient = pinecone;
