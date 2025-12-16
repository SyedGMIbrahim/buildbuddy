import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { Loader2Icon, SparklesIcon, CodeIcon, WandIcon } from "lucide-react";

const LOADING_PHRASES = [
    "Generating code...",
    "Crafting your project...",
    "Building components...",
    "Scaffolding files...",
    "Writing magic...",
    "Creating your app...",
    "Assembling pieces...",
    "Cooking up code...",
];

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    onFragmentSelect: (fragment: Fragment | null) => void;
};

export const MessagesContainer = ({ projectId, activeFragment, onFragmentSelect }: Props) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
    const previousMessagesLengthRef = useRef(0);
    
    const { data: messages, refetch } = useSuspenseQuery(trpc.messages.getMany.queryOptions({ projectId }));

    useEffect(() => {
        if (messages.length > previousMessagesLengthRef.current) {
            const latestWithFragment = [...messages].reverse().find((m) => !!m.fragment);
            if (latestWithFragment?.fragment) {
                onFragmentSelect(latestWithFragment.fragment);
            }
        }
        previousMessagesLengthRef.current = messages.length;
    }, [messages, onFragmentSelect]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // Check if we're waiting for an AI response
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "USER") {
            setIsGenerating(true);
            // Poll for new messages every 2 seconds
            const interval = setInterval(() => {
                refetch();
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setIsGenerating(false);
        }
    }, [messages, refetch]);

    useEffect(() => {
        if (!isGenerating) {
            // Ensure the messages list is refreshed and shows fragments
            const key = trpc.messages.getMany.queryOptions({ projectId }).queryKey;
            queryClient.invalidateQueries({ queryKey: key });
            refetch();
        }
    }, [isGenerating, projectId, queryClient, trpc.messages.getMany, refetch]);

    useEffect(() => {
        if (isGenerating) {
            const interval = setInterval(() => {
                setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isGenerating]);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {messages.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={message.fragment?.id === activeFragment?.id}
                            onFragmentClick={onFragmentSelect}
                            type={message.type}
                        />
                    ))}
                    {isGenerating && (
                        <div className="flex items-start gap-3 pl-2 pb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                                <div className="relative bg-primary/10 p-2 rounded-full">
                                    <Loader2Icon className="size-4 text-primary animate-spin" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-foreground animate-pulse">
                                    {LOADING_PHRASES[loadingPhraseIndex]}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <SparklesIcon className="size-3 text-primary animate-pulse" />
                                    <CodeIcon className="size-3 text-primary animate-pulse delay-100" />
                                    <WandIcon className="size-3 text-primary animate-pulse delay-200" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
                <MessageForm projectId={projectId} />
            </div>
        </div>
    )
}