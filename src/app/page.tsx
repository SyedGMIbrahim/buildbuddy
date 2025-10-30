import { ProjectForm } from "@/modules/projects/ui/components/project-form";
import { ProjectList } from "@/modules/projects/ui/components/project-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import Image from "next/image";

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.projects.getMany.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative min-h-screen bg-background">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 -top-40 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-32 -bottom-32 h-[24rem] w-[24rem] rounded-full bg-blue-500/10 blur-2xl" />
          <div className="absolute left-6 top-1/2 h-40 w-40 rounded-full bg-emerald-500/10 blur-xl" />
        </div>

        <div className="container mx-auto py-16 px-4 max-w-4xl">
          {/* Hero Section - Centered */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-4 bg-muted/40">
              <span className="inline-block size-1.5 rounded-full bg-primary" />
              Early Access
            </div>
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.svg"
                alt="BuildBuddy Logo"
                width={80}
                height={80}
                className="animate-pulse"
              />
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              BuildBuddy
            </h1>
            <p className="text-lg text-muted-foreground mb-2">Your AI Pair Programmer</p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Describe your idea and let BuildBuddy scaffold a full project — from components and pages to data and preview.
            </p>
          </div>

          {/* Project Form - Centered */}
          <div className="mb-12">
            <ProjectForm />
          </div>

          {/* How it works - Centered */}
          <div className="mb-12">
            <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto shadow-sm">
              <h3 className="font-semibold mb-4 text-center">How it works</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto mb-2">1</div>
                  <p className="text-sm text-muted-foreground">Describe what you want to build</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto mb-2">2</div>
                  <p className="text-sm text-muted-foreground">AI generates the code in real-time</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto mb-2">3</div>
                  <p className="text-sm text-muted-foreground">Preview and edit your project</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto mb-2">4</div>
                  <p className="text-sm text-muted-foreground">Deploy or download your code</p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <Suspense fallback={<div className="text-center">Loading projects...</div>}>
            <ProjectList />
          </Suspense>
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default Page;
