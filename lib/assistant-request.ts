import { sanitizeAssistantHistory, type AssistantTurn } from './cloudy-chat-context';

/** Bound transport history without shortening the messages shown in the chat. */
export function buildAssistantRequest(question: string, history: AssistantTurn[]): string {
  const payload = { question, history: sanitizeAssistantHistory(history) };
  let body = JSON.stringify(payload);
  while (body.length > 8_000 && payload.history.length) {
    payload.history.shift();
    body = JSON.stringify(payload);
  }
  return body;
}
