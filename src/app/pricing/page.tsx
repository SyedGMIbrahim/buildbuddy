import { PricingTable } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PricingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the perfect plan for your AI-powered development needs
            </p>
          </div>
        </div>

        {/* Clerk Pricing Table */}
        <div className="mb-12">
          <PricingTable />
        </div>

        {/* Additional Information */}
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold text-center mb-8">What are Credits?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Creating a Project</h3>
              <p className="text-muted-foreground mb-2">10 credits per project</p>
              <p className="text-sm text-muted-foreground">
                When you create a new project, AI generates the complete structure, components, and code.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Sending a Message</h3>
              <p className="text-muted-foreground mb-2">5 credits per message</p>
              <p className="text-sm text-muted-foreground">
                Each message to refine or add features to your project uses AI to generate updated code.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Credits reset at the beginning of each billing period
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What happens when I run out of credits?</h3>
              <p className="text-muted-foreground">
                You won't be able to create new projects or send messages until your credits reset at the start of the next billing period, or you can upgrade to the Pro plan for more credits.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have access to Pro features until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Do unused credits roll over?</h3>
              <p className="text-muted-foreground">
                No, credits reset at the beginning of each billing period and do not roll over to the next period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
