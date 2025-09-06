import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingModel = genAI.getGenerativeModel({
    model: "embedding-001",
  });
  const embedding = await embeddingModel.embedContent(text);
  return embedding.embedding.values;
}

export async function generateAnswer(
  context: string,
  question: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    safetySettings,
  });

  const prompt = `
    You are a helpful AI assistant that answers questions based on the provided context.
    Context:
    ${context}

    Question:
    ${question}

    Answer:
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
