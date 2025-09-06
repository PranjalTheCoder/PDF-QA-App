import { NextRequest, NextResponse } from 'next/server';
import { processPDF } from '@/lib/pdf-processor';
import { saveDocument } from '@/lib/vector-store';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, file.type, file.size);

    if (!file.type.includes('pdf')) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 16 * 1024 * 1024) { // 16MB limit
      console.error('File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 16MB.' },
        { status: 400 }
      );
    }

    console.log('Converting file to buffer...');
    const buffer = Buffer.from(await file.arrayBuffer());
    
    console.log('Processing PDF...');
    // Process the PDF
    const document = await processPDF(buffer, file.name);
    
    console.log('Saving document to store...');
    // Save to vector store
    await saveDocument(document);

    console.log('Upload completed successfully');
    return NextResponse.json({
      success: true,
      documentId: document.id,
      chunksCount: document.chunks.length,
      message: 'PDF processed successfully'
    });

  } catch (error) {
    console.error('Error processing uploaded file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}