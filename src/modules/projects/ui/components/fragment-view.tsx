"use client";

import { Fragment } from "@/generated/prisma";
import { ChevronDownIcon, ChevronRightIcon, Code2Icon, ExternalLinkIcon, FileIcon, FolderIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
    fragment: Fragment | null;
}

interface FileTreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileTreeNode[];
}

const buildFileTree = (files: Record<string, string>): FileTreeNode[] => {
    const root: FileTreeNode[] = [];
    const map = new Map<string, FileTreeNode>();

    Object.keys(files).forEach((filePath) => {
        const parts = filePath.split("/").filter(Boolean);
        let currentPath = "";

        parts.forEach((part, index) => {
            const isLast = index === parts.length - 1;
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            if (!map.has(currentPath)) {
                const node: FileTreeNode = {
                    name: part,
                    path: currentPath,
                    isDirectory: !isLast,
                    children: !isLast ? [] : undefined,
                };
                map.set(currentPath, node);

                if (index === 0) {
                    root.push(node);
                } else {
                    const parentPath = parts.slice(0, index).join("/");
                    const parent = map.get(parentPath);
                    if (parent?.children) {
                        parent.children.push(node);
                    }
                }
            }
        });
    });

    return root;
};

const FileTreeItem = ({
    node,
    selectedFile,
    onSelect,
    level = 0,
}: {
    node: FileTreeNode;
    selectedFile: string | null;
    onSelect: (path: string) => void;
    level?: number;
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (node.isDirectory) {
        return (
            <div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 w-full px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                >
                    {isExpanded ? (
                        <ChevronDownIcon className="size-4 shrink-0" />
                    ) : (
                        <ChevronRightIcon className="size-4 shrink-0" />
                    )}
                    <FolderIcon className="size-4 shrink-0 text-blue-500" />
                    <span className="truncate">{node.name}</span>
                </button>
                {isExpanded && node.children && (
                    <div>
                        {node.children.map((child) => (
                            <FileTreeItem
                                key={child.path}
                                node={child}
                                selectedFile={selectedFile}
                                onSelect={onSelect}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => onSelect(node.path)}
            className={cn(
                "flex items-center gap-1 w-full px-2 py-1 text-sm hover:bg-muted rounded transition-colors",
                selectedFile === node.path && "bg-muted"
            )}
            style={{ paddingLeft: `${level * 12 + 28}px` }}
        >
            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{node.name}</span>
        </button>
    );
};

export const FragmentView = ({ fragment }: Props) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    if (!fragment) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Code2Icon className="size-12 mb-4 opacity-50" />
                <p className="text-sm">Select a fragment to preview</p>
            </div>
        );
    }

    const files = fragment.files as Record<string, string>;
    const fileTree = buildFileTree(files);
    const selectedFileContent = selectedFile ? files[selectedFile] : null;
    const breadcrumbs = selectedFile?.split("/").filter(Boolean) || [];

    return (
        <div className="flex flex-col h-full">
            <div className="border-b px-4 py-3">
                <h2 className="text-lg font-semibold">{fragment.title}</h2>
            </div>
            <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
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
                <TabsContent value="code" className="flex-1 m-0 flex">
                    {/* File Explorer */}
                    <div className="w-64 border-r flex flex-col min-h-0">
                        <div className="border-b px-3 py-2 text-sm font-medium bg-muted/50">
                            Explorer
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="py-2">
                                {fileTree.map((node) => (
                                    <FileTreeItem
                                        key={node.path}
                                        node={node}
                                        selectedFile={selectedFile}
                                        onSelect={setSelectedFile}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    {/* Code Viewer */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {selectedFile ? (
                            <>
                                {/* Breadcrumbs */}
                                <div className="border-b px-4 py-2 flex items-center gap-1 text-sm text-muted-foreground bg-muted/30">
                                    {breadcrumbs.map((crumb, index) => (
                                        <div key={index} className="flex items-center gap-1">
                                            {index > 0 && <span>/</span>}
                                            <span className={cn(index === breadcrumbs.length - 1 && "text-foreground font-medium")}>
                                                {crumb}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {/* Code Content */}
                                <ScrollArea className="flex-1">
                                    <pre className="p-4 text-sm">
                                        <code>{selectedFileContent}</code>
                                    </pre>
                                </ScrollArea>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <div className="text-center">
                                    <FileIcon className="size-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Select a file to view its contents</p>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
