import fs from 'fs/promises';
import path from 'path';
import { ProcessedDocument, DocumentChunk } from './pdf-processor';

// Simple cosine similarity implementation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json');

export interface VectorStore {
  documents: ProcessedDocument[];
}

export async function ensureStoreExists(): Promise<void> {
  try {
    const dataDir = path.dirname(STORE_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    try {
      await fs.access(STORE_PATH);
      console.log('Store file exists at:', STORE_PATH);
    } catch {
      // File doesn't exist, create it
      console.log('Creating new store file at:', STORE_PATH);
      const initialStore: VectorStore = { documents: [] };
      await fs.writeFile(STORE_PATH, JSON.stringify(initialStore, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring store exists:', error);
    throw new Error('Failed to initialize vector store');
  }
}

export async function saveDocument(document: ProcessedDocument): Promise<void> {
  try {
    console.log('Saving document:', document.id);
    await ensureStoreExists();
    const store = await loadStore();
    
    // Remove existing document with same ID
    store.documents = store.documents.filter(doc => doc.id !== document.id);
    
    // Add new document
    store.documents.push(document);
    
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
    console.log('Document saved successfully. Total documents:', store.documents.length);
  } catch (error) {
    console.error('Error saving document:', error);
    throw new Error('Failed to save document to store');
  }
}

export async function loadStore(): Promise<VectorStore> {
  try {
    await ensureStoreExists();
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    const store = JSON.parse(data);
    console.log('Loaded store with', store.documents?.length || 0, 'documents');
    return store;
  } catch (error) {
    console.error('Error loading store:', error);
    return { documents: [] };
  }
}

export async function findSimilarChunks(
  queryEmbedding: number[],
  documentId?: string,
  topK: number = 5
): Promise<DocumentChunk[]> {
  try {
    console.log('Finding similar chunks for document:', documentId);
    const store = await loadStore();
    let allChunks: DocumentChunk[] = [];
    
    if (documentId) {
      const document = store.documents.find(doc => doc.id === documentId);
      if (document) {
        allChunks = document.chunks;
        console.warn('Document not found:', documentId);
        console.log('Found document with', allChunks.length, 'chunks');
      }
    } else {
      allChunks = store.documents.flatMap(doc => doc.chunks);
      console.log('Using all chunks:', allChunks.length);
    }

    if (allChunks.length === 0) {
      console.warn('No chunks found');
      return [];
    }

    // Calculate similarities
    const similarities = allChunks.map(chunk => ({
      chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Sort by similarity and return top K
    const topChunks = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.chunk);
      
    console.log('Returning top', topChunks.length, 'similar chunks');
    return topChunks;
  } catch (error) {
    console.error('Error finding similar chunks:', error);
    return [];
  }
}

export async function getDocuments(): Promise<ProcessedDocument[]> {
  try {
    const store = await loadStore();
    return store.documents;
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
}