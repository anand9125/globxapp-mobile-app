/**
 * API client for GlobX backend.
 * Auth (login/register) uses AUTH_URL (Next.js app). Data APIs use API_URL (backend).
 */

const API_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "http://localhost:3030";
const AUTH_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_AUTH_URL) ||
  "http://localhost:3000";

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

/** Message thrown when device cannot reach server (e.g. localhost on Expo Go) */
export const NETWORK_ERROR_MESSAGE =
  "Network request failed. On Expo Go with a physical device, use your computer's LAN IP in apps/mobile/.env (EXPO_PUBLIC_AUTH_URL and EXPO_PUBLIC_API_URL), then restart Expo.";

function isNetworkFailure(e: unknown): boolean {
  if (e instanceof TypeError)
    return (
      e.message === "Network request failed" ||
      e.message === "Failed to fetch" ||
      e.message?.includes("Network request failed")
    );
  return false;
}

async function fetchApi<T>(baseUrl: string, endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch (e) {
    if (isNetworkFailure(e)) throw new Error(NETWORK_ERROR_MESSAGE);
    throw e;
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: "UNKNOWN_ERROR",
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || "An error occurred");
  }

  return response.json();
}

export async function fetchWithAuth<T>(
  endpoint: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  return fetchApi<T>(API_BASE, endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}

// --- Auth (use Next.js app URL) ---
export async function login(email: string, password: string): Promise<{ token: string }> {
  return fetchApi<{ token: string }>(AUTH_BASE, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  name?: string;
  email: string;
  password: string;
}): Promise<{ message: string; userId: string }> {
  return fetchApi<{ message: string; userId: string }>(AUTH_BASE, "/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Portfolio ---
export async function getPortfolio(
  userId: string,
  token: string
): Promise<{
  userId: string;
  balances: Array<{ tokenMint: string; amount: string; updatedAt: string }>;
}> {
  return fetchWithAuth(`/v1/users/${userId}/portfolio`, token);
}

// --- Trading ---
export async function getTradeQuote(
  token: string,
  params: {
    inputTokenMint: string;
    outputTokenMint: string;
    amount: string;
    slippageBps?: number;
  }
) {
  const searchParams = new URLSearchParams({
    inputTokenMint: params.inputTokenMint,
    outputTokenMint: params.outputTokenMint,
    amount: params.amount,
    slippageBps: String(params.slippageBps ?? 50),
  });
  return fetchWithAuth<{
    inputMint: string;
    outputMint: string;
    inAmount: number;
    outAmount: number;
    otherAmountThreshold: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: unknown[];
  }>(`/v1/trades/quote?${searchParams}`, token);
}

export async function executeTrade(
  token: string,
  data: {
    direction: "BUY" | "SELL";
    inputTokenMint: string;
    inputAmount: string;
    outputTokenMint: string;
    slippageBps: number;
    routeType: "jupiter";
  }
) {
  return fetchWithAuth<{
    tradeId: string;
    direction: string;
    status: string;
    message: string;
  }>(`/v1/trades/execute`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRecentTrades(
  _token: string | null,
  params?: { tokenMint?: string; limit?: number }
) {
  const searchParams = new URLSearchParams();
  if (params?.tokenMint) searchParams.set("tokenMint", params.tokenMint);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const q = searchParams.toString();
  return fetchApi<{
    trades: Array<{
      id: string;
      direction: string;
      inputTokenMint: string;
      inputAmount: string;
      outputTokenMint: string;
      outputAmount: string;
      priceUsd: string | null;
      status: string;
      createdAt: string;
      executedAt: string | null;
    }>;
  }>(API_BASE, `/v1/trades/recent${q ? `?${q}` : ""}`);
}

export async function getUserTrades(
  userId: string,
  token: string,
  params?: { limit?: number; offset?: number; tokenMint?: string }
) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  if (params?.tokenMint) searchParams.set("tokenMint", params.tokenMint);
  const q = searchParams.toString();
  return fetchWithAuth<{
    trades: Array<{
      id: string;
      direction: string;
      inputTokenMint: string;
      inputAmount: string;
      outputTokenMint: string;
      outputAmount: string;
      priceUsd: string | null;
      status: string;
      createdAt: string;
      executedAt: string | null;
    }>;
    pagination: { limit: number; offset: number; total: number };
  }>(`/v1/users/${userId}/trades${q ? `?${q}` : ""}`, token);
}

// --- Deposit ---
export async function prepareDeposit(
  token: string,
  data: { tokenMint: string; amount: string; userSourceAccount?: string }
) {
  return fetchWithAuth<{
    depositId: string;
    depositIdHex: string;
    tokenMint: string;
    amount: string;
    status: string;
    depositVaultAddress: string;
    vaultTokenAccountAddress: string;
    transactionBase64?: string;
  }>(`/v1/deposits/prepare`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitDeposit(token: string, data: { depositId: string; txSignature: string }) {
  return fetchWithAuth<{ depositId: string; status: string; message: string }>(
    `/v1/deposits/submit`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

// --- Withdrawal ---
export async function requestWithdrawal(
  token: string,
  data: { tokenMint: string; amount: string; destinationAddress: string }
) {
  return fetchWithAuth<{ withdrawalId: string; status: string; message: string }>(
    `/v1/withdrawals/request`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

// --- Price (1 unit quote for current price) ---
export async function getTokenPrice(
  token: string,
  params: { inputTokenMint: string; outputTokenMint: string }
) {
  const inputDecimals = params.inputTokenMint === "So11111111111111111111111111111111111111112" ? 9 : 6;
  const amount = Math.pow(10, inputDecimals).toString();
  const quote = await getTradeQuote(token, {
    ...params,
    amount,
    slippageBps: 50,
  });
  const outputDecimals = params.outputTokenMint === "So11111111111111111111111111111111111111112" ? 9 : 6;
  const inputAmount = parseFloat(amount) / Math.pow(10, inputDecimals);
  const outputAmount = quote.outAmount / Math.pow(10, outputDecimals);
  return {
    price: outputAmount / inputAmount,
    inputMint: params.inputTokenMint,
    outputMint: params.outputTokenMint,
    timestamp: Date.now(),
  };
}

// --- Ledger ---
export async function getLedger(
  userId: string,
  token: string,
  params?: { limit?: number; offset?: number }
) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const q = searchParams.toString();
  return fetchWithAuth<{
    userId: string;
    entries: Array<{
      id: string;
      entryType: string;
      transactionId: string;
      accountType: string;
      tokenMint: string | null;
      amount: string;
      side: string;
      description: string | null;
      createdAt: string;
    }>;
    pagination: { limit: number; offset: number; total: number };
  }>(`/v1/users/${userId}/ledger${q ? `?${q}` : ""}`, token);
}
