import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/contexts/PremiumContext";

interface OfferLimitsState {
  offersCreatedThisMonth: number;
  offersMonth: string | null;
  isLoading: boolean;
}

const FREE_OFFER_LIMIT = 1;

/**
 * Hook to manage offer creation limits for free users.
 * Premium users bypass all limits.
 */
export function useOfferLimits() {
  const { isPremium, isAuthenticated, userId } = usePremium();
  const [state, setState] = useState<OfferLimitsState>({
    offersCreatedThisMonth: 0,
    offersMonth: null,
    isLoading: true,
  });

  // Get current month string (YYYY-MM)
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  // Load offer limits from database
  const loadOfferLimits = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles_public" as any)
        .select("offers_created_this_month, offers_month")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading offer limits:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      if (data) {
        const profileData = data as any;
        const currentMonth = getCurrentMonth();
        
        // Check if we need to reset the counter (new month)
        if (profileData.offers_month !== currentMonth) {
          // Reset counter for new month
          await resetMonthlyCounter(currentMonth);
          setState({
            offersCreatedThisMonth: 0,
            offersMonth: currentMonth,
            isLoading: false,
          });
        } else {
          setState({
            offersCreatedThisMonth: profileData.offers_created_this_month || 0,
            offersMonth: profileData.offers_month,
            isLoading: false,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      console.error("Error in loadOfferLimits:", err);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, userId]);

  // Reset monthly counter in database
  const resetMonthlyCounter = async (currentMonth: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("profiles" as any)
        .update({
          offers_created_this_month: 0,
          offers_month: currentMonth,
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error resetting monthly counter:", error);
      }
    } catch (err) {
      console.error("Error in resetMonthlyCounter:", err);
    }
  };

  // Increment offer count after successful generation
  const incrementOfferCount = useCallback(async () => {
    if (!isAuthenticated || !userId || isPremium) {
      return;
    }

    const currentMonth = getCurrentMonth();
    const newCount = state.offersCreatedThisMonth + 1;

    try {
      const { error } = await supabase
        .from("profiles" as any)
        .update({
          offers_created_this_month: newCount,
          offers_month: currentMonth,
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error incrementing offer count:", error);
        return;
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        offersCreatedThisMonth: newCount,
        offersMonth: currentMonth,
      }));
    } catch (err) {
      console.error("Error in incrementOfferCount:", err);
    }
  }, [isAuthenticated, userId, isPremium, state.offersCreatedThisMonth]);

  // Load limits on mount and when auth changes
  useEffect(() => {
    loadOfferLimits();
  }, [loadOfferLimits]);

  // Computed values
  const canCreateOffer = isPremium || state.offersCreatedThisMonth < FREE_OFFER_LIMIT;
  const remainingFreeOffers = Math.max(0, FREE_OFFER_LIMIT - state.offersCreatedThisMonth);
  const hasUsedFreeOffer = state.offersCreatedThisMonth >= FREE_OFFER_LIMIT;

  return {
    canCreateOffer,
    remainingFreeOffers,
    hasUsedFreeOffer,
    offersCreatedThisMonth: state.offersCreatedThisMonth,
    isLoading: state.isLoading,
    incrementOfferCount,
    refreshLimits: loadOfferLimits,
  };
}
