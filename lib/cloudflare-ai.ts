export const DEFAULT_CLOUDFLARE_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';

type CloudflareChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

type CloudflareChatMessage = {
  role: 'system' | 'user';
  content: string | CloudflareChatContentPart[];
};

type CloudflareChatOptions = {
  temperature: number;
  max_tokens?: number;
};

export type CloudflareAccountCredential = {
  accountId: string;
  apiToken: string;
  key: string;
};

type CloudflareAccountConfiguration = {
  accounts: CloudflareAccountCredential[];
  error?: string;
};

function parseEnvironmentList(value: string | undefined, variableName: string): string[] {
  if (!value?.trim()) return [];
  const entries = value.split(/[,\n;]/).map((entry) => entry.trim());
  if (entries.some((entry) => !entry)) {
    throw new Error(`${variableName} contains an empty entry.`);
  }
  return entries;
}

export function getCloudflareAccounts(): CloudflareAccountConfiguration {
  try {
    const accountIds = parseEnvironmentList(process.env.CLOUDFLARE_ACCOUNT_IDS, 'CLOUDFLARE_ACCOUNT_IDS');
    const apiTokens = parseEnvironmentList(process.env.CLOUDFLARE_API_TOKENS, 'CLOUDFLARE_API_TOKENS');
    const singleAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || '';
    const singleApiToken = process.env.CLOUDFLARE_API_TOKEN?.trim() || '';

    if (accountIds.length && apiTokens.length && accountIds.length !== apiTokens.length) {
      return {
        accounts: [],
        error: 'CLOUDFLARE_ACCOUNT_IDS and CLOUDFLARE_API_TOKENS must contain the same number of entries.',
      };
    }

    const resolvedAccountIds = accountIds.length
      ? accountIds
      : apiTokens.length
        ? Array(apiTokens.length).fill(singleAccountId)
        : singleAccountId
          ? [singleAccountId]
          : [];
    const resolvedApiTokens = apiTokens.length
      ? apiTokens
      : resolvedAccountIds.map(() => singleApiToken);

    const accounts = resolvedAccountIds.flatMap((accountId, index) => {
      const apiToken = resolvedApiTokens[index] || '';
      if (!accountId || !apiToken) return [];
      return [{
        accountId,
        apiToken,
        key: JSON.stringify([accountId, apiToken]),
      }];
    });

    return { accounts };
  } catch (error) {
    return {
      accounts: [],
      error: error instanceof Error ? error.message : 'Cloudflare account configuration is invalid.',
    };
  }
}

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
  modelOverride?: string,
): Promise<{ response: Response; result: unknown }> {
  const configuredModel = modelOverride || process.env.CLOUDFLARE_MODEL || DEFAULT_CLOUDFLARE_MODEL;
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
