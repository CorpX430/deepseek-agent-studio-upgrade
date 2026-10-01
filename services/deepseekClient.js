/**
 * Browser-safe client for the server-side DeepSeek streaming routes.
 * The API key never reaches this module or the browser.
 */
export async function streamDeepSeek({ endpoint = "/api/chat", messages, model, signal, onEvent }) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model }),
    signal,
  });

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Unable to reach DeepSeek");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const chunk of events) {
        if (!chunk.startsWith("data: ")) continue;
        onEvent(JSON.parse(chunk.slice(6)));
      }
    }
  } finally {
    reader.releaseLock();
  }
}
