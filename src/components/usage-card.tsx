"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, TrendingUp, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export function UsageDisplay() {
  const trpc = useTRPC();
  const { data: usage, refetch } = useSuspenseQuery(trpc.usage.getStats.queryOptions());
  const [isSyncing, setIsSyncing] = useState(false);

  if (!usage) {
    return null;
  }

  const isLowCredits = usage.percentageUsed >= 80;
  const isOutOfCredits = usage.creditsRemaining <= 0;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/sync-credits", {
        method: "POST",
      });
      const data = await response.json();
      
      console.log("Sync response:", data);
      
      if (data.success) {
        await refetch();
        toast.success(`Credits synced! Limit: ${data.usage.creditsLimit}`);
      } else {
        toast.error(data.error || "Failed to sync credits");
        console.error("Sync failed:", data);
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync credits");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-2">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Credits</h3>
            <p className="text-xs text-muted-foreground">
              Resets {format(usage.periodEnd, "MMM d")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSync}
            disabled={isSyncing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`size-3 ${isSyncing ? "animate-spin" : ""}`} />
          </Button>
          
          {isLowCredits && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing" className="flex items-center gap-1">
                <TrendingUp className="size-3" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {usage.creditsUsed} / {usage.creditsLimit} used
          </span>
          <span className={`font-semibold ${isOutOfCredits ? "text-red-500" : isLowCredits ? "text-orange-500" : "text-primary"}`}>
            {usage.creditsRemaining} left
          </span>
        </div>
        
        <Progress 
          value={usage.percentageUsed} 
          className="h-2"
        />
        
        {isOutOfCredits && (
          <p className="text-xs text-red-500 mt-2">
            You've used all your credits for this period. Upgrade to Pro for more!
          </p>
        )}
        
        {isLowCredits && !isOutOfCredits && (
          <p className="text-xs text-orange-500 mt-2">
            Running low on credits. Consider upgrading to Pro!
          </p>
        )}
      </div>
    </Card>
  );
}

export function UsageCard() {
  return (
    <div className="mb-6">
      <UsageDisplay />
    </div>
  );
}
