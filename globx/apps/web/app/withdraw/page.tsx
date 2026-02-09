"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPortfolio, requestWithdrawal } from "@/lib/api";
import { formatTokenAmount } from "@/lib/utils";
import { useAuthToken } from "@/lib/use-auth-token";
import { Loader2, ArrowUpRight, CheckCircle2, XCircle, Clock, CreditCard, Building2 } from "lucide-react";
import { ALL_TOKENS, USDC } from "@/lib/tokens";

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export default function WithdrawPage() {
  const { data: session } = useSession();
  const { token } = useAuthToken();
  const router = useRouter();
  const [withdrawType, setWithdrawType] = useState<"fiat" | "crypto">("fiat");
  
  // Fiat withdrawal state
  const [fiatAmount, setFiatAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [bankAccount, setBankAccount] = useState({
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    bankName: "",
    swiftCode: "",
  });
  
  // Crypto withdrawal state
  const [tokenMint, setTokenMint] = useState(USDC.mint);
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const userId = session?.user?.id;
  const tokenInfo = ALL_TOKENS.find((t) => t.mint === tokenMint)!;

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio", userId, token],
    queryFn: () => getPortfolio(userId!, token!),
    enabled: !!userId && !!token,
  });

  const balance = portfolio?.balances.find((b) => b.tokenMint === tokenMint);
  const availableBalance = balance
    ? formatTokenAmount(balance.amount, tokenInfo.decimals, tokenInfo.symbol)
    : "0";
  const availableBalanceNumber = balance
    ? parseFloat(balance.amount) / Math.pow(10, tokenInfo.decimals)
    : 0;

  const withdrawalMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !token) throw new Error("Not authenticated");
      return requestWithdrawal(token, {
        tokenMint,
        amount: (parseFloat(cryptoAmount) * Math.pow(10, tokenInfo.decimals)).toString(),
        destinationAddress,
      });
    },
    onSuccess: () => {
      setShowConfirmDialog(false);
      router.push("/dashboard");
    },
  });

  const fiatWithdrawalMutation = useMutation({
    mutationFn: async () => {
      // This would call a fiat withdrawal API endpoint
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 2000);
      });
    },
    onSuccess: () => {
      setShowConfirmDialog(false);
      router.push("/dashboard");
    },
  });

  const handleMax = () => {
    if (balance) {
      const maxAmount = parseFloat(balance.amount) / Math.pow(10, tokenInfo.decimals);
      setCryptoAmount(maxAmount.toString());
    }
  };

  const isAddressValid = destinationAddress ? isValidSolanaAddress(destinationAddress) : null;
  const networkFee = 0.000005;
  const platformFee = 0.001;
  const totalFee = networkFee + platformFee;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-display-lg font-bold text-jupiter-text-primary mb-2">Withdraw Funds</h1>
          <p className="text-jupiter-text-secondary">Withdraw fiat or crypto from your GlobX account</p>
        </div>

        {/* Withdrawal Type Tabs */}
        <Tabs value={withdrawType} onValueChange={(v) => setWithdrawType(v as "fiat" | "crypto")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-jupiter-bg border border-jupiter-border rounded-xl p-1">
            <TabsTrigger 
              value="fiat" 
              className="data-[state=active]:bg-jupiter-accent data-[state=active]:text-white rounded-lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Fiat Withdrawal
            </TabsTrigger>
            <TabsTrigger 
              value="crypto"
              className="data-[state=active]:bg-jupiter-accent data-[state=active]:text-white rounded-lg"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Crypto Withdrawal
            </TabsTrigger>
          </TabsList>

          {/* Fiat Withdrawal Tab */}
          <TabsContent value="fiat" className="space-y-6 mt-6">
            <div className="jupiter-card jupiter-card-hover">
              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-jupiter-text-secondary">
                      Withdrawal Amount
                    </Label>
                    <span className="text-xs text-jupiter-text-tertiary font-mono">
                      Available: $10,000
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="jupiter-input w-24 border-jupiter-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-jupiter-surface border-jupiter-border">
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={fiatAmount}
                      onChange={(e) => setFiatAmount(e.target.value)}
                      className="flex-1 jupiter-input border-jupiter-border text-2xl font-bold text-jupiter-text-primary"
                    />
                    <button
                      onClick={() => setFiatAmount("10000")}
                      className="text-sm text-jupiter-accent hover:text-jupiter-accent-light font-semibold transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="border-t border-jupiter-border pt-6">
                  <h3 className="text-lg font-semibold text-jupiter-text-primary mb-4">Bank Account Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">Account Holder Name</Label>
                      <Input
                        value={bankAccount.accountHolderName}
                        onChange={(e) => setBankAccount({ ...bankAccount, accountHolderName: e.target.value })}
                        className="jupiter-input border-jupiter-border"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">Bank Name</Label>
                      <Input
                        value={bankAccount.bankName}
                        onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                        className="jupiter-input border-jupiter-border"
                        placeholder="Chase Bank"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-jupiter-text-secondary mb-2 block">Account Number</Label>
                        <Input
                          type="text"
                          value={bankAccount.accountNumber}
                          onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                          className="jupiter-input border-jupiter-border font-mono"
                          placeholder="0000000000"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-jupiter-text-secondary mb-2 block">Routing Number</Label>
                        <Input
                          type="text"
                          value={bankAccount.routingNumber}
                          onChange={(e) => setBankAccount({ ...bankAccount, routingNumber: e.target.value })}
                          className="jupiter-input border-jupiter-border font-mono"
                          placeholder="000000000"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">SWIFT/BIC Code (International)</Label>
                      <Input
                        type="text"
                        value={bankAccount.swiftCode}
                        onChange={(e) => setBankAccount({ ...bankAccount, swiftCode: e.target.value })}
                        className="jupiter-input border-jupiter-border font-mono uppercase"
                        placeholder="CHASUS33"
                      />
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="jupiter-card bg-jupiter-bg border-jupiter-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Processing Fee:</span>
                    <span className="jupiter-number text-sm text-jupiter-text-primary">
                      $5.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Wire Transfer Fee:</span>
                    <span className="jupiter-number text-sm text-jupiter-text-primary">
                      $25.00
                    </span>
                  </div>
                  <div className="border-t border-jupiter-border pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-jupiter-text-primary">Total Fee:</span>
                    <span className="jupiter-number text-base font-bold text-jupiter-text-primary">
                      $30.00
                    </span>
                  </div>
                  <div className="border-t border-jupiter-border pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-jupiter-text-primary">You'll Receive:</span>
                    <span className="jupiter-number text-lg font-bold text-jupiter-success">
                      {fiatAmount ? `$${(parseFloat(fiatAmount) - 30).toFixed(2)}` : "$0.00"}
                    </span>
                  </div>
                </div>

                {/* Withdraw Button */}
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!fiatAmount || parseFloat(fiatAmount) <= 30 || fiatWithdrawalMutation.isPending}
                  className="w-full bg-jupiter-error hover:bg-jupiter-error/90 text-white h-12 text-lg shadow-jupiter-error"
                >
                  {fiatWithdrawalMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="mr-2 h-5 w-5" />
                      Withdraw {currency} {fiatAmount || "0"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Crypto Withdrawal Tab */}
          <TabsContent value="crypto" className="space-y-6 mt-6">
            <div className="jupiter-card jupiter-card-hover">
              {/* Token Selector */}
              <div className="mb-6">
                <Label className="text-xs font-semibold text-jupiter-text-tertiary uppercase tracking-wider mb-3 block">
                  Token
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                  {ALL_TOKENS.map((token) => (
                    <button
                      key={token.mint}
                      onClick={() => setTokenMint(token.mint)}
                      className={`px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                        tokenMint === token.mint
                          ? "border-jupiter-accent bg-jupiter-accent/10 shadow-jupiter-glow"
                          : "border-jupiter-border hover:border-jupiter-borderHover bg-jupiter-bg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-jupiter-text-primary">{token.symbol}</div>
                          <div className="text-xs text-jupiter-text-tertiary">{token.name}</div>
                        </div>
                        {token.category === "tokenized_stock" && (
                          <span className="text-xs text-jupiter-accent bg-jupiter-accent/20 px-2 py-0.5 rounded">Stock</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Three-Vault Architecture Info */}
              <div className="jupiter-card bg-jupiter-bg border-jupiter-border mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-jupiter-accent animate-pulse-glow" />
                  <span className="text-sm font-semibold text-jupiter-text-primary">Withdrawal Flow</span>
                </div>
                <div className="space-y-2 text-sm text-jupiter-text-secondary">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-jupiter-text-tertiary" />
                    <span>Request processed from Main Vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-jupiter-warning" />
                    <span>Funds staged in Withdrawal Vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-jupiter-success" />
                    <span>Sent to your destination address</span>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-semibold text-jupiter-text-tertiary uppercase tracking-wider">
                    Amount ({tokenInfo.symbol})
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="jupiter-number text-xs text-jupiter-text-tertiary">
                      Available: {availableBalance}
                    </span>
                    <button
                      onClick={handleMax}
                      className="text-xs text-jupiter-accent hover:text-jupiter-accent-light font-semibold transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="jupiter-card bg-jupiter-bg border-jupiter-border">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-jupiter-text-primary">{tokenInfo.symbol}</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      className="flex-1 bg-transparent border-none text-right font-mono text-2xl font-bold text-jupiter-text-primary placeholder:text-jupiter-text-tertiary outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Destination Address */}
              <div className="mb-6">
                <Label className="text-xs font-semibold text-jupiter-text-tertiary uppercase tracking-wider mb-3 block">
                  Destination Address
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Enter Solana wallet address"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="jupiter-input border-jupiter-border font-mono text-sm pr-10"
                  />
                  {destinationAddress && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isAddressValid ? (
                        <CheckCircle2 className="h-5 w-5 text-jupiter-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-jupiter-error" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-jupiter-text-tertiary mt-2">
                  Solana wallet address (base58 encoded)
                </p>
              </div>

              {/* Fee Summary */}
              <div className="jupiter-card bg-jupiter-bg border-jupiter-border mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-jupiter-text-secondary">Network Fee:</span>
                  <span className="jupiter-number text-sm text-jupiter-text-primary">
                    {networkFee} {tokenInfo.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-jupiter-text-secondary">Platform Fee:</span>
                  <span className="jupiter-number text-sm text-jupiter-text-primary">
                    {platformFee} {tokenInfo.symbol}
                  </span>
                </div>
                <div className="border-t border-jupiter-border pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-jupiter-text-primary">Total Fee:</span>
                  <span className="jupiter-number text-base font-bold text-jupiter-text-primary">
                    {totalFee} {tokenInfo.symbol}
                  </span>
                </div>
              </div>

              {/* Withdraw Button */}
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={
                  !cryptoAmount ||
                  parseFloat(cryptoAmount) <= 0 ||
                  !destinationAddress ||
                  !isAddressValid ||
                  withdrawalMutation.isPending ||
                  parseFloat(cryptoAmount) > availableBalanceNumber
                }
                className="w-full bg-jupiter-error hover:bg-jupiter-error/90 text-white h-12 text-lg shadow-jupiter-error disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {withdrawalMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="mr-2 h-5 w-5" />
                    Withdraw {cryptoAmount || "0"} {tokenInfo.symbol}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-jupiter-surface border-jupiter-border animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-jupiter-text-primary">Confirm Withdrawal</DialogTitle>
            <DialogDescription className="text-jupiter-text-secondary">
              Please review your withdrawal details carefully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="jupiter-card bg-jupiter-bg border-jupiter-border space-y-3">
              {withdrawType === "fiat" ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Type:</span>
                    <span className="font-semibold text-jupiter-text-primary">Fiat Withdrawal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Amount:</span>
                    <span className="jupiter-number text-sm text-jupiter-text-primary">
                      {currency} {fiatAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Bank:</span>
                    <span className="text-sm text-jupiter-text-primary">{bankAccount.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Account:</span>
                    <span className="font-mono text-sm text-jupiter-text-primary">
                      ****{bankAccount.accountNumber.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Total Fee:</span>
                    <span className="jupiter-number text-sm text-jupiter-text-primary">$30.00</span>
                  </div>
                  <div className="border-t border-jupiter-border pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-jupiter-text-primary">You'll Receive:</span>
                    <span className="jupiter-number text-base font-bold text-jupiter-success">
                      ${fiatAmount ? (parseFloat(fiatAmount) - 30).toFixed(2) : "0.00"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Token:</span>
                    <span className="font-semibold text-jupiter-text-primary">{tokenInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Amount:</span>
                    <span className="jupiter-number text-sm text-jupiter-text-primary">
                      {cryptoAmount} {tokenInfo.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Destination:</span>
                    <span className="font-mono text-xs text-jupiter-text-primary break-all text-right max-w-[60%]">
                      {destinationAddress}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-jupiter-text-secondary">Total Fee:</span>
                    <span className="jupiter-number text-sm text-jupiter-text-primary">
                      {totalFee} {tokenInfo.symbol}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-jupiter-border bg-jupiter-bg text-jupiter-accent focus:ring-jupiter-accent-glow"
              />
              <label htmlFor="confirm" className="text-sm text-jupiter-text-secondary cursor-pointer">
                I confirm this withdrawal and understand that it cannot be reversed
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmChecked(false);
                }}
                className="flex-1 jupiter-button-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (withdrawType === "fiat") {
                    fiatWithdrawalMutation.mutate();
                  } else {
                    withdrawalMutation.mutate();
                  }
                }}
                className="flex-1 bg-jupiter-error hover:bg-jupiter-error/90 text-white"
                disabled={!confirmChecked || (withdrawType === "fiat" ? fiatWithdrawalMutation.isPending : withdrawalMutation.isPending)}
              >
                {(withdrawType === "fiat" ? fiatWithdrawalMutation.isPending : withdrawalMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Withdrawal"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
