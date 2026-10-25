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

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// YANDEX SEARCH API IMPLEMENTATION (Yandex Cloud Search XML API)
async function searchYandexApi(query: string, folderId: string, apiKey: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://yandex.ru/search/xml?folderid=${folderId}&apikey=${apiKey}&query=${encodeURIComponent(query)}&l10n=ru&sortby=rlv&filter=none`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.warn('Yandex Search API status:', response.status);
      return [];
    }

    const xmlText = await response.text();
    const results: SearchResult[] = [];

    const docRegex = /<doc[\s\S]*?<\/doc>/g;
    let docMatch;
    while ((docMatch = docRegex.exec(xmlText)) !== null && results.length < 5) {
      const docXml = docMatch[0];

      const urlMatch = docXml.match(/<url>([\s\S]*?)<\/url>/);
      const titleMatch = docXml.match(/<title[\s\S]*?>([\s\S]*?)<\/title>/);
      const passageMatch = docXml.match(/<passage[\s\S]*?>([\s\S]*?)<\/passage>/) || docXml.match(/<headline[\s\S]*?>([\s\S]*?)<\/headline>/);

      const rawUrl = urlMatch ? urlMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const rawSnippet = passageMatch ? passageMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      if (rawUrl && rawTitle) {
        results.push({
          title: rawTitle,
          url: rawUrl,
          snippet: rawSnippet,
        });
      }
    }

    return results;
  } catch (err) {
    console.warn('Yandex Search API error:', err);
    return [];
  }
}

