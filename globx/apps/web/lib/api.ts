const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

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
  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}

// Portfolio API
export async function getPortfolio(userId: string, token: string) {
  return fetchWithAuth<{
    userId: string;
    balances: Array<{
      tokenMint: string;
      amount: string;
      updatedAt: string;
    }>;
  }>(`/v1/users/${userId}/portfolio`, token);
}

// Trading API
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
    slippageBps: String(params.slippageBps || 50),
  });
  return fetchWithAuth<{
    inputMint: string;
    outputMint: string;
    inAmount: number;
    outAmount: number;
    otherAmountThreshold: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: Array<unknown>;
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

// Price API - Get current price for a token pair
export async function getTokenPrice(
  token: string,
  params: {
    inputTokenMint: string;
    outputTokenMint: string;
  }
) {
  // Use a small amount to get current price (1 unit of input token)
  const inputTokenInfo = params.inputTokenMint === "So11111111111111111111111111111111111111112" 
    ? { decimals: 9 }
    : { decimals: 6 };
  const amount = Math.pow(10, inputTokenInfo.decimals).toString();
  
  const quote = await getTradeQuote(token, {
    ...params,
    amount,
    slippageBps: 50,
  });
  
  // Calculate price: outputAmount / inputAmount (both in their native decimals)
  const outputTokenInfo = params.outputTokenMint === "So11111111111111111111111111111111111111112"
    ? { decimals: 9 }
    : { decimals: 6 };
  
  const inputAmount = parseFloat(amount) / Math.pow(10, inputTokenInfo.decimals);
  const outputAmount = quote.outAmount / Math.pow(10, outputTokenInfo.decimals);
  
  return {
    price: outputAmount / inputAmount,
    inputMint: params.inputTokenMint,
    outputMint: params.outputTokenMint,
    timestamp: Date.now(),
  };
}

// Get recent trades (public endpoint - no auth required)
export async function getRecentTrades(
  token: string | null,
  params?: {
    tokenMint?: string;
    limit?: number;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.tokenMint) searchParams.set("tokenMint", params.tokenMint);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  
  // Public endpoint - no auth required
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
  }>(`/v1/trades/recent${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
}

// Get user's trades
export async function getUserTrades(
  userId: string,
  token: string,
  params?: {
    limit?: number;
    offset?: number;
    tokenMint?: string;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  if (params?.tokenMint) searchParams.set("tokenMint", params.tokenMint);
  
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
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }>(`/v1/users/${userId}/trades${searchParams.toString() ? `?${searchParams.toString()}` : ""}`, token);
}

// Deposit API
export async function prepareDeposit(
  token: string,
  data: {
    tokenMint: string;
    amount: string;
    userSourceAccount?: string;
  }
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

export async function submitDeposit(
  token: string,
  data: {
    depositId: string;
    txSignature: string;
  }
) {
  return fetchWithAuth<{
    depositId: string;
    status: string;
    message: string;
  }>(`/v1/deposits/submit`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Withdrawal API
export async function requestWithdrawal(
  token: string,
  data: {
    tokenMint: string;
    amount: string;
    destinationAddress: string;
  }
) {
  return fetchWithAuth<{
    withdrawalId: string;
    status: string;
    message: string;
  }>(`/v1/withdrawals/request`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Ledger API
export async function getLedger(
  userId: string,
  token: string,
  params?: {
    limit?: number;
    offset?: number;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const query = searchParams.toString();
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
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }>(`/v1/users/${userId}/ledger${query ? `?${query}` : ""}`, token);
}

// System API
export async function getSystemHealth() {
  return fetchApi<{
    status: string;
    timestamp: string;
    database: string;
    solana: string;
    systemFrozen: boolean;
  }>(`/v1/system/health`);
}
