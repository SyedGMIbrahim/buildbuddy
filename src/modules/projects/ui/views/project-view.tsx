"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { ProjectHeader } from "../components/project-header";
import { Fragment } from "@/generated/prisma";
import { FragmentView } from "../components/fragment-view";

interface Props {
    projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Suspense fallback={<div className="border-b px-4 py-3">Loading...</div>}>
                <ProjectHeader projectId={projectId} />
            </Suspense>
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                    <Suspense fallback={<p>Loading messages...</p>}>
                        <MessagesContainer 
                            projectId={projectId}
                            activeFragment={activeFragment}
                            onFragmentSelect={setActiveFragment}
                        />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={65} minSize={50} className="flex flex-col min-h-0">
                    <FragmentView fragment={activeFragment} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
