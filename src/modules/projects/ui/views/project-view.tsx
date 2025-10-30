"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense } from "react";
import { ProjectHeader } from "../components/project-header";

interface Props {
    projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
    return (
        <div className="h-screen flex flex-col">
            <Suspense fallback={<div className="border-b px-4 py-3">Loading...</div>}>
                <ProjectHeader projectId={projectId} />
            </Suspense>
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                    <Suspense fallback={<p>Loading messages...</p>}>
                        <MessagesContainer projectId={projectId} />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={65} minSize={50} className="flex flex-col min-h-0">
                    TODO: Preview
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
