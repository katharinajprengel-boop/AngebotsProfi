import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  checkSubscription: () => Promise<void>;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check premium status from database (fast) - uses secure view that excludes Stripe data
  const checkLocalPremiumStatus = useCallback(async (currentUserId: string) => {
    try {
      // Use the profiles_public view which excludes sensitive Stripe fields
      const { data, error } = await supabase
        .from("profiles_public" as any)
        .select("is_premium")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (!error && data) {
        setIsPremium((data as any).is_premium || false);
      }
    } catch (err) {
      console.error("Error checking local premium status:", err);
    }
  }, []);

  // Verify subscription with Stripe (slower but authoritative)
  const checkSubscription = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setIsPremium(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }

      if (data) {
        setIsPremium(data.premium || false);
      }
    } catch (err) {
      console.error("Error invoking check-subscription:", err);
    }
  }, []);

  // Refresh premium status (both local and remote)
  const refreshPremiumStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        await checkLocalPremiumStatus(sessionData.session.user.id);
        await checkSubscription();
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkLocalPremiumStatus, checkSubscription]);

  // Initialize and listen for auth changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        await checkLocalPremiumStatus(session.user.id);
        // Background check with Stripe
        checkSubscription();
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setIsPremium(false);
      }
      setIsLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          await checkLocalPremiumStatus(session.user.id);
          // Background check with Stripe on login
          if (event === "SIGNED_IN") {
            checkSubscription();
          }
        } else {
          setIsAuthenticated(false);
          setUserId(null);
          setIsPremium(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkLocalPremiumStatus, checkSubscription]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        isAuthenticated,
        userId,
        checkSubscription,
        refreshPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}
