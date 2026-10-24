export interface AmebaChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendChatMessageToAmeba(
  messages: AmebaChatMessage[],
  systemPrompt?: string,
  model: string = 'ameba-1.2-flash',
  onTokenChunk?: (accumulated: string, delta: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const preparedMessages: AmebaChatMessage[] = [];

  if (systemPrompt && systemPrompt.trim()) {
    preparedMessages.push({
      role: 'system',
      content: systemPrompt.trim(),
    });
  }

  // Include recent conversation messages (up to 20 for efficient context)
  const recent = messages.slice(-20);
  preparedMessages.push(...recent);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: preparedMessages,
        model,
        stream: false, // ameba endpoint returns full JSON completion directly
      }),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    const fullText = data.choices?.[0]?.message?.content || data.reply || '';

    if (!fullText) {
      throw new Error('Empty response received from AMEBA AI');
    }

    // Stream out the received tokens smoothly to the UI for fluid reading experience
    if (onTokenChunk) {
      let accumulated = '';
      const chunkSize = 3;
      for (let i = 0; i < fullText.length; i += chunkSize) {
        if (signal?.aborted) break;
        const delta = fullText.slice(i, i + chunkSize);
        accumulated += delta;
        onTokenChunk(accumulated, delta);
        // Micro-delay between tokens
        await new Promise((r) => setTimeout(r, 10));
      }
      return accumulated;
    }

    return fullText;
  } catch (err: unknown) {
    if (signal?.aborted) {
      throw new Error('Generation stopped by user');
    }
    console.error('Error contacting AMEBA API:', err);
    throw err;
  }
}
