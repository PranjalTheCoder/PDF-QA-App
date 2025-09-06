'use client';

import { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface UploadZoneProps {
  onUploadComplete: (documentId: string) => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    setUploading(true);
    setStatus('uploading');
    setProgress(0);
    setMessage('Uploading file...');

    try {
      // Upload using fallback endpoint (direct upload)
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);
      setMessage('Uploading PDF...');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress(60);

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        console.error('Upload error:', error);
        throw new Error(error.error || 'Upload failed');
      }

      const result = await uploadResponse.json();
      console.log('Upload result:', result);
      
      setProgress(100);
      setStatus('success');
      setMessage(`Successfully processed PDF with ${result.chunksCount} text chunks`);
      
      toast.success('PDF uploaded and processed successfully!');
      onUploadComplete(result.documentId);

    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Upload failed');
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading,
    maxSize: 16 * 1024 * 1024, // 16MB
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection) {
        const error = rejection.errors[0];
        if (error?.code === 'file-too-large') {
          toast.error('File too large. Maximum size is 16MB.');
        } else if (error?.code === 'file-invalid-type') {
          toast.error('Invalid file type. Only PDF files are allowed.');
        } else {
          toast.error('File rejected: ' + error?.message);
        }
      }
    }
  });

  const resetUpload = () => {
    setStatus('idle');
    setProgress(0);
    setMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (status === 'success') {
    return (
      <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">PDF Processed Successfully!</h3>
        <p className="text-green-600 mb-4">{message}</p>
        <Button onClick={resetUpload} variant="outline">
          Upload Another PDF
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="border-2 border-dashed border-red-300 rounded-lg p-8 text-center bg-red-50">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Upload Failed</h3>
        <Alert className="mb-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
        <Button onClick={resetUpload} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : uploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <FileText className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing PDF...</h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <Progress value={progress} className="w-full max-w-xs mx-auto" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {isDragActive ? 'Drop your PDF here' : 'Upload PDF Document'}
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              <Button variant="outline" disabled={uploading}>
                Select PDF File
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        Maximum file size: 16MB • Only PDF files are supported
      </div>
    </div>
  );
}