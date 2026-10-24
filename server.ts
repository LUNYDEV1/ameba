import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// AMEBA AI Proxy Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, model = 'ameba-1.2-flash', stream = false } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Messages array is required' });
    return;
  }

  const apiUrl = process.env.AMEBA_API_URL || 'https://chat.ameba.fun/v1/chat/completions';
  const apiKey = process.env.AMEBA_API_KEY || 'fade1dde8f221af5f6d183748a99a020873fd8c9880402f487222bffe09e2c9b';

  try {
    const upstreamResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
      }),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      console.error('AMEBA API upstream error:', upstreamResponse.status, errorText);
      res.status(upstreamResponse.status).json({ 
        error: `AMEBA API error: ${upstreamResponse.statusText}`,
        detail: errorText 
      });
      return;
    }

    if (stream && upstreamResponse.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstreamResponse.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
    } else {
      const data = await upstreamResponse.json();
      res.json(data);
    }
  } catch (error: unknown) {
    console.error('Server error forwarding to AMEBA API:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with AMEBA AI service',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AMEBA AI Gateway', model: 'AMEBA 1.2 FLASH' });
});

async function startServer() {
  const distIndexPath = path.resolve('dist', 'index.html');
  const hasDistBuild = fs.existsSync(distIndexPath);

  if (isProd && hasDistBuild) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(distIndexPath);
    });
  } else {
    // Vite middleware fallback for dev or when dist build is missing
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AMEBA AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
