import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, generateAnswer } from '@/lib/gemini';
import { findSimilarChunks } from '@/lib/vector-store';

export async function POST(request: NextRequest) {
  try {
    const { question, documentId } = await request.json();
    
    console.log('Ask API called with:', { question: question?.substring(0, 50), documentId });
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY environment variable is not set. Please add your Gemini API key to .env.local' },
        { status: 500 }
      );
    }

    console.log('Generating embedding for question...');
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    
    console.log('Finding relevant chunks...');
    // Find relevant chunks
    const relevantChunks = await findSimilarChunks(
      questionEmbedding,
      documentId,
      5 // Top 5 most relevant chunks
    );

    console.log('Found', relevantChunks.length, 'relevant chunks');

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        answer: documentId 
          ? "I couldn't find any relevant information in the uploaded document to answer your question. The document may not contain content related to your query."
          : "No document found. Please upload a PDF first.",
        chunks: []
      });
    }

    // Combine relevant chunks into context
    const context = relevantChunks
      .map((chunk, index) => `[Context ${index + 1}]\n${chunk.text}`)
      .join('\n\n');

    console.log('Context length:', context.length);
    console.log('Calling Gemini API...');
    
    // Generate answer using Gemini
    const answer = await generateAnswer(context, question);

    console.log('Answer generated successfully');

    return NextResponse.json({
      answer,
      chunks: relevantChunks.map(chunk => ({
        id: chunk.id,
        text: chunk.text.substring(0, 200) + '...',
        page: chunk.page
      }))
    });

  } catch (error) {
    console.error('Error generating answer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate answer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}