// Fallback Live Web Search implementation using DuckDuckGo Live HTML endpoint
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const results: SearchResult[] = [];

    const linkRegex = /<a class="result__url" href="([^"]+)">/g;
    const titleRegex = /<a class="result__a"[^>]*>([\s\S]*?)<\/a>/g;
    const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

    const urls: string[] = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null && urls.length < 5) {
      let rawUrl = match[1].trim();
      if (rawUrl.includes('uddg=')) {
        try {
          const u = new URL('https://duckduckgo.com' + rawUrl);
          rawUrl = decodeURIComponent(u.searchParams.get('uddg') || rawUrl);
        } catch {
          // ignore url parse error
        }
      }
      if (!rawUrl.startsWith('http')) {
        rawUrl = 'https://' + rawUrl;
      }
      urls.push(rawUrl);
    }

    const titles: string[] = [];
    while ((match = titleRegex.exec(html)) !== null && titles.length < 5) {
      const cleanTitle = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      titles.push(cleanTitle);
    }

    const snippets: string[] = [];
    while ((match = snippetRegex.exec(html)) !== null && snippets.length < 5) {
      const cleanSnippet = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      snippets.push(cleanSnippet);
    }

    for (let i = 0; i < Math.min(urls.length, titles.length); i++) {
      if (urls[i] && titles[i]) {
        results.push({
          title: titles[i],
          url: urls[i],
          snippet: snippets[i] || '',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error executing web search:', error);
    return [];
  }
}

// REAL Web Search Manager: Prefers Yandex Search API if configured, else DDG fallback
async function performRealWebSearch(query: string): Promise<SearchResult[]> {
  const yandexApiKey = process.env.YANDEX_SEARCH_API_KEY;
  const yandexFolderId = process.env.YANDEX_FOLDER_ID;

  if (yandexApiKey && yandexFolderId) {
    console.log('Searching via Yandex Search API for:', query);
    const yandexResults = await searchYandexApi(query, yandexFolderId, yandexApiKey);
    if (yandexResults.length > 0) {
      return yandexResults;
    }
  }

  console.log('Searching via DDG Fallback for:', query);
  return searchDuckDuckGo(query);
}

// AMEBA AI Proxy Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { 
    messages, 
    model = 'ameba-1.2-flash', 
    stream = false,
    webSearch = false,
    thinkingMode = true
  } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Messages array is required' });
    return;
  }

  const apiUrl = process.env.AMEBA_API_URL || 'https://chat.ameba.fun/v1/chat/completions';
  const apiKey = process.env.AMEBA_API_KEY || 'fade1dde8f221af5f6d183748a99a020873fd8c9880402f487222bffe09e2c9b';

  let processedMessages = [...messages];
  let searchSources: SearchResult[] = [];

  // Real Web Search Grounding
  if (webSearch) {
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    if (lastUserMsg && lastUserMsg.content) {
      console.log('Executing live web search for:', lastUserMsg.content);
      searchSources = await performRealWebSearch(lastUserMsg.content);
      
      if (searchSources.length > 0) {
        const searchContextPrompt = `[РЕАЛЬНЫЕ РЕЗУЛЬТАТЫ ПОИСКА В СЕТИ (ЖИВОЙ ВЕБ)]\n` +
          searchSources.map((s, idx) => `[${idx + 1}] "${s.title}"\nURL: ${s.url}\nФрагмент: ${s.snippet}\n`).join('\n') +
          `\n[ИНСТРУКЦИЯ ДЛЯ AMEBA]: Используй вышеуказанную свежую информацию из сети для построения ответа. Приводи ссылки на источники в формате Markdown: [Название источника](URL).`;

        const updatedLastUserMsg = {
          ...lastUserMsg,
          content: `${lastUserMsg.content}\n\n${searchContextPrompt}`,
        };
        processedMessages = processedMessages.map(m => m === lastUserMsg ? updatedLastUserMsg : m);
      }
    }
  }

  // Real Thinking Mode System Prompt Instruction (DeepSeek-R1 Pattern)
  if (thinkingMode) {
    const thinkingInstruction = {
      role: 'system',
      content: `[РЕЖИМ ГЛУБОКОГО РАЗМЫШЛЕНИЯ (DEEPSEEK R1 THINKING MODE)]: Ты — мыслящий ИИ. Перед вынесением финального ответа ты ОБЯЗАН провести подробный, пошаговый разбор задачи, проанализировать суть вопроса, взвесить гипотезы и составить план.
Оберни ВЕСЬ процесс своих подробных мыслей в тег <think>...</think> перед окончательным ответом.
Пример структуры ответа:
<think>
1. Понимание вопроса: ...
2. Разбор ключевых аспектов и принципов: ...
3. Проверка логических выводов: ...
</think>
Итоговый структурированный ответ...`,
    };
    processedMessages = [thinkingInstruction, ...processedMessages];
  }

  // Mandatory Code Block Formatting Instruction
  const codeFormattingInstruction = {
    role: 'system',
    content: `[ОБЯЗАТЕЛЬНОЕ ПРАВИЛО ОФОРМЛЕНИЯ КОДА]:
Всегда выделяй любые фрагменты кода, программы, скрипты, команды и примеры кода исключительно в стандартные Markdown блоки с тройными кавычками и указанием названия языка!
Пример:
\`\`\`csharp
Console.WriteLine("Привет, мир!");
\`\`\`
Никогда не пиши код просто строкой без блоков \`\`\`.`,
  };
  processedMessages = [codeFormattingInstruction, ...processedMessages];

  try {
    // Upstream API completions fetch
    const upstreamResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: processedMessages,
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

    const data: any = await upstreamResponse.json();
    const fullText: string = data.choices?.[0]?.message?.content || data.reply || '';

    if (!fullText) {
      res.status(500).json({ error: 'Empty response received from AMEBA AI' });
      return;
    }

    // Stream SSE back to client token by token
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (searchSources.length > 0) {
        res.write(`data: ${JSON.stringify({ sources: searchSources })}\n\n`);
      }

      const chunkSize = 3;
      for (let i = 0; i < fullText.length; i += chunkSize) {
        const chunk = fullText.slice(i, i + chunkSize);
        const sseFrame = {
          choices: [
            {
              delta: {
                content: chunk,
              },
            },
          ],
        };
        res.write(`data: ${JSON.stringify(sseFrame)}\n\n`);
        await new Promise((r) => setTimeout(r, 12));
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      if (searchSources.length > 0) {
        data.sources = searchSources;
      }
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
