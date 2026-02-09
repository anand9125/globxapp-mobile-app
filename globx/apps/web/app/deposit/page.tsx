"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prepareDeposit, submitDeposit } from "@/lib/api";
import { formatAddress, formatTokenAmount } from "@/lib/utils";
import { useAuthToken } from "@/lib/use-auth-token";
import { Copy, Check, Loader2, QrCode, AlertTriangle, CheckCircle2, Clock, CreditCard, Building2 } from "lucide-react";
import { ALL_TOKENS, USDC, MIN_DEPOSIT_AMOUNT } from "@/lib/tokens";

export default function DepositPage() {
  const { data: session } = useSession();
  const { token } = useAuthToken();
  const router = useRouter();
  const [depositType, setDepositType] = useState<"fiat" | "crypto">("fiat");
  
  // Fiat deposit state
  const [fiatAmount, setFiatAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [bankAccount, setBankAccount] = useState({
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    bankName: "",
  });
  const [kycInfo, setKycInfo] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    idType: "",
    idNumber: "",
  });
  
  // Crypto deposit state
  const [tokenMint, setTokenMint] = useState(USDC.mint);
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [depositData, setDepositData] = useState<{
    depositId: string;
    depositVaultAddress: string;
    vaultTokenAccountAddress: string;
  } | null>(null);
  const [txSignature, setTxSignature] = useState("");
  const [copied, setCopied] = useState(false);

  const tokenInfo = ALL_TOKENS.find((t) => t.mint === tokenMint)!;

  const prepareMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !token) throw new Error("Not authenticated");
      return prepareDeposit(token, {
        tokenMint,
        amount: (parseFloat(cryptoAmount) * Math.pow(10, tokenInfo.decimals)).toString(),
      });
    },
    onSuccess: (data) => {
      setDepositData({
        depositId: data.depositId,
        depositVaultAddress: data.depositVaultAddress,
        vaultTokenAccountAddress: data.vaultTokenAccountAddress,
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!depositData) throw new Error("No deposit data");
      return submitDeposit(token!, {
        depositId: depositData.depositId,
        txSignature,
      });
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const fiatDepositMutation = useMutation({
    mutationFn: async () => {
      // This would call a fiat deposit API endpoint
      // For now, just simulate
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 2000);
      });
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-display-lg font-bold text-jupiter-text-primary mb-2">Deposit Funds</h1>
          <p className="text-jupiter-text-secondary">Deposit fiat or crypto to your GlobX account</p>
        </div>

        {/* Deposit Type Tabs */}
        <Tabs value={depositType} onValueChange={(v) => setDepositType(v as "fiat" | "crypto")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-jupiter-bg border border-jupiter-border rounded-xl p-1">
            <TabsTrigger 
              value="fiat" 
              className="data-[state=active]:bg-jupiter-accent data-[state=active]:text-white rounded-lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Fiat Deposit
            </TabsTrigger>
            <TabsTrigger 
              value="crypto"
              className="data-[state=active]:bg-jupiter-accent data-[state=active]:text-white rounded-lg"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Crypto Deposit
            </TabsTrigger>
          </TabsList>

          {/* Fiat Deposit Tab */}
          <TabsContent value="fiat" className="space-y-6 mt-6">
            <div className="jupiter-card jupiter-card-hover">
              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <Label className="text-sm font-semibold text-jupiter-text-secondary mb-3 block">
                    Deposit Amount
                  </Label>
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
                  </div>
                  <div className="flex gap-2 mt-3">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setFiatAmount(amt.toString())}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-jupiter-surface border border-jupiter-border hover:bg-jupiter-surfaceHover text-jupiter-text-secondary hover:text-jupiter-text-primary transition-all"
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KYC Information */}
                <div className="border-t border-jupiter-border pt-6">
                  <h3 className="text-lg font-semibold text-jupiter-text-primary mb-4">KYC Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">Full Name</Label>
                      <Input
                        value={kycInfo.fullName}
                        onChange={(e) => setKycInfo({ ...kycInfo, fullName: e.target.value })}
                        className="jupiter-input border-jupiter-border"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">Date of Birth</Label>
                      <Input
                        type="date"
                        value={kycInfo.dateOfBirth}
                        onChange={(e) => setKycInfo({ ...kycInfo, dateOfBirth: e.target.value })}
                        className="jupiter-input border-jupiter-border"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">Address</Label>
                      <Input
                        value={kycInfo.address}
                        onChange={(e) => setKycInfo({ ...kycInfo, address: e.target.value })}
                        className="jupiter-input border-jupiter-border"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">City</Label>
                      <Input
                        value={kycInfo.city}
                        onChange={(e) => setKycInfo({ ...kycInfo, city: e.target.value })}
                        className="jupiter-input border-jupiter-border"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">State/Province</Label>
                      <Input
                        value={kycInfo.state}
                        onChange={(e) => setKycInfo({ ...kycInfo, state: e.target.value })}
                        className="jupiter-input border-jupiter-border"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">ZIP/Postal Code</Label>
                      <Input
                        value={kycInfo.zipCode}
                        onChange={(e) => setKycInfo({ ...kycInfo, zipCode: e.target.value })}
                        className="jupiter-input border-jupiter-border"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">Country</Label>
                      <Select value={kycInfo.country} onValueChange={(v) => setKycInfo({ ...kycInfo, country: v })}>
                        <SelectTrigger className="jupiter-input border-jupiter-border">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="bg-jupiter-surface border-jupiter-border">
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">ID Type</Label>
                      <Select value={kycInfo.idType} onValueChange={(v) => setKycInfo({ ...kycInfo, idType: v })}>
                        <SelectTrigger className="jupiter-input border-jupiter-border">
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent className="bg-jupiter-surface border-jupiter-border">
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                          <SelectItem value="national_id">National ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-jupiter-text-secondary mb-2 block">ID Number</Label>
                      <Input
                        value={kycInfo.idNumber}
                        onChange={(e) => setKycInfo({ ...kycInfo, idNumber: e.target.value })}
                        className="jupiter-input border-jupiter-border font-mono"
                        placeholder="Enter ID number"
                      />
                    </div>
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
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={() => fiatDepositMutation.mutate()}
                  disabled={!fiatAmount || parseFloat(fiatAmount) <= 0 || fiatDepositMutation.isPending}
                  className="w-full jupiter-button h-12 text-lg"
                >
                  {fiatDepositMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Deposit...
                    </>
                  ) : (
                    `Deposit ${currency} ${fiatAmount || "0"}`
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Crypto Deposit Tab */}
          <TabsContent value="crypto" className="space-y-6 mt-6">
            <div className="jupiter-card jupiter-card-hover">
              {!depositData ? (
                <div className="space-y-6">
                  {/* Step 1: Select Token */}
                  <div>
                    <Label className="text-xs font-semibold text-jupiter-text-tertiary uppercase tracking-wider mb-3 block">
                      Step 1 — Select Token
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
                    <p className="text-xs text-jupiter-text-tertiary mt-2">
                      Minimum deposit: {MIN_DEPOSIT_AMOUNT} {tokenInfo.symbol}
                    </p>
                  </div>

                  {/* Step 2: Amount */}
                  <div>
                    <Label className="text-xs font-semibold text-jupiter-text-tertiary uppercase tracking-wider mb-3 block">
                      Step 2 — Amount
                    </Label>
                    <div className="jupiter-card bg-jupiter-bg border-jupiter-border mb-3">
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
                    <div className="flex gap-2">
                      {quickAmounts.map((percent) => (
                        <button
                          key={percent}
                          onClick={() => {
                            const mockBalance = 1000;
                            setCryptoAmount(((mockBalance * percent) / 100).toFixed(2));
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-jupiter-surface border border-jupiter-border text-jupiter-text-tertiary hover:bg-jupiter-surfaceHover transition-all"
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prepare Deposit Button */}
                  <Button
                    onClick={() => prepareMutation.mutate()}
                    disabled={!cryptoAmount || parseFloat(cryptoAmount) <= 0 || prepareMutation.isPending}
                    className="w-full jupiter-button h-12"
                  >
                    {prepareMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      "Prepare Deposit"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Three-Vault Architecture Info */}
                  <div className="jupiter-card bg-jupiter-bg border-jupiter-border">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-jupiter-accent animate-pulse-glow" />
                      <span className="text-sm font-semibold text-jupiter-text-primary">
                        Three-Vault Architecture
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-jupiter-text-secondary">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-jupiter-success" />
                        <span>Funds received in Deposit Vault</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-jupiter-warning" />
                        <span>Transferring to Main Vault for trading...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-jupiter-text-tertiary" />
                        <span>Available for withdrawal from Withdrawal Vault</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Deposit Address */}
                  <div>
                    <Label className="text-xs font-semibold text-jupiter-text-tertiary uppercase tracking-wider mb-3 block">
                      Step 3 — Deposit to Vault Address
                    </Label>
                    <div className="jupiter-card bg-jupiter-bg border-jupiter-border">
                      <div className="mb-2">
                        <span className="text-xs text-jupiter-text-tertiary">Deposit Vault:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 font-mono text-sm text-jupiter-text-primary break-all">
                          {depositData.vaultTokenAccountAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(depositData.vaultTokenAccountAddress)}
                          className="bg-jupiter-surface hover:bg-jupiter-surfaceHover border border-jupiter-border"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-jupiter-success" />
                          ) : (
                            <Copy className="h-4 w-4 text-jupiter-text-secondary" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="mt-4 flex justify-center">
                      <div className="bg-white p-4 rounded-xl">
                        <QrCode className="h-32 w-32 text-jupiter-bg" />
                      </div>
                    </div>
                  </div>

                  {/* Warning Notice */}
                  <div className="bg-jupiter-warning/10 border border-jupiter-warning/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-jupiter-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-jupiter-warning">
                      Only send <strong>{tokenInfo.symbol}</strong> on Solana network to this address.
                      Sending other tokens may result in permanent loss.
                    </div>
                  </div>

                  {/* Step 4: Submit TX Signature */}
                  <div>
                    <Label className="text-xs font-semibold text-jupiter-text-tertiary uppercase tracking-wider mb-3 block">
                      Step 4 — Submit Transaction Signature
                    </Label>
                    <Input
                      placeholder="Enter your Solana transaction signature"
                      value={txSignature}
                      onChange={(e) => setTxSignature(e.target.value)}
                      className="jupiter-input border-jupiter-border font-mono text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setDepositData(null);
                        setTxSignature("");
                      }}
                      className="flex-1 jupiter-button-secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => submitMutation.mutate()}
                      disabled={!txSignature || submitMutation.isPending}
                      className="flex-1 jupiter-button"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Deposit"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
