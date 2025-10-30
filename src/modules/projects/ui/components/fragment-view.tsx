"use client";

import { Fragment } from "@/generated/prisma";
import { Code2Icon, ExternalLinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Props {
    fragment: Fragment | null;
}

export const FragmentView = ({ fragment }: Props) => {
    if (!fragment) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Code2Icon className="size-12 mb-4 opacity-50" />
                <p className="text-sm">Select a fragment to preview</p>
            </div>
        );
    }

    const files = fragment.files as Record<string, string>;

    return (
        <div className="flex flex-col h-full">
            <div className="border-b px-4 py-3">
                <h2 className="text-lg font-semibold">{fragment.title}</h2>
            </div>
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b">
                    <TabsList className="justify-start rounded-none border-b-0 bg-transparent px-4">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="code">Code</TabsTrigger>
                    </TabsList>
                    <div className="px-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(fragment.sandboxUrl, "_blank")}
                            className="gap-2"
                        >
                            <ExternalLinkIcon className="size-4" />
                            Open in New Tab
                        </Button>
                    </div>
                </div>
                <TabsContent value="preview" className="flex-1 m-0">
                    <iframe
                        src={fragment.sandboxUrl}
                        className="w-full h-full border-0"
                        title={fragment.title}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    />
                </TabsContent>
                <TabsContent value="code" className="flex-1 m-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-6">
                            {Object.entries(files).map(([filename, content]) => (
                                <div key={filename}>
                                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                                        <Code2Icon className="size-4" />
                                        {filename}
                                    </div>
                                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                                        <code className="text-sm">{content}</code>
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
};
