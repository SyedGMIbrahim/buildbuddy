"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { ChevronDownIcon, HomeIcon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(trpc.projects.getOne.queryOptions({ id: projectId }));
    const { theme, setTheme } = useTheme();

    return (
        <div className="border-b px-4 py-3 bg-background">
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Image
                            src="/logo.svg"
                            alt="BuildBuddy Logo"
                            width={24}
                            height={24}
                        />
                        <h1 className="text-lg font-semibold">{project.name}</h1>
                        <ChevronDownIcon className="size-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                            <Link href="/" className="flex items-center gap-2 cursor-pointer">
                                <HomeIcon className="size-4" />
                                Go to Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2">
                                <PaletteIcon className="size-4" />
                                Appearance
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                                    <SunIcon className="size-4" />
                                    Light
                                    {theme === "light" && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                                    <MoonIcon className="size-4" />
                                    Dark
                                    {theme === "dark" && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                                    <MonitorIcon className="size-4" />
                                    System
                                    {theme === "system" && <span className="ml-auto">✓</span>}
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
