"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FloatingLabelInput } from "@/components/auth/FloatingLabelInput";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin?registered=true");
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Failed to sign up with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1 mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Create Account</h2>
          <p className="text-text-secondary">Get started with GlobX in seconds</p>
        </div>

        <OAuthButtons
          onGoogleClick={handleGoogleSignUp}
          googleLoading={googleLoading}
          disabled={loading}
        />

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs uppercase tracking-wider text-text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {success && (
          <div className="p-4 text-sm text-accent-buy bg-accent-buy/10 rounded-xl border border-accent-buy/20 flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5" />
            <span>Account created successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 text-sm text-accent-sell bg-accent-sell/10 rounded-xl border border-accent-sell/20">
              {error}
            </div>
          )}

          <FloatingLabelInput
            id="name"
            type="text"
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading || googleLoading}
          />

          <FloatingLabelInput
            id="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading || googleLoading}
          />

          <div className="space-y-2">
            <FloatingLabelInput
              id="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              disabled={loading || googleLoading}
            />
            <p className="text-xs text-text-muted">Must be at least 8 characters long</p>
          </div>

          <FloatingLabelInput
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={loading || googleLoading}
            error={
              formData.password &&
              formData.confirmPassword &&
              formData.password !== formData.confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />

          <Button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-light text-white h-12 rounded-xl font-semibold"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="text-center text-sm pt-6 border-t border-border mt-6">
          <span className="text-text-muted">Already have an account? </span>
          <Link
            href="/auth/signin"
            className="text-accent-primary font-semibold hover:text-accent-light transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
