'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface QAWidgetProps {
  documentId: string;
}

interface QAHistory {
  question: string;
  answer: string;
  chunks: Array<{
    id: string;
    text: string;
    page?: number;
  }>;
  timestamp: Date;
}

export function QAWidget({ documentId }: QAWidgetProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QAHistory[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();
    console.log('Asking question:', currentQuestion, 'for document:', documentId);
    setLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          documentId,
        }),
      });

      console.log('Ask response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Ask API error:', error);
        throw new Error(error.error || 'Failed to get answer');
      }

      const result = await response.json();
      console.log('Ask result:', result);
      
      setHistory(prev => [{
        question: currentQuestion,
        answer: result.answer,
        chunks: result.chunks || [],
        timestamp: new Date(),
      }, ...prev]);

      setQuestion('');
      toast.success('Answer received!');
    } catch (error) {
      console.error('Error getting answer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get answer';
      toast.error('Failed to get answer: ' + errorMessage);
      
      setHistory(prev => [{
        question: currentQuestion,
        answer: `Error: ${errorMessage}. Please check your API configuration and try again.`,
        chunks: [],
        timestamp: new Date(),
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask Questions About Your PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this document?"
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !question.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Q&A History</h3>
          {history.map((item, index) => (
            <Card key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Question:</h4>
                    <p className="text-blue-800 bg-white p-3 rounded-md border border-blue-200">
                      {item.question}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Answer:</h4>
                    <div className="text-green-800 bg-white p-4 rounded-md border border-green-200 whitespace-pre-wrap">
                      {item.answer}
                    </div>
                  </div>

                  {item.chunks.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                        Relevant Context ({item.chunks.length} chunks):
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.chunks.map((chunk) => (
                          <Badge key={chunk.id} variant="secondary" className="text-xs">
                            {chunk.page && `Page ${chunk.page}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 text-right">
                    {item.timestamp.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {history.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Ask your first question about the PDF to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}