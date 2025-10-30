"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

const formSchema = z.object({
    value: z.string()
        .min(1, { message: "Please describe what you want to build" })
        .max(10000, { message: "Description is too long" }),
});

const suggestions = [
    "Create a Todo app",
    "Build a Netflix clone",
    "Develop a weather dashboard",
    "Create a blog platform",
    "Build a real-time chat app",
    "Create an e-commerce store",
    "Develop a personal finance tracker",
    "Build a recipe sharing app",
    "Create a fitness tracker",
    "Develop a project management tool",
];

export const ProjectForm = () => {
    const trpc = useTRPC();
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        }
    });

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            form.reset();
            router.push(`/projects/${data.id}`);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    }));

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('Form submitted with values:', values);
        try {
            await createProject.mutateAsync({
                value: values.value,
            });
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const onSuggestion = (text: string) => {
        form.setValue("value", text, { shouldValidate: true });
    };

    const isPending = createProject.isPending;
    console.log('Form state:', { isPending, errors: form.formState.errors, isValid: form.formState.isValid });

    return (
        <Card className="p-6">
            <div className="mb-4 text-center">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <SparklesIcon className="size-6 text-primary" />
                    Create New Project
                </h2>
                <p className="text-muted-foreground mt-1">
                    Describe what you want to build and let AI create it for you
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <div>
                                <TextareaAutosize
                                    {...field}
                                    disabled={isPending}
                                    minRows={2}
                                    maxRows={10}
                                    className="w-full resize-none rounded-lg p-3 outline-none border-2 border-primary focus:border-gray-300 transition-colors disabled:opacity-50 bg-background text-foreground placeholder:text-muted-foreground"
                                    placeholder="E.g., Create a todo list app with dark mode support..."
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                            e.preventDefault();
                                            form.handleSubmit(onSubmit)();
                                        }
                                    }}
                                />
                                {form.formState.errors.value && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {form.formState.errors.value.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full"
                        size="lg"
                    >
                        {isPending ? (
                            <>
                                <Loader2Icon className="size-4 mr-2 animate-spin" />
                                Creating Project...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="size-4 mr-2" />
                                Create Project
                            </>
                        )}
                    </Button>

                    {/* Suggestions */}
                    <div className="pt-1">
                        <p className="text-xs text-muted-foreground mb-2 text-center">Try one of these</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {suggestions.map((text) => (
                                <Button
                                    key={text}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full transition-colors hover:bg-primary/10 hover:border-primary hover:text-primary hover:shadow-md "
                                    disabled={isPending}
                                    onClick={() => onSuggestion(text)}
                                >
                                    {text}
                                </Button>
                            ))}
                        </div>
                    </div>
                </form>
            </Form>
        </Card>
    );
};
