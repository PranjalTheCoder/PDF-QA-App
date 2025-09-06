'use client';

import { useState } from 'react';
import { UploadZone } from '@/components/upload-zone';
import { QAWidget } from '@/components/qa-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Brain, Upload } from 'lucide-react';

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleUploadComplete = (docId: string) => {
    setDocumentId(docId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF Q&A Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload any PDF document and ask questions about its content. 
            Powered by Google Gemini AI for accurate, contextual answers.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {!documentId ? (
            <>
              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="text-center border-blue-200 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <Upload className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                    <CardTitle className="text-lg">Upload PDF</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Drag and drop or browse to upload your PDF document
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border-green-200 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <FileText className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <CardTitle className="text-lg">AI Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Advanced text extraction and vector embeddings
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border-purple-200 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <Brain className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                    <CardTitle className="text-lg">Smart Answers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Get accurate answers powered by Google Gemini
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Section */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">
                    Upload Your PDF Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UploadZone onUploadComplete={handleUploadComplete} />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Success State with Q&A */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-center text-xl text-green-800">
                    📄 PDF Successfully Processed!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-green-700 mb-4">
                    Your document has been analyzed and is ready for questions.
                  </p>
                  <button
                    onClick={() => setDocumentId(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Upload a different PDF
                  </button>
                </CardContent>
              </Card>

              {/* Q&A Widget */}
              <QAWidget documentId={documentId} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>Powered by Google Gemini AI • Built with Next.js, TypeScript & Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}