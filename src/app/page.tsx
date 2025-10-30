import { ProjectForm } from "@/modules/projects/ui/components/project-form";
import { ProjectList } from "@/modules/projects/ui/components/project-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Eye, UploadCloud } from "lucide-react";

export const dynamic = "force-dynamic";

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.projects.getMany.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative min-h-screen bg-background">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 -top-40 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-blue-500/15 blur-2xl" />
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
            <div className="h-full w-full bg-[linear-gradient(to_bottom_right,transparent_0%,rgba(120,119,198,0.06)_40%,transparent_60%)]" />
          </div>
        </div>

        <div className="container mx-auto py-5 px-4 max-w-6xl">
          {/* Hero */}
          <section className="text-center mb-14">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.svg"
                alt="BuildBuddy Logo"
                width={100}
                height={100}
                className="animate-pulse"
              />
            </div>
            <Badge variant="outline" className="mb-4">
              <span className="inline-block size-1.5 rounded-full bg-primary mr-2" />
              Early access
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-blue-600 to-emerald-500 bg-clip-text text-transparent">
              BuildBuddy
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Describe your idea and let BuildBuddy scaffold a full project — from components and pages to data and preview.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild>
                <Link href="#create-project">Start building</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#projects">View projects</Link>
              </Button>
            </div>
          </section>

          {/* Create Project */}
          <section id="create-project" className="mb-14">
            <div className="max-w-7xl mx-auto">
              <ProjectForm />
            </div>
          </section>

          {/* How it works */}
          <section className="mb-16">
            <h3 className="text-center text-sm text-muted-foreground mb-4">How it works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary p-2 w-fit mb-1">
                    <Sparkles className="size-4" />
                  </div>
                  <CardTitle className="text-base">Describe</CardTitle>
                  <CardDescription>Tell us what you want to build.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary p-2 w-fit mb-1">
                    <Wand2 className="size-4" />
                  </div>
                  <CardTitle className="text-base">Generate</CardTitle>
                  <CardDescription>AI scaffolds components, pages, and data.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary p-2 w-fit mb-1">
                    <Eye className="size-4" />
                  </div>
                  <CardTitle className="text-base">Preview</CardTitle>
                  <CardDescription>Live preview and iterate quickly.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary p-2 w-fit mb-1">
                    <UploadCloud className="size-4" />
                  </div>
                  <CardTitle className="text-base">Ship</CardTitle>
                  <CardDescription>Deploy or download the code.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* Projects */}
          <section id="projects" className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Your projects</h3>
              <div className="mt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#create-project">New project</Link>
                </Button>
              </div>
            </div>
            <div className="max-w-5xl mx-auto">
              <Suspense fallback={<div className="text-center">Loading projects...</div>}>
                <ProjectList />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default Page;
