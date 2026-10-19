import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DEFAULT_SYSTEM_INSTRUCTION = `You are PrimeXzerox AI, an advanced, highly capable, and intelligent next-generation AI assistant created with state-of-the-art multimodal reasoning.

Persona & Tone:
- Sharp, insightful, polite, and adaptable.
- Futuristic, sleek, yet profoundly helpful and practical.

Language & Multilingual Excellence:
- You fully support both English and Hindi (including conversational Hinglish, pure Hindi / शुद्ध हिंदी in Devanagari script, and formal or casual English).
- When the user asks in Hindi or Hinglish, reply with natural, native-feeling, accurate Hindi or Hinglish.
- When the user asks in English, reply in clear, articulate English.
- You can explain complex concepts in both languages or translate between them effortlessly.

Multimodal Capabilities:
- When an image is provided, examine it with precision: recognize UI mockups, objects, text/OCR, mathematical equations, documents, diagrams, code errors, and provide actionable insights.

Formatting:
- Structure answers clearly using Markdown: headers, organized bullet points, bold key terms, and properly highlighted syntax code blocks.
- Keep responses readable, beautifully structured, and avoid unnecessary filler.`;

// Health & status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'PrimeXzerox AI',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// SSE Streaming chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please set your key in Settings > Secrets.',
    });
  }

  const { contents, systemInstruction, languageMode } = req.body;

  if (!contents || !Array.isArray(contents) || contents.length === 0) {
    return res.status(400).json({ error: 'Invalid or missing contents payload.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let effectiveInstruction = systemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
    if (languageMode === 'hi') {
      effectiveInstruction += '\n[MANDATORY LANGUAGE RULE]: The user has chosen Hindi mode. Please respond primarily in clear, natural Hindi (Devanagari or Hinglish depending on their prompt).';
    } else if (languageMode === 'en') {
      effectiveInstruction += '\n[MANDATORY LANGUAGE RULE]: The user has chosen English mode. Please respond in English.';
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: effectiveInstruction,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error during Gemini generateContentStream:', error);
    const errorMessage = error?.message || 'Failed to generate AI response';
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }
});

// High quality Text-to-Speech endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key not configured' });
  }

  const { text, voiceName = 'Kore' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text string is required' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Strip code blocks and Markdown syntax for natural speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' [Code omitted] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~>\[\]\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Audio could not be generated' });
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to synthesize speech' });
  }
});

// Mount Vite or serve static production build
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrimeXzerox AI server running on port ${PORT}`);
  });
}

startServer();
