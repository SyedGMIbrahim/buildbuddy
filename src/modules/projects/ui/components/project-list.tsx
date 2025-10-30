"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ClockIcon, FolderIcon } from "lucide-react";
import Link from "next/link";

export const ProjectList = () => {
    const trpc = useTRPC();
    const { data: projects } = useSuspenseQuery(trpc.projects.getMany.queryOptions());

    if (projects.length === 0) {
        return (
            <Card className="p-12 text-center">
                <FolderIcon className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground">
                    Create your first project to get started
                </p>
            </Card>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Recent Projects</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block"
                    >
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FolderIcon className="size-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate mb-1">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <ClockIcon className="size-3" />
                                        <span>
                                            {formatDistanceToNow(new Date(project.updatedAt), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};
