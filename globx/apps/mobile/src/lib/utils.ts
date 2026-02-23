export function formatCurrency(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatTokenAmount(
  amount: string | number,
  decimals = 6,
  symbol?: string
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const formatted = (num / divisor).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
  return symbol ? `${formatted} ${symbol}` : formatted;
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
