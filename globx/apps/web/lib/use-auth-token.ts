"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useAuthToken() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      if (status === "loading") {
        return;
      }

      if (!session?.user?.id) {
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/token");
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error("Failed to fetch auth token:", error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [session, status]);

  return { token, loading };
}
