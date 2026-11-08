export const DEFAULT_CLOUDFLARE_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';

type CloudflareChatMessage = {
  role: 'system' | 'user';
  content: string;
};

type CloudflareChatOptions = {
  temperature: number;
  max_tokens?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function errorMessage(result: unknown): string {
  if (!isRecord(result)) return '';
  if (isRecord(result.error) && typeof result.error.message === 'string') {
    return result.error.message;
  }
  if (
    Array.isArray(result.errors)
    && isRecord(result.errors[0])
    && typeof result.errors[0].message === 'string'
  ) {
    return result.errors[0].message;
  }
  return '';
}

async function postChatCompletion(
  accountId: string,
  apiToken: string,
  model: string,
  messages: CloudflareChatMessage[],
  options: CloudflareChatOptions,
  timeoutMs: number,
): Promise<{ response: Response; result: unknown }> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, ...options }),
      signal: AbortSignal.timeout(timeoutMs),
    },
  );
  const result: unknown = await response.json().catch(() => null);
  return { response, result };
}

export async function requestCloudflareChatCompletion(
  accountId: string,
  apiToken: string,
  messages: CloudflareChatMessage[],
  options: CloudflareChatOptions,
  timeoutMs = 55_000,
): Promise<{ response: Response; result: unknown }> {
  const configuredModel = process.env.CLOUDFLARE_MODEL || DEFAULT_CLOUDFLARE_MODEL;
  const firstAttempt = await postChatCompletion(
    accountId,
    apiToken,
    configuredModel,
    messages,
    options,
    timeoutMs,
  );
  const deprecatedModel = /model.{0,30}deprecated|deprecated.{0,30}model/i
    .test(errorMessage(firstAttempt.result));

  if (!firstAttempt.response.ok && deprecatedModel && configuredModel !== DEFAULT_CLOUDFLARE_MODEL) {
    return postChatCompletion(
      accountId,
      apiToken,
      DEFAULT_CLOUDFLARE_MODEL,
      messages,
      options,
      timeoutMs,
    );
  }

  return firstAttempt;
}
