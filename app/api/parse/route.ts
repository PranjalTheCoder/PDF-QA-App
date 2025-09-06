import { NextRequest, NextResponse } from 'next/server';
import { processPDF } from '@/lib/pdf-processor';
import { saveDocument } from '@/lib/vector-store';

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileName } = await request.json();
    
    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'Missing fileUrl or fileName' },
        { status: 400 }
      );
    }

    // Download the PDF file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Process the PDF
    const document = await processPDF(buffer, fileName);
    
    // Save to vector store
    await saveDocument(document);

    return NextResponse.json({
      success: true,
      documentId: document.id,
      chunksCount: document.chunks.length,
      message: 'PDF processed successfully'
    });

  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}