export type DeepSeekStreamEvent =
  | { type: "content"; content: string }
  | { type: "reasoning"; content: string }
  | { type: "error"; error: string }
  | { type: "done" };

export function streamDeepSeek(options: {
  endpoint?: string;
  messages: Array<{ role: string; content: string }>;
  model?: string;
  signal?: AbortSignal;
  onEvent: (event: DeepSeekStreamEvent) => void;
}): Promise<void>;
