<<<<<<< HEAD
# PDF-QA-App
=======
# PDF Q&A App with Gemini API

A modern Next.js application that allows users to upload PDF documents and ask questions about their content using Google's Gemini AI.

## Features

- 📄 PDF upload with drag-and-drop interface
- 🤖 AI-powered question answering using Google Gemini
- 🔍 Vector-based semantic search for accurate responses
- 💾 Lightweight JSON storage for demo purposes
- 📱 Fully responsive design
- ⚡ Real-time Q&A interface

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

**Required API Keys:**
- **Google Gemini API**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **UploadThing** (Optional): Sign up at [UploadThing](https://uploadthing.com) and create an app

**Note**: The app includes a fallback upload mechanism, so UploadThing keys are optional for local development.

### 3. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

1. **Upload PDF**: Drag and drop or click to select a PDF file
2. **Wait for Processing**: The app will extract text and generate embeddings
3. **Ask Questions**: Type questions about the PDF content
4. **Get AI Answers**: Receive contextual answers powered by Gemini

## Troubleshooting

### Upload Issues
- **File not uploading**: Check browser console for errors. Ensure file is a valid PDF under 16MB.
- **Processing fails**: Check server logs (`npm run dev` terminal) for detailed error messages.
- **"No file provided" error**: Try refreshing the page and uploading again.

### Q&A Issues
- **No response from questions**: 
  1. Ensure `GOOGLE_API_KEY` is set in `.env.local`
  2. Check server logs for API errors
  3. Verify the PDF was processed successfully (should show success message)
- **"Document not found" error**: Re-upload the PDF file
- **Generic API errors**: Check your Gemini API key is valid and has sufficient quota

### Environment Setup
- **Missing API key errors**: 
  1. Copy `.env.example` to `.env.local`
  2. Add your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  3. Restart the development server (`npm run dev`)

### Common Error Messages
- `GOOGLE_API_KEY environment variable is not set`: Add your API key to `.env.local`
- `Failed to process PDF`: Check if the PDF contains readable text (scanned images won't work)
- `No text content found in PDF`: The PDF may be image-based or corrupted
- `File too large`: Reduce file size to under 16MB

### Debug Mode
Enable detailed logging by checking the browser console and server terminal for error messages. All API calls are logged for debugging.

## Architecture

- **Frontend**: Next.js 13+ with App Router
- **File Upload**: UploadThing with fallback to local upload
- **PDF Processing**: LangChain PDFLoader
- **Text Chunking**: RecursiveCharacterTextSplitter
- **Embeddings**: Google Gemini Embedding API
- **Storage**: JSON file storage (production: use database)
- **AI Model**: Google Gemini Pro

## API Endpoints

- `POST /api/parse` - Process uploaded PDF
- `POST /api/ask` - Handle Q&A requests
- `POST /api/upload` - Fallback upload endpoint

## Development Notes

- The app uses a simple JSON file for storage (`data/store.json`)
- For production, consider implementing proper database storage
- Vector similarity uses cosine similarity for chunk retrieval
- Error handling includes graceful fallbacks and user feedback
>>>>>>> 51db8c5 (Initial Commit)
