import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as pdf from 'pdf-parse';
import { generateEmbedding } from './gemini';

export interface DocumentChunk {
  id: string;
  text: string;
  embedding: number[];
  page?: number;
  documentId: string;
}

export interface ProcessedDocument {
  id: string;
  filename: string;
  chunks: DocumentChunk[];
  createdAt: string;
}

export async function processPDF(buffer: Buffer, filename: string): Promise<ProcessedDocument> {
  try {
    console.log('Processing PDF:', filename, 'Size:', buffer.length);
    
    // Extract text from PDF
    const data = await pdf(buffer);
    const text = data.text;
    
    console.log('Extracted text length:', text.length);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.createDocuments([text]);
    console.log('Created chunks:', chunks.length);
    const documentId = generateDocumentId(filename);

    // Process chunks with embeddings
    const processedChunks: DocumentChunk[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);
      const embedding = await generateEmbedding(chunk.pageContent);
      
      processedChunks.push({
        id: `${documentId}_chunk_${i}`,
        text: chunk.pageContent,
        embedding,
        page: i + 1,
        documentId
      });
    }

    console.log('PDF processing completed. Document ID:', documentId);
    
    return {
      id: documentId,
      filename,
      chunks: processedChunks,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateDocumentId(filename: string): string {
  const timestamp = Date.now();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanFilename}_${timestamp}`;
}