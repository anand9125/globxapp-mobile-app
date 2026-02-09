"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FloatingLabelInput } from "@/components/auth/FloatingLabelInput";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1 mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Sign In</h2>
          <p className="text-text-secondary">Welcome back to GlobX</p>
        </div>

        <OAuthButtons
          onGoogleClick={handleGoogleSignIn}
          googleLoading={googleLoading}
          disabled={loading}
        />

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs uppercase tracking-wider text-text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 text-sm text-accent-sell bg-accent-sell/10 rounded-xl border border-accent-sell/20">
              {error}
            </div>
          )}

          <FloatingLabelInput
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || googleLoading}
            error={error && !password ? error : undefined}
          />

          <div className="space-y-2">
            <FloatingLabelInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || googleLoading}
              error={error && password ? error : undefined}
            />
            <Link
              href="/auth/forgot-password"
              className="text-sm text-accent-primary hover:text-accent-light transition-colors float-right"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-light text-white h-12 rounded-xl font-semibold"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-sm pt-6 border-t border-border mt-6">
          <span className="text-text-muted">New to GlobX? </span>
          <Link
            href="/auth/signup"
            className="text-accent-primary font-semibold hover:text-accent-light transition-colors"
          >
            Create account →
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
